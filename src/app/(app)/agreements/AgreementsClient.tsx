"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  FileText,
  MapPin,
  Search,
  Sparkles,
  Sprout,
  Tractor,
  Truck,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
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

/**
 * Home dashboard for authenticated users. Production-only: all data arrives
 * server-fetched from Supabase via the repository layer (no demo personas,
 * no browser-persisted business data - demo mode retired per the master spec).
 */
export function AgreementsClient({
  currentUserProfile,
  realCounts,
  realAgreements = [],
  showOnboardingWelcome = false,
}: {
  currentUserProfile?: CurrentUserProfile | null;
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
  const realAccount = currentUserProfile
    ? profileToAccountHome(currentUserProfile)
    : null;
  const realAccountMetricCount = currentUserProfile
    ? realAccount?.role === "Landowner"
      ? realCounts?.myListings ?? 0
      : realAccount?.role === "Transport Provider"
        ? realCounts?.transport ?? 0
        : realCounts?.agreements ?? 0
    : 0;

  if (!realAccount) {
    // Middleware redirects signed-out visitors to /sign-in before this
    // renders; nothing to show without a profile.
    return null;
  }

  return (
    <>
      {showOnboardingWelcome && !welcomeDismissed && (
        <section
          aria-label="Welcome"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-sage-glow bg-sage-mist/55 p-4"
        >
          <Sparkles
            className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-sage-deep">
              Welcome to PaddockME.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bark/75">
              Your profile is ready. Start by creating the request, listing,
              or transport availability that matches your operation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWelcomeDismissed(true)}
            aria-label="Dismiss welcome"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </section>
      )}
      <Card className="mb-5 bg-sage-deep text-cream">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
                <realAccount.Icon className="h-3.5 w-3.5" aria-hidden />
                {realAccount.role}
              </span>
              {realAccount.region && (
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {realAccount.region}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold">
              Welcome back, {realAccount.firstName}.
            </h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-sage-glow">
              {realAccount.tagline}
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:w-[22rem]">
            {realAccount.metricHref ? (
              <Link href={realAccount.metricHref} className="block">
                <InfoTile
                  tone="subtle"
                  label={realAccount.metricLabel}
                  value={String(realAccountMetricCount)}
                  className="bg-warm-white/95 transition hover:bg-warm-white"
                />
              </Link>
            ) : (
              <InfoTile
                tone="subtle"
                label={realAccount.metricLabel}
                value={String(realAccountMetricCount)}
                className="bg-warm-white/95"
              />
            )}
            <InfoTile
              tone="subtle"
              label="Next step"
              value={realAccount.nextStep}
              className="bg-warm-white/95"
            />
          </div>
        </div>
      </Card>
      {realAgreements.length > 0 && (
        <RealAgreementsSection agreements={realAgreements} />
      )}
      <RealAccountDashboard
        account={realAccount}
        paddockCount={realCounts?.paddocks ?? 0}
        livestockRequestCount={realCounts?.requests ?? 0}
        transportJobCount={realCounts?.transport ?? 0}
      />
    </>
  );
}

function profileToAccountHome(profile: CurrentUserProfile) {
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
      metricLabel: "Active listings",
      metricHref: "/listings/mine",
      nextStep: "List a paddock",
      emptyTitle: "No paddocks listed yet.",
      emptyHelper: "Create your first listing so livestock owners can find available agistment.",
      ctaHref: "/listings/new",
      ctaLabel: "List a paddock",
    };
  }

  if (role === "Transport Provider") {
    return {
      role,
      firstName,
      region,
      Icon: Truck,
      tagline: "Find livestock routes raised from agistment agreements and accept the work.",
      metricLabel: "Live jobs",
      metricHref: "/transport/jobs",
      nextStep: "Find transport work",
      emptyTitle: "No transport jobs yet.",
      emptyHelper: "Open the RFT board to see livestock routes waiting for a carrier.",
      ctaHref: "/transport/jobs",
      ctaLabel: "Open the RFT board",
    };
  }

  return {
    role: "Livestock Owner",
    firstName,
    region,
    Icon: Sprout,
    tagline: "Create livestock requests and match with suitable paddocks.",
    metricLabel: "Active agreements",
    metricHref: undefined,
    nextStep: "Post a request",
    emptyTitle: "No active agreements yet.",
    emptyHelper: "Post your first livestock request to start matching with paddocks.",
    ctaHref: "/request/new",
    ctaLabel: "Post a request",
  };
}

type AccountHome = ReturnType<typeof profileToAccountHome>;

