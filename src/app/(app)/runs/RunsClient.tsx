"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDot,
  PackageCheck,
  Plus,
  Truck,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  Farmer,
  TransportCapacity,
  TransportJob,
} from "@/lib/dummyData";

type Props = {
  drivers: Farmer[];
  transportJobs: TransportJob[];
  transportCapacities: TransportCapacity[];
  farmersById: Record<string, Farmer>;
};

type Bucket = {
  key: "active" | "delivered" | "available";
  label: string;
  helper: string;
  tone: "success" | "warning" | "info";
  icon: typeof Truck;
  jobs: TransportJob[];
};

/**
 * Driver-home pipeline. Defaults to Wayne (the prototype's single-truck
 * persona) and switches automatically if the active persona is a different
 * driver. When a non-driver persona is active, prompts the user to switch.
 */
export function RunsClient({
  drivers,
  transportJobs,
  transportCapacities,
  farmersById,
}: Props) {
  const [activePersonaId, setActivePersonaId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    function read() {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          undefined
        );
      } catch {
        return undefined;
      }
    }
    setActivePersonaId(read());
    function onChange() {
      setActivePersonaId(read());
    }
    window.addEventListener("paddockme:persona-change", onChange);
    return () =>
      window.removeEventListener("paddockme:persona-change", onChange);
  }, []);

  const activeDriver =
    drivers.find((d) => d.id === activePersonaId) ?? drivers[0];

  const myJobs = useMemo(
    () =>
      activeDriver
        ? transportJobs.filter((job) => job.driverId === activeDriver.id)
        : [],
    [transportJobs, activeDriver]
  );

  const myCapacities = useMemo(
    () =>
      activeDriver
        ? transportCapacities.filter(
            (capacity) =>
              capacity.driverId === activeDriver.id &&
              capacity.status === "published"
          )
        : [],
    [transportCapacities, activeDriver]
  );

  const buckets: Bucket[] = useMemo(() => {
    const active = myJobs.filter((job) =>
      ["accepted", "loading", "in_transit"].includes(job.status)
    );
    const delivered = myJobs.filter((job) =>
      ["arrived", "completed"].includes(job.status)
    );
    const available = myJobs.filter((job) => job.status === "available");
    return [
      {
        key: "active",
        label: "In motion",
        helper: "Accepted, loading or on the road.",
        tone: "info",
        icon: Truck,
        jobs: active,
      },
      {
        key: "available",
        label: "Open offers",
        helper: "Jobs you've put your hand up for.",
        tone: "warning",
        icon: CircleDot,
        jobs: available,
      },
      {
        key: "delivered",
        label: "Delivered",
        helper: "Recent runs landed.",
        tone: "success",
        icon: PackageCheck,
        jobs: delivered,
      },
    ];
  }, [myJobs]);

  if (!activeDriver) {
    return (
      <Card className="text-center">
        <Truck
          className="mx-auto mb-3 h-8 w-8 text-sage-deep"
          aria-hidden
        />
        <h2 className="text-lg font-bold text-sage-deep">
          No driver persona available.
        </h2>
      </Card>
    );
  }

  const firstActive = buckets.find((bucket) => bucket.key === "active")
    ?.jobs[0];

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
        <NextRunCard job={firstActive} farmersById={farmersById} />
        <div className="grid gap-4 sm:grid-cols-3">
          {buckets.map((bucket) => (
            <Card key={bucket.key} className="flex flex-col gap-3">
              <StatusBadge tone={bucket.tone}>
                <bucket.icon className="h-3.5 w-3.5" aria-hidden />
                {bucket.label}
              </StatusBadge>
              <p className="text-4xl font-extrabold text-sage-deep">
                {bucket.jobs.length}
              </p>
              <p className="text-sm font-medium leading-relaxed text-bark/85">
                {bucket.helper}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <section className="mt-7" aria-label="Job list">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Your jobs
        </h2>
        {myJobs.length === 0 ? (
          <Card className="text-center">
            <CalendarClock
              className="mx-auto mb-3 h-8 w-8 text-sage-deep"
              aria-hidden
            />
            <h3 className="text-lg font-bold text-sage-deep">
              No transport jobs yet.
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/75">
              Post capacity below so farmers can quote you, or browse open
              transport jobs.
            </p>
            <ButtonLink href="/transport/available" className="mt-4 inline-flex">
              Browse capacity board
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                farmerA={farmersById[job.farmerAId]}
                farmerB={farmersById[job.farmerBId]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-7" aria-label="Posted capacity">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone">
            Your posted capacity
          </h2>
          <ButtonLink href="/transport/available" variant="secondary">
            <Plus className="h-4 w-4" aria-hidden />
            Post a run
          </ButtonLink>
        </div>
        {myCapacities.length === 0 ? (
          <Card className="text-center text-sm font-medium text-bark/75">
            Nothing posted yet. Use “Post a run” to advertise an empty leg.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {myCapacities.map((capacity) => (
              <CapacityCard key={capacity.id} capacity={capacity} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function NextRunCard({
  job,
  farmersById,
}: {
  job: TransportJob | undefined;
  farmersById: Record<string, Farmer>;
}) {
  if (!job) {
    return (
      <Card className="bg-sage-deep text-cream">
        <Truck className="mb-4 h-8 w-8 text-sage-glow" aria-hidden />
        <h2 className="text-2xl font-bold">No active run.</h2>
        <p className="mt-2 leading-relaxed text-sage-glow">
          When a farmer accepts a quote, the run opens here with a tap-target
          straight into the room.
        </p>
        <ButtonLink href="/transport/available" variant="secondary" className="mt-5">
          Post capacity
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>
    );
  }
  const farmerA = farmersById[job.farmerAId];
  const farmerB = farmersById[job.farmerBId];
  return (
    <Card className="bg-sage-deep text-cream">
      <div className="mb-4 flex items-center gap-3">
        <Truck className="h-7 w-7 text-sage-glow" aria-hidden />
        <h2 className="text-2xl font-bold">Next run</h2>
      </div>
      <p className="font-medium leading-relaxed text-sage-glow">
        {job.routeSummary}
      </p>
      <div className="mt-4 flex -space-x-2">
        {[farmerA, farmerB]
          .filter((f): f is Farmer => !!f)
          .map((farmer) => (
            <Avatar
              key={farmer.id}
              name={farmer.name}
              src={farmer.avatarUrl}
              size="md"
              className="ring-2 ring-sage-deep"
            />
          ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoTile
          tone="subtle"
          label="Livestock"
          value={job.livestockCount}
          className="bg-warm-white/95"
        />
        <InfoTile
          tone="subtle"
          label="Pickup"
          value={job.preferredDate}
          className="bg-warm-white/95"
        />
      </div>
      <ButtonLink
        href={`/transport/${job.id}?as=driver`}
        variant="secondary"
        className="mt-5"
      >
        Open run room
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </Card>
  );
}

function JobCard({
  job,
  farmerA,
  farmerB,
}: {
  job: TransportJob;
  farmerA?: Farmer;
  farmerB?: Farmer;
}) {
  return (
    <Link
      href={`/transport/${job.id}?as=driver`}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
    >
      <Card className="flex h-full flex-col gap-3 transition hover:border-sage/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
              {job.livestockCount}
            </p>
            <h3 className="mt-1 text-lg font-bold text-sage-deep">
              {job.routeSummary}
            </h3>
          </div>
          <StatusBadge tone={statusTone(job.status)}>
            {formatStatus(job.status)}
          </StatusBadge>
        </div>
        <div className="flex -space-x-2">
          {[farmerA, farmerB]
            .filter((f): f is Farmer => !!f)
            .map((farmer) => (
              <Avatar
                key={farmer.id}
                name={farmer.name}
                src={farmer.avatarUrl}
                size="sm"
                className="ring-2 ring-warm-white"
              />
            ))}
        </div>
        <p className="text-sm font-medium text-bark/75">
          {job.pickup} → {job.destination}
        </p>
        <p className="text-xs font-semibold text-stone">
          Pickup: {job.preferredDate}
        </p>
        <div className="mt-auto flex items-center justify-end text-sm font-semibold text-sage-deep">
          Open
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
        </div>
      </Card>
    </Link>
  );
}

function CapacityCard({ capacity }: { capacity: TransportCapacity }) {
  return (
    <Card className="flex h-full flex-col gap-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
        Posted {capacity.postedAt}
      </p>
      <h3 className="text-lg font-bold text-sage-deep">
        {capacity.originRegion} → {capacity.destinationRegion}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          tone="subtle"
          size="sm"
          label="Window"
          value={`${capacity.earliestDate} - ${capacity.latestDate}`}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          label="Capacity"
          value={`${capacity.headCapacity} head`}
        />
      </div>
      {capacity.stockTypes.length > 0 && (
        <p className="text-sm font-medium text-bark/75">
          For: {capacity.stockTypes.join(", ")}
        </p>
      )}
      {capacity.rateAmount && (
        <p className="text-sm font-semibold text-sage-deep">
          ${capacity.rateAmount.toFixed(2)}{" "}
          {capacity.rateBasis === "per_head"
            ? "per head"
            : capacity.rateBasis === "per_km"
              ? "per km"
              : "flat"}
        </p>
      )}
      {capacity.notes && (
        <p
          className={cn(
            "rounded-xl border border-mist bg-warm-white px-3 py-2 text-sm text-bark/75"
          )}
        >
          {capacity.notes}
        </p>
      )}
    </Card>
  );
}

function statusTone(status: TransportJob["status"]) {
  switch (status) {
    case "completed":
    case "arrived":
      return "success" as const;
    case "available":
      return "warning" as const;
    case "cancelled":
      return "neutral" as const;
    default:
      return "info" as const;
  }
}

function formatStatus(status: TransportJob["status"]) {
  switch (status) {
    case "in_transit":
      return "In transit";
    case "available":
      return "Open offer";
    default:
      return status.replace(/^./, (c) => c.toUpperCase());
  }
}
