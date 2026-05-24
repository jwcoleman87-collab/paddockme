"use client";

import Link from "next/link";
import { Home, Map, MessageSquare, Search, Sprout } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/agreements",
    label: "Home",
    icon: Home,
    match: ["/agreements", "/home"],
  },
  { href: "/request/new", label: "Request", icon: Search },
  { href: "/listings", label: "Paddocks", icon: Sprout },
  {
    href: "/workspace/agreement-glenbarra",
    label: "Workspace",
    icon: MessageSquare,
    match: ["/workspace"],
  },
  { href: "/map", label: "Map", icon: Map },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-40 px-3 pb-[env(safe-area-inset-bottom)] sm:bottom-6"
    >
      <div className="relative mx-auto max-w-[22.5rem] sm:max-w-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-5 -inset-y-4 rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,rgba(245,242,232,0.98)_0%,rgba(245,242,232,0.78)_42%,rgba(221,180,87,0.22)_70%,rgba(34,84,52,0)_100%)] blur-md"
        />
        <div className="relative grid grid-cols-5 gap-1 rounded-[1.75rem] border border-stone/25 bg-warm-white/96 p-2 shadow-[0_18px_45px_rgba(44,80,48,0.18)] backdrop-blur">
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
                  : "text-bark/65 hover:bg-cream hover:text-sage-deep"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
