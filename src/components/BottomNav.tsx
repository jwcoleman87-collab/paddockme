"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV, isNavItemActive } from "@/components/appNav";
import { cn } from "@/lib/utils";

/**
 * Mobile tab bar (hidden on lg+ where the sidebar takes over). Renders the
 * same sections as the sidebar so the site feels like one place everywhere.
 */
export function BottomNav() {
  const pathname = usePathname();
  const items = APP_NAV.filter((item) => item.mobile);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sage-deep/10 bg-warm-white/96 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
    >
      <div className="relative mx-auto max-w-2xl">
        <div className="relative grid grid-cols-5 gap-1 py-1.5">
          {items.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[8px] px-1 text-[0.68rem] font-bold transition sm:min-h-16 sm:px-2 sm:text-xs",
                  active
                    ? "bg-sage-deep text-warm-white shadow-sm"
                    : "text-stone hover:bg-sage-mist hover:text-sage-deep"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
