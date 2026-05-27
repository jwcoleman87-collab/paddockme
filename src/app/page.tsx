"use client";

import Link from "next/link";
import { ArrowRight, Sprout, Truck } from "lucide-react";

// Each landing action doubles as a "Start as..." persona picker. Clicking a
// tile writes the matching persona id to the same localStorage keys the rest
// of the app reads from, then dispatches the persona-change event so any
// already-mounted client component (header avatar, intro banner) refreshes
// without waiting for a remount.
const homeActions = [
  {
    href: "/request/new",
    label: "Need agistment",
    description: "Place livestock",
    icon: ArrowRight,
    personaId: "farmer-a", // Dale Morgan - Livestock Owner
  },
  {
    href: "/listings/new",
    label: "Have Agistment",
    description: "List paddocks",
    icon: Sprout,
    personaId: "farmer-b", // Brett Donnelly - Landowner
  },
  {
    href: "/transport/available",
    label: "Need Transport",
    description: "Find a run",
    icon: Truck,
    personaId: "driver-1", // Wayne Hayes - Transport Provider
  },
];

function selectPersona(personaId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("paddockme.profile.persona", personaId);
    window.localStorage.setItem("paddockme.agreements.persona", personaId);
    window.dispatchEvent(new Event("paddockme:persona-change"));
  } catch {
    // private mode / quota exceeded - the destination page will fall back to
    // route-based persona detection in AppShellHeaderUser.
  }
}

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-warm-white pb-28 text-bark">
      <header className="mx-auto flex max-w-7xl items-center px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl text-sage-deep">
          PaddockME
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
          {homeActions.map(({ href, label, description, icon: Icon, personaId }) => (
            <Link
              key={href}
              href={href}
              onClick={() => selectPersona(personaId)}
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