/**
 * The signed-in user's live agreement workspaces. Without this section a
 * real account had no way back into an open workspace after leaving it.
 */
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
      <div className="grid gap-3 md:grid-cols-2">
        {agreements.map((agreement) => (
          <Link
            key={agreement.id}
            href={`/workspace/${agreement.id}`}
            className="block rounded-2xl border border-mist bg-warm-white p-4 transition hover:border-sage/40 hover:bg-sage-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
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
            {agreement.lastMessage ? (
              <p className="mt-2 truncate text-sm text-bark/70">
                {agreement.lastMessage.senderName}: {agreement.lastMessage.body}
              </p>
            ) : (
              <p className="mt-2 text-sm text-bark/55">
                No messages yet - open the workspace to start the conversation.
              </p>
            )}
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-sage-deep">
              Open workspace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RealAccountDashboard({
  account,
  paddockCount,
  livestockRequestCount,
  transportJobCount,
}: {
  account: AccountHome;
  paddockCount: number;
  livestockRequestCount: number;
  transportJobCount: number;
}) {
  const snapshot = [
    {
      label: "Paddocks",
      value: `${paddockCount}`,
      detail: "Available to browse",
      href: "/listings",
      icon: Sprout,
    },
    {
      label: "Requests",
      value: `${livestockRequestCount}`,
      detail: "Livestock seeking country",
      href: "/requests",
      icon: Search,
    },
    {
      label: "Transport",
      value: `${transportJobCount}`,
      detail: "Jobs and carrier capacity",
      href: "/transport/jobs",
      icon: Truck,
    },
  ];

  const workLinks = [
    {
      title: account.role === "Landowner" ? "My paddocks" : "My requests",
      detail:
        account.role === "Landowner"
          ? "Create or review agistment listings."
          : "Post stock requirements and browse matching paddocks.",
      href: account.role === "Landowner" ? "/listings/new" : "/request/new",
      icon: ClipboardCheck,
    },
    {
      title: "Messages",
      detail: "Conversation and agreement updates.",
      href: "/messages",
      icon: Bell,
    },
    {
      title: "Documents",
      detail: "PIC, NVD/eNVD, health and transport records.",
      href: "#readiness-documents",
      icon: FileText,
    },
  ];

  return (
    <>
      <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <Card className="flex flex-col gap-4 border-sage/30 bg-sage-mist/30 hover:border-sage/45 hover:shadow-[0_14px_34px_rgba(45,90,61,0.11)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-deep text-cream">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-sage-deep">
                Next action
              </p>
              <h3 className="mt-1 text-xl font-bold text-sage-deep">
                {account.nextStep}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-bark/70">
                {account.emptyHelper}
              </p>
            </div>
          </div>
          <ButtonLink href={account.ctaHref} className="mt-auto w-fit">
            {account.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>

        <section
          aria-label="Marketplace snapshot"
          className="grid gap-3 sm:grid-cols-3"
        >
          {snapshot.map((item) => (
            <SnapshotCard key={item.label} item={item} />
          ))}
        </section>
      </section>

      <section
        aria-label="Dashboard shortcuts"
        className="mb-5 grid gap-3 md:grid-cols-3"
      >
        {workLinks.map((item) => (
          <WorkLinkCard key={item.title} item={item} />
        ))}
      </section>

      <Card className="mb-5 hover:border-sage/35 hover:shadow-[0_14px_34px_rgba(63,51,40,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sage-deep">
              Recommended matches
            </p>
            <h3 className="mt-1 text-lg font-bold text-sage-deep">
              Browse live marketplace activity.
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              Use nearby paddocks, open livestock requests, and transport jobs
              to see what is moving before you commit to anything.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/listings" variant="secondary">
              Paddocks
            </ButtonLink>
            <ButtonLink href="/requests" variant="secondary">
              Requests
            </ButtonLink>
          </div>
        </div>
      </Card>
    </>
  );
}

function SnapshotCard({
  item,
}: {
  item: {
    label: string;
    value: string;
    detail: string;
    href: string;
    icon: typeof Sprout;
  };
}) {
  return (
    <ButtonLink href={item.href} variant="ghost" className="group h-full justify-start p-0">
      <Card className="flex h-full w-full items-start gap-3 p-4 hover:border-sage/40 hover:bg-sage-mist/25 hover:shadow-[0_14px_34px_rgba(45,90,61,0.1)]">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-mist text-sage-deep transition-all duration-200 ease-in-out group-hover:bg-sage-deep group-hover:text-cream">
          <item.icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-2xl font-extrabold leading-none text-sage-deep">
            {item.value}
          </span>
          <span className="mt-1 block text-sm font-bold text-bark">
            {item.label}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-bark/65">
            {item.detail}
          </span>
        </span>
      </Card>
    </ButtonLink>
  );
}

function WorkLinkCard({
  item,
}: {
  item: {
    title: string;
    detail: string;
    href: string;
    icon: typeof FileText;
  };
}) {
  return (
    <ButtonLink href={item.href} variant="ghost" className="group h-full justify-start p-0">
      <Card className="flex h-full w-full items-start gap-3 p-4 hover:border-sage/40 hover:bg-sage-mist/25 hover:shadow-[0_14px_34px_rgba(45,90,61,0.1)]">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-sage-deep transition-all duration-200 ease-in-out group-hover:bg-sage-deep group-hover:text-cream">
          <item.icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-sage-deep">
            {item.title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-bark/70">
            {item.detail}
          </span>
        </span>
      </Card>
    </ButtonLink>
  );
}
