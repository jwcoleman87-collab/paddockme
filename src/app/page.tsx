import Link from "next/link";
import { ArrowRight, Handshake, Map, Sprout, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-warm-white text-bark">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl text-sage-deep">
          PaddockME
        </Link>
        <ButtonLink href="/request/new" variant="secondary">
          Open app
        </ButtonLink>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ochre">
            Australian agistment coordination
          </p>
          <h1 className="font-display text-5xl leading-tight text-sage-deep md:text-7xl">
            Coordination is expensive.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bark/75 md:text-xl">
            PaddockME removes hidden coordination costs between livestock, land
            and transport.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/request/new">
              Need agistment
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/listings/new" variant="secondary">
              Offer agistment
            </ButtonLink>
            <ButtonLink href="/map" variant="ghost">
              View regional map
            </ButtonLink>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="bg-sage-deep text-cream">
            <Handshake className="mb-5 h-8 w-8 text-sage-glow" aria-hidden />
            <h2 className="text-2xl font-bold">Agreement-first workflow</h2>
            <p className="mt-3 leading-relaxed text-sage-glow">
              Requests, paddock details, transport needs and agreement terms
              move into one shared workspace.
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Feature icon={<Sprout />} title="Land" text="List paddocks, feed, water and fencing without a broker." />
            <Feature icon={<Truck />} title="Transport" text="Coordinate pickup, destination and driver updates separately." />
            <Feature icon={<Map />} title="Regions" text="See availability and pressure as a placeholder intelligence layer." />
            <Feature icon={<ArrowRight />} title="Low typing" text="Large touch targets, chips, checklists and clear next steps." />
          </div>
        </div>
      </section>
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
    <Card>
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        {icon}
      </div>
      <h2 className="font-bold text-sage-deep">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-bark/70">{text}</p>
    </Card>
  );
}
