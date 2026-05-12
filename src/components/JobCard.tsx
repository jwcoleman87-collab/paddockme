import { ArrowRight, CalendarDays, Gauge, MapPin, Route, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { tierLabel, type DriverJobMatch } from "@/lib/domain/driver-matching";
import { TRUCK_CLASS_LABEL } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

const tierTone = {
  strong: "success",
  good: "info",
  limited: "warning",
} as const;

export function JobCard({ match }: { match: DriverJobMatch }) {
  const { job, bestTruck } = match;

  return (
    <Card className="space-y-5 bg-warm-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusBadge tone={tierTone[match.tier]}>{tierLabel(match.tier)}</StatusBadge>
            <StatusBadge tone="neutral">{job.size} movement</StatusBadge>
          </div>
          <h2 className="text-2xl font-bold leading-tight text-sage-deep">
            {job.pickupRegion} to {job.destinationRegion}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-bark/90">
            {job.livestockCount} moving from {job.pickup} to {job.destination}.
          </p>
        </div>
        <div className="rounded-2xl border border-sage-deep bg-sage-deep px-4 py-3 text-sm font-bold text-cream sm:text-right">
          {match.score}/100
          <span className="block text-xs font-semibold text-cream/80">fit score</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile
          size="sm"
          icon={<Truck className="h-4 w-4" />}
          iconPlacement="inline"
          label="Stock"
          value={`${job.headCount} ${job.stockType.toLowerCase()}`}
        />
        <InfoTile
          size="sm"
          icon={<CalendarDays className="h-4 w-4" />}
          iconPlacement="inline"
          label="Preferred"
          value={job.preferredDate}
        />
        <InfoTile
          size="sm"
          icon={<Route className="h-4 w-4" />}
          iconPlacement="inline"
          label="Distance"
          value={`${job.distanceKm} km`}
        />
        <InfoTile
          size="sm"
          icon={<Gauge className="h-4 w-4" />}
          iconPlacement="inline"
          label="Estimate"
          value={job.estimatedDuration}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-mist bg-cream p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
            Best truck
          </p>
          <p className="mt-1 font-bold text-bark">
            {bestTruck
              ? `${bestTruck.label} - ${TRUCK_CLASS_LABEL[bestTruck.class]}`
              : "Truck profile needed"}
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm font-medium leading-relaxed text-bark/85">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" aria-hidden />
            {job.routeSummary}
          </p>
        </div>

        <div className="space-y-2">
          {match.reasons.map((reason) => (
            <div
              key={reason.label}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                reason.positive
                  ? "border-match/20 bg-match-light text-bark"
                  : "border-amber/25 bg-amber-light text-bark"
              )}
            >
              <span className="font-bold">{reason.label}: </span>
              {reason.detail}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-mist pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-bark/85">
          Driver sees movement details only. Private agistment terms stay in the agreement workspace.
        </p>
        <ButtonLink
          href={`/transport/${job.id}?driver=${match.driver.id}`}
          variant="secondary"
          className="shrink-0"
        >
          Express interest
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </div>
    </Card>
  );
}
