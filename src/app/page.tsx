import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const parties = [
  {
    name: "Dale",
    role: "Farmer A",
    image: "/avatars/dale.jpg",
    value: "Needs feed and opens the agistment request.",
  },
  {
    name: "Brett",
    role: "Farmer B",
    image: "/avatars/brett.jpg",
    value: "Offers the paddock and agrees the terms.",
  },
  {
    name: "Wayne",
    role: "Driver",
    image: "/avatars/wayne.jpg",
    value: "Joins after the agreement to coordinate the movement.",
  },
];

const productScreens = [
  {
    label: "Agreement workspace",
    image: "/demo/workspace.png",
  },
  {
    label: "Transport room",
    image: "/demo/transport.png",
  },
  {
    label: "Paddock offer board",
    image: "/demo/requests.png",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-warm-white text-bark">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 sm:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center font-display text-2xl text-sage-deep">
          PaddockME
        </Link>
        <nav aria-label="Public navigation" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-bark/75 transition hover:text-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center rounded-full bg-sage-deep px-4 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-4 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pb-14 md:pt-10">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
            Agistment agreement workflow
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] text-sage-deep sm:text-6xl lg:text-7xl">
            Feed, paddocks and trucks in one room.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-bark/80 sm:text-xl">
            PaddockME replaces agistment phone tag with a shared workflow for livestock owners, landowners and stock transport.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/agreements"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sage-deep px-6 text-sm font-bold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
            >
              Start the agreement
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-sage-deep/30 bg-cream px-6 text-sm font-bold text-sage-deep transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-cream p-4 shadow-[0_18px_45px_rgba(44,80,48,0.08)] sm:p-5">
          <div className="rounded-xl bg-sage-deep p-5 text-cream">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sage-glow" aria-hidden />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-sage-glow">
                  Agreement story
                </p>
                <p className="mt-3 text-2xl font-bold leading-tight">
                  Dale needs feed. Brett has country. Once they agree, Wayne handles the cattle movement.
                </p>
              </div>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            <Metric label="Agreement" value="2 farmers" />
            <Metric label="Movement" value="1 driver" />
            <Metric label="Next unlock" value="Payments" />
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {parties.map((persona) => (
            <article
              key={persona.name}
              className="grid min-w-0 grid-cols-[4.5rem_1fr] gap-4 rounded-2xl border border-mist bg-cream p-4 sm:grid-cols-[5rem_1fr]"
            >
              <Image
                src={persona.image}
                alt={`${persona.name}, ${persona.role}`}
                width={96}
                height={96}
                className="h-18 w-18 rounded-xl object-cover sm:h-20 sm:w-20"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">
                  {persona.role}
                </p>
                <h2 className="mt-1 text-xl font-bold text-sage-deep">
                  {persona.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-bark/75">
                  {persona.value}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
              Product proof
            </p>
            <h2 className="mt-2 text-2xl font-bold text-sage-deep sm:text-3xl">
              One story from terms to transport.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-bark/70">
            Agreement terms come first, then transport joins when the movement needs coordination.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {productScreens.map((screen) => (
            <div
              key={screen.label}
              className="overflow-hidden rounded-2xl border border-sage-glow bg-sage-mist"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={screen.image}
                  alt={`${screen.label} screenshot`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <p className="border-t border-sage-glow bg-cream px-4 py-3 text-sm font-bold text-sage-deep">
                {screen.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8">
        <div className="rounded-2xl border border-mist bg-cream p-5 sm:p-6">
          <p className="max-w-3xl text-lg font-semibold leading-relaxed text-sage-deep">
            Next on the roadmap: secure payment and settlement rails after the agreement and transport workflow is stable.
          </p>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mist bg-warm-white px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-sage-deep">{value}</dd>
    </div>
  );
}
