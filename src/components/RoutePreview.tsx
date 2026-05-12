import { Clock3, MapPin, Route, Truck } from "lucide-react";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import type { TransportJob } from "@/lib/dummyData";

export function RoutePreview({ job }: { job: TransportJob }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)]">
      <div className="border-b border-sage-deep/15 bg-cream/70 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-sage-deep">Route overview</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-bark/85">
              Pickup, destination, and timing only. This keeps the transport
              room focused on the movement.
            </p>
          </div>
          <StatusBadge tone="info">{job.distanceKm} km</StatusBadge>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(17rem,0.95fr)]">
        <div className="relative min-h-64 overflow-hidden rounded-2xl border border-sage-glow bg-sage-mist/75 p-5">
          <div className="absolute left-7 right-7 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sage-deep/20" />
          <div className="absolute left-[22%] right-[22%] top-1/2 h-1 -translate-y-1/2 rounded-full bg-sage-deep" />

          <RoutePoint
            align="left"
            label="Pickup"
            value={job.pickup}
            region={job.pickupRegion}
          />
          <RoutePoint
            align="right"
            label="Destination"
            value={job.destination}
            region={job.destinationRegion}
          />

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-warm-white bg-sage-deep p-3 text-cream shadow-[0_14px_30px_rgba(34,84,52,0.18)]">
            <Truck className="h-6 w-6" aria-hidden />
          </div>
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <InfoTile
            icon={<Route className="h-4 w-4" />}
            iconPlacement="inline"
            label="Route"
            value={job.routeSummary}
          />
          <InfoTile
            icon={<Clock3 className="h-4 w-4" />}
            iconPlacement="inline"
            label="Estimated time"
            value={job.estimatedDuration}
          />
          <InfoTile
            icon={<Truck className="h-4 w-4" />}
            iconPlacement="inline"
            label="Livestock"
            value={job.livestockCount}
          />
        </div>
      </div>
    </section>
  );
}

function RoutePoint({
  align,
  label,
  value,
  region,
}: {
  align: "left" | "right";
  label: string;
  value: string;
  region: string;
}) {
  return (
    <div
      className={
        align === "left"
          ? "absolute left-5 top-5 max-w-[46%]"
          : "absolute bottom-5 right-5 max-w-[46%] text-right"
      }
    >
      <div
        className={
          align === "left"
            ? "mb-3 flex items-center gap-2 text-sage-deep"
            : "mb-3 flex items-center justify-end gap-2 text-sage-deep"
        }
      >
        <MapPin className="h-5 w-5 shrink-0" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <div className="rounded-xl border border-sage-deep/15 bg-warm-white/95 px-3 py-2 shadow-sm">
        <p className="text-sm font-bold leading-snug text-bark">{value}</p>
        <p className="mt-1 text-xs font-semibold text-bark/85">{region}</p>
      </div>
    </div>
  );
}
