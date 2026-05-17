"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CirclePlus,
  MapPin,
  Sparkles,
  Sprout,
  Tractor,
  Truck,
  X,
} from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";
import { Avatar } from "@/components/Avatar";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import type {
  Agreement,
  AgreementLifecycleState,
  Farmer,
  PaddockListing,
  TransportJob,
} from "@/lib/dummyData";

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

const roleIcon: Record<Farmer["role"], React.ComponentType<{ className?: string }>> = {
  "Livestock Owner": Sprout,
  Landowner: Tractor,
  "Transport Provider": Truck,
};

export function AgreementsClient({
  farmers,
  agreements,
  transportJobs,
  listings,
  showOnboardingWelcome = false,
  initialFarmerId,
}: {
  farmers: Farmer[];
  agreements: Agreement[];
  transportJobs: TransportJob[];
  listings: PaddockListing[];
  showOnboardingWelcome?: boolean;
  initialFarmerId?: string;
}) {
  const [activeId, setActiveId] = useState(initialFarmerId ?? farmers[0]?.id ?? "");
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const hydratedRef = useRef(false);
  const farmer = farmers.find((f) => f.id === activeId) ?? farmers[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialFarmerId) {
      hydratedRef.current = true;
      return;
    }
    try {
      const stored = window.localStorage.getItem("paddockme.agreements.persona");
      if (stored && farmers.some((f) => f.id === stored)) {
        setActiveId(stored);
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, [farmers, initialFarmerId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem("paddockme.agreements.persona", activeId);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("paddockme:persona-change"));
  }, [activeId]);

  const visibleAgreements = useMemo(() => {
    if (!farmer) return [];
    return agreements.filter((agreement) =>
      farmer.role === "Livestock Owner"
        ? agreement.farmerAId === farmer.id
        : farmer.role === "Landowner"
          ? agreement.farmerBId === farmer.id
          : false
    );
  }, [agreements, farmer]);

  const visibleJobs = useMemo(() => {
    if (!farmer || farmer.role !== "Transport Provider") return [];
    return transportJobs.filter((job) => job.driverId === farmer.id);
  }, [transportJobs, farmer]);

  if (!farmer) return null;

  const firstName = farmer.name.split(" ")[0];
  const RoleIcon = roleIcon[farmer.role];

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
              Your answers are noted. The home view is using your selected role
              while persistence wiring continues.
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
                <RoleIcon className="h-3.5 w-3.5" aria-hidden />
                {farmer.role}
              </span>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {farmer.region}
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              Welcome back, {firstName}.
            </h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-sage-glow">
              {farmer.tagline}
            </p>
          </div>
          <PersonaCallout
            role={farmer.role}
            agreementCount={visibleAgreements.length}
            jobCount={visibleJobs.length}
          />
        </div>
      </Card>

      <ActivityFeed
        agreements={visibleAgreements}
        transportJobs={visibleJobs}
      />

      {farmer.role === "Transport Provider" ? (
        <TransportJobsBody jobs={visibleJobs} farmerName={firstName} />
      ) : (
        <AgreementsBody
          agreements={visibleAgreements}
          listings={listings}
          farmer={farmer}
        />
      )}
    </>
  );
}

function PersonaCallout({
  role,
  agreementCount,
  jobCount,
}: {
  role: Farmer["role"];
  agreementCount: number;
  jobCount: number;
}) {
  if (role === "Transport Provider") {
    return (
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:w-[22rem]">
        <InfoTile
          tone="subtle"
          label="Live jobs"
          value={`${jobCount}`}
          className="bg-warm-white/95"
        />
        <InfoTile
          tone="subtle"
          label="Next step"
          value={jobCount > 0 ? "Confirm pickup" : "Publish capacity"}
          className="bg-warm-white/95"
        />
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:w-[22rem]">
      <InfoTile
        tone="subtle"
        label="Active agreements"
        value={`${agreementCount}`}
        className="bg-warm-white/95"
      />
      <InfoTile
        tone="subtle"
        label="Next step"
        value={
          agreementCount > 0
            ? "Open workspace"
            : role === "Livestock Owner"
              ? "Post a request"
              : "List a paddock"
        }
        className="bg-warm-white/95"
      />
    </div>
  );
}

function AgreementsBody({
  agreements,
  listings,
  farmer,
}: {
  agreements: Agreement[];
  listings: PaddockListing[];
  farmer: Farmer;
}) {
  if (agreements.length === 0) {
    return (
      <EmptyHomeState
        title={
          farmer.role === "Livestock Owner"
            ? "No active agreements yet."
            : "No paddocks listed yet."
        }
        helper={
          farmer.role === "Livestock Owner"
            ? "Post a request to start matching with paddocks."
            : "List a paddock so livestock owners can find you."
        }
        ctaHref={
          farmer.role === "Livestock Owner" ? "/request/new" : "/listings/new"
        }
        ctaLabel={
          farmer.role === "Livestock Owner"
            ? "Post a request"
            : "List a paddock"
        }
      />
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {agreements.map((agreement) => {
        const listing =
          listings.find((l) => l.id === agreement.listingId) ?? listings[0];
        return (
          <Card key={agreement.id} className="flex flex-col gap-5">
            <div>
              <StatusBadge tone={lifecycleTone[agreement.status]}>
                {agreement.status}
              </StatusBadge>
              <h2 className="mt-3 text-xl font-bold text-sage-deep">
                {listing.title}
              </h2>
              <p className="mt-1 text-sm text-bark/65">{listing.location}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoTile tone="subtle" size="sm" label="Livestock" value={agreement.livestock} />
              <InfoTile tone="subtle" size="sm" label="Weeks remaining" value={`${agreement.weeksRemaining}`} />
              <InfoTile tone="subtle" size="sm" label="Transport" value={agreement.transportRequired ? "Required" : "No"} />
              <InfoTile tone="subtle" size="sm" label="Last update" value="18 min ago" />
            </div>
            <p className="text-sm leading-relaxed text-bark/70">
              {agreement.lastUpdate}
            </p>
            <ButtonLink href={`/workspace/${agreement.id}`} className="mt-auto">
              Open workspace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </Card>
        );
      })}
    </div>
  );
}

function TransportJobsBody({
  jobs,
  farmerName,
}: {
  jobs: TransportJob[];
  farmerName: string;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyHomeState
        title={`No transport jobs assigned to ${farmerName} yet.`}
        helper="Publish forward capacity so backloads can be matched to your runs."
        ctaHref="/profile"
        ctaLabel="View your transport profile"
      />
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <Card key={job.id} className="flex flex-col gap-5">
          <div>
            <StatusBadge tone="info">Movement: {job.status}</StatusBadge>
            <h2 className="mt-3 text-xl font-bold text-sage-deep">
              {job.livestockCount}
            </h2>
            <p className="mt-1 text-sm text-bark/65">{job.routeSummary}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoTile tone="subtle" size="sm" label="Pickup" value={job.pickup} />
            <InfoTile tone="subtle" size="sm" label="Destination" value={job.destination} />
            <InfoTile tone="subtle" size="sm" label="Date" value={job.preferredDate} />
            <InfoTile tone="subtle" size="sm" label="Driver" value={job.driver} />
          </div>
          <ButtonLink href={`/transport/${job.id}`} className="mt-auto">
            Open transport room
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>
      ))}
    </div>
  );
}

function EmptyHomeState({
  title,
  helper,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  helper: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        <CirclePlus className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-sage-deep">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        {helper}
      </p>
      <ButtonLink href={ctaHref} className="mt-4 inline-flex">
        {ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </Card>
  );
}
