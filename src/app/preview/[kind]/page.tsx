import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

type PreviewKind = "agistment" | "paddocks" | "transport";

type PreviewConfig = {
  eyebrow: string;
  title: string;
  body: string;
  intent: string;
  actionLabel: string;
  actionHref: string;
  icon: typeof Sprout;
  examples: string[];
  steps: string[];
};

const previews: Record<PreviewKind, PreviewConfig> = {
  agistment: {
    eyebrow: "Need agistment",
    title: "Find suitable country before feed gets tight.",
    body: "Preview how livestock owners describe stock, timing, region, and must-have paddock conditions before starting a private agreement workspace.",
    intent: "livestock",
    actionLabel: "Create a livestock request",
    actionHref: "/request/new",
    icon: Sprout,
    examples: [
      "Cattle, sheep, horses, goats, or mixed stock",
      "Preferred region or exact town/locality",
      "Water, yards, fencing, shelter, and timing needs",
    ],
    steps: ["Create request", "Review matching paddocks", "Open agreement"],
  },
  paddocks: {
    eyebrow: "Have agistment",
    title: "Show livestock owners the paddocks you can offer.",
    body: "Preview the listing flow landowners use to describe spare feed, water, access, capacity, and the kind of stock their country suits.",
    intent: "landowner",
    actionLabel: "List a paddock",
    actionHref: "/listings/new",
    icon: Tractor,
    examples: [
      "Paddock size, feed state, water and fencing",
      "Suitable stock types and rough capacity",
      "Availability, region, and access details",
    ],
    steps: ["Create listing", "Receive suitable requests", "Start agreement"],
  },
  transport: {
    eyebrow: "Need transport",
    title: "Coordinate livestock movement without exposing private terms.",
    body: "Preview how transport requests, capacity, route details, and status updates sit beside the agreement without leaking commercial agistment details.",
    intent: "transport",
    actionLabel: "Start transport setup",
    actionHref: "/transport/available",
    icon: Truck,
    examples: [
      "Pickup and destination locality",
      "Stock count, timing, truck capacity, and access notes",
      "Status updates for loading, transit, and arrival",
    ],
    steps: ["Post capacity", "Review transport jobs", "Coordinate movement"],
  },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isPreviewKind(kind)) notFound();

  const preview = previews[kind];
  const currentUserProfile = await getCurrentUserProfile();
  const Icon = preview.icon;
  const actionHref = currentUserProfile
    ? preview.actionHref
    : `/sign-up?intent=${encodeURIComponent(preview.intent)}&next=${encodeURIComponent(preview.actionHref)}`;

  return (
    <main className="min-h-dvh bg-warm-white text-bark">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <Link href="/" className="font-display text-2xl text-sage-deep">
          PaddockME
        </Link>
        <ButtonLink href="/sign-in" variant="secondary" className="shrink-0">
          Log in
        </ButtonLink>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-28 pt-4 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:pt-10">
        <div className="min-w-0">
          <p className="mb-4 inline-flex min-h-8 items-center rounded-full bg-sage-mist px-3 text-xs font-bold uppercase tracking-wide text-sage-deep">
            {preview.eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-tight text-sage-deep md:text-6xl">
            {preview.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-bark/75 md:text-lg">
            {preview.body}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={actionHref}>
              {preview.actionLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            {!currentUserProfile && (
              <ButtonLink href="/sign-in" variant="secondary">
                Already have an account
              </ButtonLink>
            )}
          </div>
        </div>

        <Card className="bg-cream/80">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-deep text-cream">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-sage-deep">
                What you can inspect first
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-bark/70">
                Browse the shape of the workflow before creating an account.
                Private actions unlock after sign-up.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {preview.examples.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-[8px] border border-mist bg-warm-white px-3 py-3 text-sm"
              >
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
                  aria-hidden
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="grid gap-4 md:grid-cols-3">
            {preview.steps.map((step, index) => (
              <div key={step} className="rounded-[8px] bg-warm-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-ochre">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-bold text-sage-deep">{step}</h3>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-[8px] border border-sage-deep/15 bg-sage-mist/45 p-4 sm:flex-row sm:items-center">
            <LockKeyhole
              className="h-5 w-5 shrink-0 text-sage-deep"
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-bark/75">
              You can look around first. Posting, messaging, quotes,
              agreements, saved details, and private counterpart information
              require an account.
            </p>
          </div>
        </Card>

        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <TrustTile
            icon={MapPin}
            title="Location matters"
            body="If your region is not listed, onboarding asks for your exact town or locality."
          />
          <TrustTile
            icon={ShieldCheck}
            title="Private by default"
            body="Agreement rooms, chat, and private terms stay behind account access."
          />
        </div>
      </section>
    </main>
  );
}

function TrustTile({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MapPin;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-mist bg-cream p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ochre" aria-hidden />
      <div>
        <h3 className="font-bold text-sage-deep">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-bark/70">{body}</p>
      </div>
    </div>
  );
}

function isPreviewKind(value: string): value is PreviewKind {
  return value === "agistment" || value === "paddocks" || value === "transport";
}
