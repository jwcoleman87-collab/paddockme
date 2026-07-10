import {
  Wheat,
  Truck,
  ClipboardPen,
  Handshake,
  FileSignature,
  CalendarCheck,
  MoveRight,
  LandPlot,
} from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { PrimaryNav } from "@/components/paddockme/PmNav";
import { RoleChoiceCard, RecentActivityCard } from "@/components/paddockme/PmCards";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoRecentActivity } from "@/lib/paddockmeDemoData";

const howItWorks = [
  { n: 1, label: "Create a request", icon: ClipboardPen },
  { n: 2, label: "Connect with farmers", icon: Handshake },
  { n: 3, label: "Agree terms", icon: FileSignature },
  { n: 4, label: "Organise transport", icon: Truck },
  { n: 5, label: "Move stock", icon: CalendarCheck },
];

const activityIcons: Record<string, React.ReactNode> = {
  cattle: <CattleIcon className="h-5 w-5" />,
  land: <LandPlot className="h-5 w-5" aria-hidden />,
  truck: <Truck className="h-5 w-5" aria-hidden />,
};

/** Screen 1 — Homepage. Three obvious paths: Need Feed / Have Feed / Transport. */
export function PaddockHomepage() {
  return (
    <div className="min-h-screen bg-pm-cream-50">
      <div className="relative">
        <PrimaryNav />
        {/* Hero */}
        <section
          className="relative flex min-h-[520px] flex-col justify-center bg-pm-green-900 bg-cover bg-center px-4 pb-20 pt-28 sm:px-6"
          style={{ backgroundImage: `url(${paddockmeImages.homepageHero})` }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-pm-green-900/85 via-pm-green-900/55 to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-6xl">
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Find Feed. Find Stock. Move Livestock.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/85">
              Australia&apos;s trusted platform for agistment and livestock
              transport.
            </p>
            <p className="mt-3 max-w-md text-xs text-white/60">
              You&apos;re viewing a guided demonstration — the people and
              transaction shown are representative.
            </p>
            <div className="mt-10 flex flex-col gap-4 lg:flex-row">
              <RoleChoiceCard
                href="/requests/new"
                icon={<CattleIcon className="h-6 w-6" />}
                title="I Need Feed"
                subtitle="Find agistment land"
              />
              <RoleChoiceCard
                href="/landowner/requests/1023"
                icon={<Wheat className="h-6 w-6" aria-hidden />}
                title="I Have Feed"
                subtitle="List my property"
                accent
              />
              <RoleChoiceCard
                href="/transport/quotes/1023"
                icon={<Truck className="h-6 w-6" aria-hidden />}
                title="I Transport"
                subtitle="Find transport jobs"
              />
            </div>
          </div>
        </section>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-extrabold text-pm-charcoal">
            How It Works
          </h2>
          <ol className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {howItWorks.map(({ n, label, icon: Icon }) => (
              <li key={n} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pm-green-900 text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-bold text-pm-gold-600">
                  Step {n}
                </span>
                <span className="text-sm font-medium text-pm-charcoal">
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-pm-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-pm-muted">
            Recent Activity
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {demoRecentActivity.map((a) => (
              <RecentActivityCard
                key={a.headline}
                icon={activityIcons[a.icon]}
                headline={a.headline}
                detail={a.detail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer banner */}
      <footer className="relative" id="about">
        <div
          className="relative flex min-h-[160px] items-center bg-cover bg-center px-4 sm:px-6"
          style={{ backgroundImage: `url(${paddockmeImages.footerFarmBanner})` }}
        >
          <div className="absolute inset-0 bg-pm-green-900/60" aria-hidden />
          <p className="relative mx-auto w-full max-w-6xl text-lg font-bold italic text-white">
            Built for farmers. Backed by Australia.
            <MoveRight className="ml-2 inline h-5 w-5" aria-hidden />
          </p>
        </div>
        <div
          className="bg-pm-green-900 px-4 py-4 text-center text-xs text-white/60 sm:px-6"
          id="support"
        >
          © {new Date().getFullYear()} PaddockME · Support:
          support@paddockme.com.au
        </div>
      </footer>
    </div>
  );
}
