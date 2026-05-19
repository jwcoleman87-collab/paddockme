import Link from "next/link";
import { Suspense } from "react";
import { AppShellHeaderUser } from "@/components/AppShellHeaderUser";
import { BottomNav } from "@/components/BottomNav";
import { FlashProvider } from "@/components/FlashProvider";
import { HeaderInboxLink } from "@/components/HeaderInboxLink";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FlashProvider>
      <div className="min-h-dvh overflow-x-hidden bg-warm-white text-bark">
        <header className="sticky top-0 z-30 bg-warm-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 md:px-8">
            <Link
              href="/"
              className="font-display text-xl text-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              PaddockME
            </Link>
            <div className="flex items-center gap-2">
              <HeaderInboxLink />
              <Link
                href="/profile"
                aria-label="Open profile"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mist bg-cream pl-1.5 pr-3 text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <Suspense fallback={null}>
                  <AppShellHeaderUser />
                </Suspense>
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-7 pb-32 md:px-8 md:py-10 md:pb-36">
          {children}
        </main>
        <BottomNav />
      </div>
    </FlashProvider>
  );
}
