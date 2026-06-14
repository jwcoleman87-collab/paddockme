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
            <Link key={l.label} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <PmButton
            variant="ghost"
            href="/login"
            className="border border-white/40 px-4 py-2 text-white hover:bg-white/10 min-h-0"
          >
            Log In
          </PmButton>
          <PmButton variant="accent" href="/register" className="px-4 py-2 min-h-0">
            Sign Up
          </PmButton>
        </div>
      </div>
    </header>
  );
}

/* ---------- AppNav: the 5-item MVP navigation ---------- */

const appLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Requests", href: "/requests/matches", icon: ClipboardList },
  { label: "Workspaces", href: "/workspaces/1023", icon: MessagesSquare },
  { label: "Active Agreements", href: "/workspaces/1023/review", icon: FileCheck2 },
  { label: "Profile", href: "/account", icon: User },
];

/**
 * Dark green bottom navigation bar (per mock-up). On desktop it spans the
 * bottom of the viewport; on mobile labels shrink but stay visible.
 */
export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="App"
      className="sticky bottom-0 z-30 border-t border-white/10 bg-pm-green-900"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <PaddockMeLogo variant="light" className="hidden text-lg sm:block" />
        <div className="flex flex-1 items-center justify-around sm:justify-end sm:gap-8">
          {appLinks.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex min-h-[44px] flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium sm:flex-row sm:gap-2 sm:text-sm",
                  active
                    ? "text-pm-gold-500"
                    : "text-white/75 hover:text-white",
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
