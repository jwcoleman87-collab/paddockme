"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CircleDot,
  PackageCheck,
  Truck,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import type { Farmer, TransportJob } from "@/lib/dummyData";
import type { FeedRun } from "@/lib/feedRuns";

type Props = {
  drivers: Farmer[];
  transportJobs: TransportJob[];
  feedRuns: FeedRun[];
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
 * Driver-home pipeline. Farmers/agisters create transport RFTs from agreement
 * workspaces; drivers browse those routes, then accepted work lands here.
 */
export function RunsClient({ drivers, transportJobs, feedRuns, farmersById }: Props) {
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
    drivers.find((driver) => driver.id === activePersonaId) ?? drivers[0];

  const myJobs = useMemo(
    () =>
      activeDriver
        ? transportJobs.filter((job) => job.driverId === activeDriver.id)
        : [],
    [transportJobs, activeDriver]
  );

  const openRfts = useMemo(
    () => transportJobs.filter((job) => job.status === "available"),
    [transportJobs]
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
        label: "Open RFTs",
        helper: "Farmer routes waiting for a carrier.",
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <Card className="flex flex-col gap-3 border-amber/25 bg-amber-light/60">
            <StatusBadge tone="warning">
              <PackageCheck className="h-3.5 w-3.5" aria-hidden />
              Feed runs
            </StatusBadge>
            <p className="text-4xl font-extrabold text-sage-deep">
              {feedRuns.length}
            </p>
            <p className="text-sm font-medium leading-relaxed text-bark/85">
              Hay, silage and feed freight for agistment support.
            </p>
          </Card>
        </div>
      </div>

      <section className="mt-7" aria-label="Driver RFT intake">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-sage-deep">
                Farmer RFT map
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-bark/75">
                Livestock owner and Landowner raise transport requests from the
                agreement once the pickup, delivery, stock, and timing are
                known. Drivers quote those routes here.
              </p>
            </div>
            <StatusBadge tone="warning">
              {openRfts.length} open RFT{openRfts.length === 1 ? "" : "s"}
            </StatusBadge>
          </div>
          <ButtonLink href="/transport/jobs" className="w-fit">
            Open RFT map
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>
      </section>

      <section className="mt-7" aria-label="Feed freight">
        <Card className="flex flex-col gap-4 border-amber/25 bg-amber-light/50">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-sage-deep">
                Feed freight
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-bark/75">
                Add-on cartage for hay and silage gives carriers more work
                around agistment movements and helps farmers keep stock fed
                when pasture gets tight.
              </p>
            </div>
            <StatusBadge tone="warning">
              {feedRuns.length} feed run{feedRuns.length === 1 ? "" : "s"}
            </StatusBadge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {feedRuns.slice(0, 3).map((run) => (
              <div
                key={run.id}
                className="rounded-[8px] border border-amber/20 bg-warm-white px-3 py-3"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-amber">
                  {run.commodity}
                </p>
                <h3 className="mt-1 font-bold text-bark">
                  {run.pickupTown} to {run.destinationTown}
                </h3>
                <p className="mt-1 text-sm text-bark/70">{run.load}</p>
                <p className="mt-2 text-xs font-semibold text-stone">
                  {run.distanceKm} km, {run.driveTime}, ${run.fee}
                </p>
              </div>
            ))}
          </div>
          <ButtonLink href="/transport/jobs?work=feed" className="w-fit">
            Open feed runs
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>
      </section>

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
              Open the RFT map to see routes farmers have raised from their
              agistment agreements.
            </p>
            <ButtonLink href="/transport/jobs" className="mt-4 inline-flex">
              Browse open RFTs
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
          When a farmer RFT becomes your accepted run, it opens here with a
          tap-target straight into the room.
        </p>
        <ButtonLink href="/transport/jobs" variant="secondary" className="mt-5">
          Open RFT map
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
          .filter((farmer): farmer is Farmer => !!farmer)
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
            .filter((farmer): farmer is Farmer => !!farmer)
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
          {job.pickup} -&gt; {job.destination}
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
      return "Open RFT";
    default:
      return status.replace(/^./, (char) => char.toUpperCase());
  }
}
