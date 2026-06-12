"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { LiveMap, type LiveMapRoute } from "@/components/LiveMap";
import { StatusBadge } from "@/components/StatusBadge";
import { useFlash } from "@/components/FlashProvider";
import { updateTransportJobStatus } from "@/lib/data/repositories";
import type { TransportJobSummary } from "@/lib/data/serverPaddocks";

/**
 * Real-account RFT board. Lists live transport jobs from Supabase:
 * the viewer's own jobs (farmer side or assigned driver) plus, for
 * transport providers, every still-available job to accept.
 */
export function RealJobsBoard({
  jobs,
  isTransportProvider,
}: {
  jobs: TransportJobSummary[];
  isTransportProvider: boolean;
}) {
  const available = jobs.filter(
    (job) => job.relation === "available" && job.status === "available"
  );
  const mine = jobs.filter((job) => job.relation === "mine");

  const mapRoutes: LiveMapRoute[] = jobs
    .filter((job) => job.pickupPoint && job.destinationPoint)
    .map((job) => ({
      id: job.id,
      title: job.routeSummary,
      subtitle: `${job.livestockCount} · pickup ${job.preferredDate}`,
      href: `/transport/${job.id}`,
      from: job.pickupPoint!,
      to: job.destinationPoint!,
      tone: job.status === "available" ? ("available" as const) : ("active" as const),
    }));

  return (
    <div className="space-y-6">
      {mapRoutes.length > 0 && (
        <section aria-label="Route map" className="space-y-2">
          <LiveMap routes={mapRoutes} />
          <p className="hidden">
            Amber routes are waiting for a carrier · green routes are underway.
            Tap a route for the job.
          </p>
        </section>
      )}
      {isTransportProvider && (
        <section aria-label="Available jobs">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-sage-deep">
            Available jobs ({available.length})
          </h2>
          {available.length === 0 ? (
            <Card className="text-center">
              <h3 className="text-lg font-bold text-sage-deep">
                No open jobs right now.
              </h3>
              <p className="hidden">
                New RFTs raised from agistment agreements will appear here the
                moment a farmer requests transport. Check back soon.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {available.map((job) => (
                <JobCard key={job.id} job={job} canAccept />
              ))}
            </div>
          )}
        </section>
      )}

      <section aria-label="Your jobs">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-sage-deep">
          Your jobs ({mine.length})
        </h2>
        {mine.length === 0 ? (
          <Card className="text-center">
            <h3 className="text-lg font-bold text-sage-deep">
              {isTransportProvider
                ? "No accepted jobs yet."
                : "No transport jobs yet."}
            </h3>
            <p className="hidden">
              {isTransportProvider
                ? "Accept an available job above and it moves here with its transport room."
                : "Request transport from an agreement workspace and the job will appear here."}
            </p>
            {!isTransportProvider && (
              <ButtonLink href="/agreements" className="mt-4 inline-flex">
                Back to agreements
              </ButtonLink>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.map((job) => (
              <JobCard key={job.id} job={job} canAccept={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JobCard({
  job,
  canAccept,
}: {
  job: TransportJobSummary;
  canAccept: boolean;
}) {
  const router = useRouter();
  const flash = useFlash();
  const [accepting, setAccepting] = useState(false);

  async function accept() {
    setAccepting(true);
    try {
      const { job: updated } = await updateTransportJobStatus(
        job.id,
        "accepted"
      );
      if (!updated || updated.status === "available") {
        flash(
          "Couldn't accept the job - it may have just been taken. Refresh to see the latest board.",
          "warning"
        );
        setAccepting(false);
        return;
      }
      flash("Job accepted. Opening the transport room.", "success");
      router.push(`/transport/${job.id}`);
    } catch {
      flash("Couldn't accept the job. Please try again.", "warning");
      setAccepting(false);
    }
  }

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
            {job.livestockCount}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-snug text-sage-deep">
            {job.routeSummary}
          </h3>
        </div>
        <StatusBadge tone={job.status === "available" ? "warning" : "success"}>
          {formatStatus(job.status)}
        </StatusBadge>
      </div>

      <div className="space-y-1.5 text-sm text-bark/85">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
          {job.pickup} → {job.destination}
        </p>
        <p className="flex items-start gap-1.5">
          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
          Preferred pickup: {job.preferredDate}
        </p>
        {job.routeDistanceKm !== null && (
          <p className="flex items-start gap-1.5">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
            Route distance: {job.routeDistanceKm} km
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {canAccept && (
          <Button
            type="button"
            onClick={accept}
            disabled={accepting}
            className="min-h-10"
          >
            <Truck className="h-4 w-4" aria-hidden />
            {accepting ? "Accepting..." : "Accept job"}
          </Button>
        )}
        <Link
          href={`/transport/${job.id}`}
          className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-sage-deep underline-offset-2 hover:underline"
        >
          Open transport room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
