import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { ButtonLink } from "@/components/Button";

const topNav = [
  { href: "/request/new", label: "Need agistment" },
  { href: "/listings", label: "Paddocks" },
  { href: "/agreements", label: "Agreements" },
  { href: "/map", label: "Map" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-warm-white text-bark">
      <header className="sticky top-0 z-30 border-b border-mist bg-warm-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/"
            className="font-display text-2xl text-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            PaddockME
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {topNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-bark/70 transition hover:bg-sage-mist hover:text-sage-deep"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ButtonLink href="/listings/new" className="hidden md:inline-flex">
            Offer agistment
          </ButtonLink>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-7 pb-28 md:px-8 md:py-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
