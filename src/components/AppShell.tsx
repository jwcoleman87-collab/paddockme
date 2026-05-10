import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { User } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-warm-white text-bark">
      <header className="sticky top-0 z-30 bg-warm-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="text-xl font-extrabold text-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            PaddockME
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist bg-cream text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <User className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-7 pb-32 md:px-8 md:py-10 md:pb-36">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
