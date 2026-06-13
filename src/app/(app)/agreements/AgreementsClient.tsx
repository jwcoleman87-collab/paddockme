"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Sprout,
  Tractor,
  Truck,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import type { CurrentUserProfile } from "@/lib/supabase/currentUser";
import type { AgreementSummary } from "@/lib/data/serverPaddocks";
import type { AgreementLifecycleState } from "@/lib/dummyData";

const lifecycleTone: Record<
  AgreementLifecycleState,
  "success" | "warning" | "info" | "neutral"
> = {
  Draft: "neutral",
  Negotiating: "warning",
  "Ready to finalise": "info",
  Active: "success",
  Completed: "info",
  Cancelled: "neutral",
};

export type DashboardNextAction = {
  title: string;
  detail: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Images cycled through agreement cards so the dashboard feels alive. */
const agreementCardImages = [
  "/images/paddockme/workspace-cattle.jpg",
  "/images/paddockme/workspace-property.jpg",
  "/images/paddockme/matches-paddock-card.jpg",
  "/images/paddockme/matches-riverbend-card.jpg",
];

/**
 * Home dashboard. One visually primary action - the user's next step in the
 * loop - computed server-side and passed in. Navigation lives in the
 * sidebar/tab bar, so this page answers "what needs me?" instead of being a
 * menu (nav overhaul, June 2026; spec ss2/ss6.3: one primary action, no
 * duplicate paths).
 */
export function AgreementsClient({
  currentUserProfile,
  nextAction,
  realCounts,
  realAgreements = [],
  showOnboardingWelcome = false,
}: {
  currentUserProfile?: CurrentUserProfile | null;
  nextAction: DashboardNextAction;
  realCounts?: {
    paddocks: number;
    requests: number;
    transport: number;
    agreements: number;
    myListings: number;
  };
  realAgreements?: AgreementSummary[];
  showOnboardingWelcome?: boolean;
}) {
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  if (!currentUserProfile) return null;
  const meta = roleMeta(currentUserProfile);

  return (
    <>
      {showOnboardingWelcome && !welcomeDismissed && (
        <section
          aria-label="Welcome"
          className="mb-5 flex items-start gap-3 rounded-[8px] border border-sage-deep/10 bg-sage-mist p-4"
        >
          <Sparkles
            className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-sage-deep">
              Welcome to PaddockME.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeDismissed(true)}
            aria-label="Dismiss welcome"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-sage-deep/10 bg-warm-white text-bark transition hover:border-sage/40 hover:bg-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </section>
      )}

      {/* Welcome banner — full-bleed farm photo with role/region badges */}
      <section
        className="relative mb-5 overflow-hidden rounded-[8px] bg-sage-deep bg-cover bg-center px-5 py-7 shadow-[0_14px_36px_rgba(31,42,36,0.12)] sm:px-8 sm:py-9"
        style={{ backgroundImage: "url(/images/paddockme/property-main-green-hills.jpg)" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-sage-deep/92 via-sage-deep/70 to-sage-deep/35"
          aria-hidden
        />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-bold text-sage-glow">
              <meta.Icon className="h-3.5 w-3.5" aria-hidden />
              {meta.role}
            </span>
            {meta.region && (
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-bold text-sage-glow">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {meta.region}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-warm-white sm:text-3xl">
            Welcome back, {meta.firstName}.
          </h2>
          <p className="mt-1 max-w-md text-sm text-warm-white/80">
            {meta.tagline}
          </p>
        </div>
      </section>

      <section aria-label="Next action" className="mb-5">
        <div className="flex flex-col overflow-hidden rounded-[8px] border border-sage-deep/10 bg-warm-white shadow-[0_12px_32px_rgba(31,42,36,0.05)] sm:flex-row sm:items-center">
          <div
            className="h-28 w-full shrink-0 bg-cover bg-center sm:h-auto sm:w-44 sm:self-stretch"
            style={{ backgroundImage: "url(/images/paddockme/request-step-road.jpg)" }}
            aria-hidden
          />
          <div className="flex flex-1 flex-col gap-3 border-l-4 border-l-sage p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:border-l-0 sm:border-t-0">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-ochre">
                Next step
              </p>
              <h3 className="mt-1 text-lg font-bold leading-snug text-bark">
                {nextAction.title}
              </h3>
              <p className="mt-0.5 text-sm text-bark/70">{nextAction.detail}</p>
            </div>
            <ButtonLink href={nextAction.ctaHref} className="shrink-0">
              {nextAction.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </section>

      {realAgreements.length > 0 && (
        <RealAgreementsSection agreements={realAgreements} />
      )}

      <p className="hidden">
        Browse:{" "}
        <Link href="/listings" className="font-bold text-sage-deep underline-offset-2 hover:underline">
          paddocks ({realCounts?.paddocks ?? 0})
        </Link>
        {" · "}
        <Link href="/requests" className="font-bold text-sage-deep underline-offset-2 hover:underline">
          open requests ({realCounts?.requests ?? 0})
        </Link>
        {" · "}
        <Link href="/transport/jobs" className="font-bold text-sage-deep underline-offset-2 hover:underline">
          transport jobs ({realCounts?.transport ?? 0})
        </Link>
        {" · "}
        <Link href="/map" className="font-bold text-sage-deep underline-offset-2 hover:underline">
          map
        </Link>
      </p>
    </>
  );
}

function roleMeta(profile: CurrentUserProfile) {
  const role = profile.accountTypes[0] ?? "Livestock Owner";
  const firstName =
    profile.fullName?.trim().split(/\s+/)[0] ??
    profile.email?.split("@")[0] ??
    "there";
  const region = profile.regions[0] ?? null;
  if (role === "Landowner") {
    return {
      role,
      firstName,
      region,
      Icon: Tractor,
      tagline: "Create paddock listings and respond to livestock requests.",
    };
  }
  if (role === "Transport Provider") {
    return {
      role,
      firstName,
      region,
      Icon: Truck,
      tagline:
        "Find livestock routes raised from agistment agreements and accept the work.",
    };
  }
  return {
    role: "Livestock Owner",
    firstName,
    region,
    Icon: Sprout,
    tagline: "Create livestock requests and match with suitable paddocks.",
  };
}

/** The signed-in user's live agreement workspaces. */
function RealAgreementsSection({
  agreements,
}: {
  agreements: AgreementSummary[];
}) {
  return (
    <section aria-label="Your agreements" className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-sage-deep">
          Your agreements
        </h2>
        <span className="text-xs font-semibold text-bark/60">
          {agreements.length} open
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {agreements.map((agreement, index) => (
          <Link
            key={agreement.id}
            href={`/workspace/${agreement.id}`}
            className="group block overflow-hidden rounded-[8px] border border-sage-deep/10 bg-warm-white shadow-[0_10px_28px_rgba(31,42,36,0.04)] transition hover:border-sage/35 hover:shadow-[0_16px_36px_rgba(31,42,36,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <div
              className="h-32 w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-[1.03]"
              style={{
                backgroundImage: `url(${agreementCardImages[index % agreementCardImages.length]})`,
              }}
              aria-hidden
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-sage-deep">
                    {agreement.listingTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-bark/75">
                    With {agreement.otherPartyName} · you are the{" "}
                    {agreement.viewerRole.toLowerCase()}
                  </p>
                </div>
                <StatusBadge
                  tone={
                    lifecycleTone[agreement.status as AgreementLifecycleState] ??
                    "neutral"
                  }
                >
                  {agreement.status}
                </StatusBadge>
              </div>
              {agreement.lastMessage && (
                <p className="mt-2 truncate text-sm text-bark/70">
                  {agreement.lastMessage.senderName}: {agreement.lastMessage.body}
                </p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-sage-deep">
                Open workspace
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
