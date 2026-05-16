import { ArrowRight, MapPin, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { transportJobs } from "@/lib/dummyData";

const statusTone: Record<"Loading" | "In Transit" | "Arrived", "info" | "warning" | "success"> = {
  Loading: "warning",
  "In Transit": "info",
  Arrived: "success",
};

export default function TransportListPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport coordination"
        title="Stock movements in flight."
        description="Each card is a 3-party transport room. Tap through to coordinate pickup, route, delivery, and the return move."
      />

      {transportJobs.length === 0 ? (
        <Card className="text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
            <Truck className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-sage-deep">
            No transport jobs yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
            Transport rooms are created when an agreement nears activation
            and a driver is invited. Start an agreement first.
          </p>
          <ButtonLink href="/agreements" className="mt-4 inline-flex">
            Back to agreements
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {transportJobs.map((job) => (
            <Card key={job.id} className="flex flex-col gap-5">
              <div>
                <StatusBadge tone={statusTone[job.status]}>
                  Movement: {job.status}
                </StatusBadge>
                <h2 className="mt-3 text-xl font-bold text-sage-deep">
                  {job.livestockCount}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-bark/65">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  {job.routeSummary}
                </p>
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
      )}
    </>
  );
}
