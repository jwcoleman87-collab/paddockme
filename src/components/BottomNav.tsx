"use client";

import Link from "next/link";
import { Handshake, Map, Search, Sprout, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/request/new", label: "Request", icon: Search },
  { href: "/listings", label: "Paddocks", icon: Sprout },
  { href: "/agreements", label: "Deals", icon: Handshake },
  { href: "/map", label: "Map", icon: Map },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-warm-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-5 px-2 pb-2 pt-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition",
                active
                  ? "bg-sage-mist text-sage-deep"
                  : "text-bark/65 hover:bg-cream hover:text-sage-deep"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
