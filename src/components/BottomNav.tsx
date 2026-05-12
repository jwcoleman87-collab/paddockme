"use client";

import Link from "next/link";
import { FileText, Home, Map, Search, Sprout } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/agreements", label: "Home", icon: Home, match: ["/agreements", "/home"] },
  { href: "/request/new", label: "Request", icon: Search },
  { href: "/listings", label: "Paddocks", icon: Sprout },
  {
    href: "/workspace/agreement-glenbarra",
    label: "Agreement",
    icon: FileText,
    match: ["/workspace"],
  },
  { href: "/map", label: "Map", icon: Map },
];

export function BottomNav() {
  const pathname = usePathname();

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
              key={href}
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
