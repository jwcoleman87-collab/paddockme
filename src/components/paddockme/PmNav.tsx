"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  MessagesSquare,
  FileCheck2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaddockMeLogo } from "./PaddockMeLogo";
import { PmButton } from "./PmButton";

/* ---------- PrimaryNav: public marketing header ---------- */

const marketingLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About Us", href: "/#about" },
  { label: "Support", href: "/#support" },
];

export function PrimaryNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <PaddockMeLogo variant="light" />
        <nav
          aria-label="Main"
          className="hidden items-center gap-6 text-sm font-medium text-white/85 md:flex"
        >
          {marketingLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="inline-flex min-h-11 items-center hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <PmButton
            variant="ghost"
            href="/sign-in"
            className="border border-white/40 px-4 py-2 text-white hover:bg-white/10"
          >
            Log In
          </PmButton>
          <PmButton variant="accent" href="/sign-up" className="px-4 py-2">
            Get started
          </PmButton>
        </div>
      </div>
    </header>
  );
}

/* ---------- AppNav: the 5-item MVP navigation ---------- */

// Five top-level destinations, each a place you can *be* — never a step in a
// flow. "Agreement" used to point at /workspaces/1023/review, which is the
// review-and-accept step of the workspace flow: promoting it to the nav bar
// made a workflow step look like a destination, and its href sat underneath
// Workspaces' so both items highlighted at once. It now points at the Live
// Agreement, which is where the deal is tracked and which has its own
// explained empty state before anything is live.
const appLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Requests", href: "/requests/matches", icon: ClipboardList },
  { label: "Workspaces", href: "/workspaces/1023", icon: MessagesSquare },
  { label: "Agreement", href: "/workspaces/1023/live", icon: FileCheck2 },
  { label: "Profile", href: "/account", icon: User },
];

/**
 * The single nav item matching the current path — the longest href that the
 * path sits under, so a nested destination never lights up its parent too.
 */
function activeNavHref(pathname: string): string | null {
  return appLinks
    .map((l) => l.href)
    .filter((href) =>
      href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`),
    )
    .sort((a, b) => b.length - a.length)[0] ?? null;
}

/**
 * Dark green bottom navigation bar (per mock-up). On desktop it spans the
 * bottom of the viewport; on mobile labels shrink but stay visible.
 */
export function AppBottomNav() {
  const pathname = usePathname();
  const activeHref = activeNavHref(pathname);
  return (
    <nav
      aria-label="App"
      className="sticky bottom-0 z-30 border-t border-white/10 bg-pm-green-900"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <span className="hidden items-center gap-2.5 sm:flex">
          <PaddockMeLogo variant="light" className="text-lg" />
        </span>
        <div className="flex flex-1 items-center justify-around sm:justify-end sm:gap-8">
          {appLinks.map(({ label, href, icon: Icon }) => {
            const active = href === activeHref;
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  // The gold is reinforced by a weight change and an
                  // underline rule, so "you are here" does not rely on
                  // colour alone.
                  "relative flex min-h-[44px] flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px] sm:flex-row sm:gap-2 sm:text-sm",
                  active
                    ? "font-bold text-pm-gold-500 after:absolute after:inset-x-1 after:-bottom-2 after:h-0.5 after:bg-pm-gold-500 after:content-['']"
                    : "font-medium text-white/75 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
