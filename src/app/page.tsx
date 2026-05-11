import Link from "next/link";
import { ArrowRight, Handshake, Map, Sprout, Truck } from "lucide-react";
import { Card } from "@/components/Card";

const homeActions = [
  {
    href: "/request/new",
    label: "Need Agistment",
    shortLabel: "Need Agistment",
    helper: "Place livestock",
    icon: ArrowRight,
  },
  {
    href: "/listings/new",
    label: "Offer Agistment",
    shortLabel: "Offer Agistment",
    helper: "List paddocks",
    icon: Sprout,
  },
  {
    href: "/map",
    label: "Regional map",
    shortLabel: "Map",
    helper: "View pressure",
    icon: Map,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-warm-white pb-28 text-bark">
      <header className="mx-auto flex max-w-7xl items-center px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl text-sage-deep">
          PaddockME
        </Link>
      </header>

      <section className="mx-auto flex min-h-[calc(100dvh-5.25rem)] max-w-7xl flex-col px-5 pb-5 md:px-8">
        <div className="grid flex-1 items-center gap-10 py-8 md:grid-cols-[1.05fr_0.95fr] md:py-14">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ochre">
              Australian agistment coordination
            </p>
            <h1 className="font-display text-5xl leading-tight text-sage-deep md:text-7xl">
              Coordination is expensive.
            </h1>
            <p className="mt-6 max-w-[21rem] break-words text-lg leading-relaxed text-bark/75 sm:max-w-2xl md:text-xl">
              PaddockME removes hidden coordination costs between livestock,
              land and transport.
            </p>
          </div>

          <div className="hidden min-w-0 gap-4 md:grid">
            <Card className="min-w-0 bg-sage-deep text-cream">
              <Handshake className="mb-5 h-8 w-8 text-sage-glow" aria-hidden />
              <h2 className="text-2xl font-bold">Agreement-first workflow</h2>
              <p className="mt-3 break-words leading-relaxed text-sage-glow">
                Requests, paddock details, transport needs and agreement terms
                move into one shared workspace.
              </p>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Feature icon={<Truck />} title="Transport" text="Coordinate pickup, destination and driver updates separately." />
              <Feature icon={<Map />} title="Regions" text="See availability and pressure as a placeholder intelligence layer." />
            </div>
          </div>
        </div>

      </section>

      <nav
        aria-label="Choose a starting point"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid max-w-[22.5rem] grid-cols-3 gap-2 rounded-[1.75rem] border border-mist/90 bg-warm-white/95 p-2 shadow-[0_18px_45px_rgba(44,80,48,0.16)] backdrop-blur sm:mx-auto sm:max-w-4xl">
          {homeActions.map(({ href, label, shortLabel, helper, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-sage-deep transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage sm:min-h-18"
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="max-w-[5.75rem] whitespace-normal text-[0.82rem] font-bold leading-tight sm:max-w-none sm:text-sm">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              <span className="hidden text-xs font-medium text-bark/55 sm:inline">
                {helper}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="min-w-0">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        {icon}
      </div>
      <h2 className="font-bold text-sage-deep">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-bark/70">{text}</p>
    </Card>
  );
}
