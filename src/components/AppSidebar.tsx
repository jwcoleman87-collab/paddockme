"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, isNavItemActive } from "@/components/appNav";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation sidebar (lg and up). Always-visible wayfinding: the
 * current section is highlighted so users know where they are at a glance.
 * Mirrors the mobile tab bar - one navigation truth, two presentations.
 * Children slot renders the profile chip + sign out at the bottom.
 */
export function AppSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Primary"
      className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-mist bg-warm-white px-3 py-5 lg:flex print:hidden"
    >
      <Link
        href="/agreements"
        className="mb-6 px-2 font-display text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      >
        <span className="text-bark">Paddock</span>
        <span className="text-ochre">ME</span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Sections">
        {APP_NAV.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                active
                  ? "bg-sage-mist font-bold text-sage-deep"
                  : "text-bark/70 hover:bg-cream hover:text-sage-deep"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-mist pt-4">{children}</div>
    </aside>
  );
}
