"use client";

import Link from "next/link";
import {
  CalendarCheck,
  ClipboardPen,
  FileSignature,
  Handshake,
  LogIn,
  MoveRight,
  Truck,
} from "lucide-react";
import {
  CattleIcon,
  TransportTruckIcon,
  WheatIcon,
} from "@/components/paddockme/AnimalIcons";
import { cn } from "@/lib/utils";

const marketingLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "About Us", href: "#about" },
  { label: "Support", href: "#support" },
];

const roleChoices = [
  {
    href: "/listings",
    icon: CattleIcon,
    title: "I Need Feed",
    subtitle: "Find agistment land",
    accent: false,
  },
  {
    href: "/listings/new",
    icon: WheatIcon,
    title: "I Have Feed",
    subtitle: "List my property",
    accent: true,
  },
  {
    href: "/transport/jobs",
    icon: TransportTruckIcon,
    title: "Transport",
    subtitle: "Find transport jobs",
    accent: false,
  },
];

const howItWorks = [
  { n: 1, label: "Create a request", icon: ClipboardPen },
  { n: 2, label: "Connect with farmers", icon: Handshake },
  { n: 3, label: "Agree terms", icon: FileSignature },
  { n: 4, label: "Organise transport", icon: Truck },
  { n: 5, label: "Move stock", icon: CalendarCheck },
];

const recentActivity = [
  {
    icon: CattleIcon,
    text: "120 head seeking feed near Dubbo NSW",
  },
  {
    icon: WheatIcon,
    text: "80 acres available near Wagga Wagga",
  },
  {
    icon: TransportTruckIcon,
    text: "Transport available Sydney → Tamworth",
  },
];

export function LandingMarketing() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-cream text-bark">
      <div className="relative">
        {/* Header — overlays the hero image */}
        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
            <Link href="/" className="font-display text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage">
              <span className="text-warm-white">Paddock</span>
              <span className="text-ochre">ME</span>
            </Link>
            <nav
              aria-label="Main"
              className="hidden items-center gap-6 text-sm font-medium text-warm-white/85 md:flex"
            >
              {marketingLinks.map((l) => (
                <a key={l.label} href={l.href} className="hover:text-warm-white">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-warm-white/40 px-4 text-sm font-bold text-warm-white transition hover:bg-warm-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex min-h-11 items-center rounded-[8px] bg-ochre px-4 text-sm font-bold text-bark transition hover:bg-ochre/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section
          className="relative flex min-h-[560px] flex-col justify-center bg-sage-deep bg-cover bg-center px-5 pb-24 pt-28 md:px-8"
          style={{ backgroundImage: "url(/images/paddockme/hero-homepage.jpg)" }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-sage-deep/85 via-sage-deep/55 to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-6xl">
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-warm-white sm:text-5xl">
              Find Feed. Find Stock. Move Livestock.
            </h1>
            <p className="mt-4 max-w-md text-base text-warm-white/85">
              Australia&apos;s trusted platform for agistment and livestock
              transport.
            </p>
            <div className="mt-10 flex flex-col gap-4 lg:flex-row">
              {roleChoices.map(({ href, icon: Icon, title, subtitle, accent }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex flex-1 items-center gap-4 rounded-[8px] px-6 py-5 shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                    accent ? "bg-ochre text-bark" : "bg-sage-deep text-warm-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px]",
                      accent ? "bg-bark/10" : "bg-warm-white/10",
                    )}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-base font-bold uppercase tracking-wide">
                      {title}
                    </span>
                    <span className={cn("block text-sm", accent ? "text-bark/70" : "text-warm-white/70")}>
                      {subtitle}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="px-5 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-extrabold text-bark">
            How It Works
          </h2>
          <ol className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {howItWorks.map(({ n, label, icon: Icon }) => (
              <li key={n} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-deep text-warm-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-bold text-ochre">Step {n}</span>
                <span className="text-sm font-medium text-bark">{label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recent activity */}
      <section className="bg-sage-mist px-5 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-extrabold text-bark">
            Recent Activity
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {recentActivity.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[8px] border border-sage-deep/10 bg-warm-white p-4 shadow-[0_8px_24px_rgba(31,42,36,0.05)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-sage-deep text-warm-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-bark">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer banner */}
      <footer className="relative" id="about">
        <div
          className="flex min-h-[160px] items-center bg-sage-deep bg-cover bg-center px-5 md:px-8"
          style={{ backgroundImage: "url(/images/paddockme/footer-australian-farm.jpg)" }}
        >
          <div className="absolute inset-0 bg-sage-deep/60" aria-hidden />
          <p className="relative mx-auto w-full max-w-6xl text-lg font-bold italic text-warm-white">
            Built for farmers. Backed by Australia.
            <MoveRight className="ml-2 inline h-5 w-5" aria-hidden />
          </p>
        </div>
        <div
          className="bg-sage-deep px-5 py-4 text-center text-xs text-warm-white/60 md:px-8"
          id="support"
        >
          © {new Date().getFullYear()} PaddockME · Support: support@paddockme.com.au
        </div>
      </footer>
    </main>
  );
}
