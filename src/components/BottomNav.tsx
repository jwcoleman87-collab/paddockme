"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
  BriefcaseBusiness,
  FileText,
  Home,
  Inbox,
  Map,
  MessageSquare,
  Search,
  Sprout,
  Truck,
  User,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const farmerNavItems = [
  { href: "/agreements", label: "Home", icon: Home, match: ["/agreements", "/home"] },
  { href: "/request/new", label: "Search", icon: Search },
  { href: "/listings?request=request-100-cattle", label: "Paddocks", icon: Sprout, match: ["/listings"] },
  {
    href: "/workspace/agreement-glenbarra",
    label: "Agreements",
    icon: FileText,
    match: ["/workspace"],
  },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

const landownerNavItems = [
  { href: "/landowner", label: "Home", icon: Home, match: ["/landowner"] },
  { href: "/listings/new", label: "My paddocks", icon: Sprout },
  { href: "/landowner#requests", label: "Requests in", icon: Inbox },
  { href: "/workspace/agreement-glenbarra?as=landowner", label: "Agreements", icon: FileText },
  { href: "/messages?as=landowner", label: "Messages", icon: MessageSquare },
];

const driverNavItems = [
  { href: "/jobs", label: "Jobs", icon: Truck, match: ["/jobs"] },
  { href: "/runs", label: "My runs", icon: BriefcaseBusiness, match: ["/runs"] },
  { href: "/messages?as=driver", label: "Messages", icon: MessageSquare },
  { href: "/map?as=driver", label: "Map", icon: Map },
  { href: "/profile?as=driver", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <Suspense fallback={<BottomNavFrame navItems={farmerNavItems} persona="farmer" pathname="" />}>
      <BottomNavInner />
    </Suspense>
  );
}

function BottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const persona = getPersona(pathname, searchParams);
  const navItems =
    persona === "driver"
      ? driverNavItems
      : persona === "landowner"
        ? landownerNavItems
        : farmerNavItems;

  return <BottomNavFrame navItems={navItems} persona={persona} pathname={pathname} />;
}

function BottomNavFrame({
  navItems,
  persona,
  pathname,
}: {
  navItems: typeof farmerNavItems;
  persona: string;
  pathname: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid max-w-[22.5rem] grid-cols-5 gap-1 rounded-[1.75rem] border border-mist/90 bg-warm-white/95 p-2 shadow-[0_18px_45px_rgba(44,80,48,0.16)] backdrop-blur sm:mx-auto sm:max-w-4xl">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active =
            pathname === href ||
            pathname.startsWith(href + "/") ||
            match?.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
          return (
            <Link
              key={`${persona}-${label}`}
              href={href}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1 text-[0.68rem] font-semibold transition sm:min-h-16 sm:px-2 sm:text-xs",
                active
                  ? "bg-sage-deep text-cream shadow-sm"
                  : "text-bark/85 hover:bg-cream hover:text-sage-deep"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function getPersona(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>
) {
  const explicit = searchParams.get("as");
  if (explicit === "driver" || searchParams.has("driver") || pathname.startsWith("/jobs") || pathname.startsWith("/runs")) {
    return "driver";
  }
  if (
    explicit === "landowner" ||
    searchParams.has("published") ||
    pathname.startsWith("/landowner") ||
    pathname.startsWith("/listings/new")
  ) {
    return "landowner";
  }
  return "farmer";
}
