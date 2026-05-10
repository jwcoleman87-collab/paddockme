import Link from "next/link";

/**
 * Marketing-side layout — simple top bar + footer.
 * No bottom nav (that lives in the app shell under /app/*).
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="absolute top-0 inset-x-0 z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-cream">
          <Link href="/" className="font-display italic text-2xl tracking-tight">
            PaddockME
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/sign-in" className="hover:text-sage-glow transition">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-ochre px-4 py-2 font-medium text-sage-deep hover:bg-ochre-light transition"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-mist bg-cream py-8 text-center text-sm text-stone">
        <p>
          PaddockME — Australian agistment marketplace. Built in Tasmania, for
          paddocks everywhere.
        </p>
      </footer>
    </div>
  );
}
