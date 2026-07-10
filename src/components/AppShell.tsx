import Link from "next/link";
import { Suspense } from "react";
import { AppShellHeaderUser } from "@/components/AppShellHeaderUser";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { DemoResetButton } from "@/components/DemoResetButton";
import { FlashProvider } from "@/components/FlashProvider";
import { HeaderInboxLink } from "@/components/HeaderInboxLink";
import { SignOutButton } from "@/components/SignOutButton";

/**
 * Application shell. Desktop (lg+) gets the persistent left sidebar for
 * wayfinding; smaller screens keep the slim top header and the bottom tab
 * bar. One navigation truth (appNav.ts), two presentations.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FlashProvider>
      <div className="min-h-dvh overflow-x-hidden bg-transparent text-bark lg:flex">
        <AppSidebar>
          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              aria-label="Open profile"
              className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-sage-deep/10 bg-warm-white pl-1.5 pr-3 text-sage-deep shadow-sm transition hover:border-sage/35 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <Suspense fallback={null}>
                <AppShellHeaderUser />
              </Suspense>
            </Link>
            <div className="flex items-center gap-2">
              <SignOutButton />
              <DemoResetButton />
            </div>
          </div>
        </AppSidebar>

        <div className="flex min-h-dvh w-full min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-sage-deep/10 bg-warm-white/92 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 md:px-8">
              <Link
                href="/agreements"
                className="font-display text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <span className="text-bark">Paddock</span>
                <span className="text-ochre">ME</span>
              </Link>
              <div className="flex items-center gap-2">
                <HeaderInboxLink />
                <DemoResetButton />
                <SignOutButton />
                <Link
                  href="/profile"
                  aria-label="Open profile"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-sage-deep/10 bg-warm-white pl-1.5 pr-3 text-sage-deep shadow-sm transition hover:border-sage/35 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  <Suspense fallback={null}>
                    <AppShellHeaderUser />
                  </Suspense>
                </Link>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-7 pb-32 md:px-8 md:py-10 md:pb-36 lg:pb-12">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </FlashProvider>
  );
}
