"use client";

import Link from "next/link";
import { ArrowRight, LogIn, Sprout, Truck } from "lucide-react";

const homeActions = [
  {
    href: "/listings",
    label: "Need agistment",
    description: "Browse paddocks",
    icon: ArrowRight,
  },
  {
    href: "/requests",
    label: "Have Agistment",
    description: "See requests",
    icon: Sprout,
  },
  {
    href: "/transport/jobs",
    label: "Need Transport",
    description: "Browse jobs",
    icon: Truck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-warm-white pb-28 text-bark">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl text-sage-deep">
          PaddockME
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] border border-ochre/35 bg-ochre-light/80 px-3.5 text-sm font-bold text-sage-deep shadow-sm shadow-bark/5 transition hover:border-sage-glow hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
          aria-label="Log in to your PaddockME account"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100dvh-5.25rem)] max-w-7xl flex-col justify-center px-5 pb-5 md:px-8">
        <div className="max-w-4xl py-8 md:py-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ochre">
            Australian agistment coordination
          </p>
          <h1 className="font-display text-5xl leading-tight text-sage-deep md:text-7xl">
            Coordination is expensive.
          </h1>
          <p className="mt-6 max-w-[21rem] break-words text-lg leading-relaxed text-bark/75 sm:max-w-2xl md:text-xl">
            PaddockME removes hidden coordination costs between livestock, land
            and transport.
          </p>
        </div>
      </section>

      <nav
        aria-label="Choose a starting point"
        className="fixed inset-x-0 bottom-6 z-40 px-3 sm:bottom-8"
      >
        <div className="mx-auto grid max-w-[24rem] grid-cols-3 gap-2 rounded-[1.75rem] border border-mist/90 bg-warm-white/95 p-2 shadow-[0_18px_45px_rgba(44,80,48,0.16)] backdrop-blur sm:max-w-4xl">
          {homeActions.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[4.35rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-sage-deep transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage sm:min-h-[4.75rem]"
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-[6rem] whitespace-normal text-[0.82rem] font-bold leading-tight sm:max-w-none sm:text-sm">
                {label}
              </span>
              <span className="max-w-[6.5rem] truncate text-[0.68rem] font-semibold leading-none text-stone sm:max-w-none sm:text-xs">
                {description}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
