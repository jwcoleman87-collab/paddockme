import {
  ArrowRight,
  CheckCircle2,
  ClipboardPen,
  FileCheck2,
  LandPlot,
  MapPinned,
  ShieldCheck,
  Truck,
  Wheat,
} from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { PrimaryNav } from "@/components/paddockme/PmNav";
import { RoleChoiceCard } from "@/components/paddockme/PmCards";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";

const journey = [
  {
    label: "Tell us what you need",
    detail: "Post stock needing feed or list available grazing.",
    icon: ClipboardPen,
  },
  {
    label: "Choose the right match",
    detail: "Review suitable paddocks without ringing around.",
    icon: MapPinned,
  },
  {
    label: "Agree the details",
    detail: "Keep the terms and decisions together in one place.",
    icon: FileCheck2,
  },
  {
    label: "Arrange the move",
    detail: "Send an RFT and follow transport through to arrival.",
    icon: Truck,
  },
];

const assurances = [
  {
    title: "Built around the job",
    detail: "One clear next action, from finding feed through to the move.",
    icon: CheckCircle2,
  },
  {
    title: "Your details stay controlled",
    detail: "Private agreement information is kept between the right parties.",
    icon: ShieldCheck,
  },
  {
    title: "Made for rural conditions",
    detail: "Large controls, plain language and honest connection states.",
    icon: LandPlot,
  },
];

/** Public entry point: understand the product, choose a job, take one action. */
export function PaddockHomepage() {
  return (
    <div className="min-h-screen bg-pm-cream-50 text-pm-charcoal">
      <div className="relative overflow-hidden bg-pm-green-900">
        <PrimaryNav />
        <section className="relative px-4 pb-12 pt-28 sm:px-6 sm:pb-16 lg:pb-20 lg:pt-36">
          <div
            className="absolute inset-0 bg-cover bg-[center_42%] opacity-40"
            style={{ backgroundImage: `url(${paddockmeImages.homepageHero})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-pm-green-900/65" aria-hidden />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
                <Wheat className="h-4 w-4" aria-hidden />
                Australian agistment and transport
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Match stock with feed. Then get them there.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                PaddockME keeps the request, agreement and livestock movement
                together, so less time is lost coordinating the job.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <PmButton href="/sign-up" variant="accent" className="sm:min-w-44">
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </PmButton>
                <PmButton
                  href="#choose-your-path"
                  variant="ghost"
                  className="border border-white/35 text-white hover:bg-white/10 sm:min-w-44"
                >
                  Choose what you need
                </PmButton>
              </div>
            </div>

            <aside className="border-l-4 border-pm-gold-500 bg-pm-cream-50 p-5 shadow-lg sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-pm-gold-600">
                The whole job, connected
              </p>
              <p className="mt-2 text-xl font-extrabold text-pm-charcoal">
                Request → match → agree → move
              </p>
              <p className="mt-2 text-sm leading-6 text-pm-muted">
                Each completed step points clearly to the next one, so the job keeps moving without more ringing around.
              </p>
            </aside>
          </div>
        </section>
      </div>

      <main>
        <section id="choose-your-path" className="scroll-mt-6 px-4 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-pm-gold-600">
                Start with your job
              </p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                What needs doing today?
              </h2>
              <p className="mt-3 leading-7 text-pm-muted">
                Pick the path that fits now. You can add another role to your account later.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <RoleChoiceCard
                href="/request/new"
                icon={<CattleIcon className="h-6 w-6" />}
                title="I need feed"
                subtitle="Create an agistment request"
                actionLabel="Find a paddock"
              />
              <RoleChoiceCard
                href="/listings/new"
                icon={<Wheat className="h-6 w-6" aria-hidden />}
                title="I have grazing"
                subtitle="List available paddock capacity"
                actionLabel="List a paddock"
                accent
              />
              <RoleChoiceCard
                href="/transport/jobs"
                icon={<Truck className="h-6 w-6" aria-hidden />}
                title="I move livestock"
                subtitle="Review Requests for Transport"
                actionLabel="Open the RFT board"
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-pm-border bg-white px-4 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-pm-gold-600">
                  One connected run
                </p>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  From the first request to stock arriving
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-pm-muted">
                PaddockME replaces scattered calls and messages with a visible next step.
              </p>
            </div>

            <ol className="mt-9 grid gap-px overflow-hidden border border-pm-border bg-pm-border sm:grid-cols-2 lg:grid-cols-4">
              {journey.map(({ label, detail, icon: Icon }, index) => (
                <li key={label} className="bg-pm-cream-50 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center bg-pm-green-900 text-white">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-sm font-extrabold text-pm-gold-600">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-extrabold">{label}</h3>
                  <p className="mt-2 text-sm leading-6 text-pm-muted">{detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="px-4 py-12 sm:px-6 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-2xl text-2xl font-extrabold sm:text-3xl">
              Calm on screen. Clear in the paddock.
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {assurances.map(({ title, detail, icon: Icon }) => (
                <article key={title} className="border border-pm-border bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-pm-green-900" aria-hidden />
                  <h3 className="mt-4 font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-pm-muted">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="support" className="border-t border-white/10 bg-pm-green-900 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-extrabold">PaddockME</p>
            <p className="mt-1 text-sm text-white/65">Built for Australian farmers and carriers.</p>
          </div>
          <div className="text-sm text-white/70 sm:text-right">
            <a className="min-h-11 py-3 underline underline-offset-4" href="mailto:support@paddockme.com.au">
              support@paddockme.com.au
            </a>
            <p>© {new Date().getFullYear()} PaddockME</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
