import Link from "next/link";
import {
  ClipboardList,
  Handshake,
  FileSignature,
  Truck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Post a request",
    body: "Tell us what stock you're moving, when, and what you need.",
  },
  {
    icon: Handshake,
    title: "Get matched",
    body: "We connect you with landowners or livestock owners nearby.",
  },
  {
    icon: FileSignature,
    title: "Agree the details",
    body: "Negotiate price, dates and terms together in one workspace.",
  },
  {
    icon: Truck,
    title: "Move your stock",
    body: "Line up transport and track the job through to completion.",
  },
];

/**
 * Public marketing homepage shown to signed-out visitors. Signed-in users
 * are redirected to /agreements before this ever renders (see page.tsx).
 */
export function PaddockHomepage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-sage-deep/10 bg-warm-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <span className="font-display text-xl">
            <span className="text-bark">Paddock</span>
            <span className="text-ochre">ME</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center rounded-[8px] px-4 text-sm font-semibold text-sage-deep transition hover:bg-sage-mist"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex min-h-11 items-center rounded-[8px] bg-sage-deep px-4 text-sm font-bold text-warm-white transition hover:bg-sage-dark"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-sage-mist">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-bark sm:text-5xl">
              Find feed. Find stock. Move livestock.
            </h1>
            <p className="mt-4 max-w-md text-base text-bark/80">
              PaddockME connects livestock owners, landowners and transport
              providers across regional Australia to coordinate agistment and
              stock movement in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center gap-2 rounded-[8px] bg-sage-deep px-6 font-bold text-warm-white transition hover:bg-sage-dark"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center rounded-[8px] border border-sage-deep/20 bg-warm-white px-6 font-bold text-sage-deep transition hover:bg-sage-mist"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <h2 className="text-center text-2xl font-extrabold text-bark">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="rounded-[8px] border border-sage-deep/10 bg-warm-white p-5 text-center shadow-[0_8px_24px_rgba(31,42,36,0.05)]"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage-deep text-warm-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ochre">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-sm font-bold text-bark">{title}</h3>
                <p className="mt-2 text-sm text-bark/75">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-sage-deep/10 bg-warm-white px-5 py-6 text-center text-xs text-bark/60 md:px-8">
        © {new Date().getFullYear()} PaddockME · Support:{" "}
        <a href="mailto:support@paddockme.com.au" className="underline">
          support@paddockme.com.au
        </a>
      </footer>
    </div>
  );
}
