import { MapPin, ShieldCheck, Truck } from "lucide-react";
import { Card } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { DummyMap } from "@/components/DummyMap";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { StatusBadge } from "@/components/StatusBadge";
import { getTransportJob, getTransportMessages } from "@/lib/dummyData";

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getTransportJob(id);
  const messages = getTransportMessages(job.id);

  return (
    <>
      <PageHeader
        eyebrow="Transport coordination"
        title="Three-party transport room."
        description="Farmer A, Farmer B and the driver coordinate movement details. Contract pricing stays out of this workspace."
      />

      <SplitWorkspace
        leftLabel="Transport"
        rightLabel="Group chat"
        left={
          <div className="space-y-5">
            <Card>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusBadge tone="info">Status: {job.status}</StatusBadge>
                <StatusBadge tone="success">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  No private contract pricing
                </StatusBadge>
              </div>
              <h2 className="text-2xl font-bold text-sage-deep">
                Stock move details
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoTile icon={<MapPin />} label="Pickup" value={job.pickup} />
                <InfoTile icon={<MapPin />} label="Destination" value={job.destination} />
                <InfoTile icon={<Truck />} label="Livestock" value={job.livestockCount} />
                <InfoTile icon={<Truck />} label="Preferred date" value={job.preferredDate} />
                <InfoTile icon={<Truck />} label="Driver" value={job.driver ?? "Unassigned"} />
                <InfoTile icon={<MapPin />} label="Route" value={job.routeSummary} />
              </div>
            </Card>

            <section>
              <h2 className="mb-4 text-xl font-bold text-sage-deep">
                Route and tracking placeholder
              </h2>
              <DummyMap />
            </section>
          </div>
        }
        right={
          <ChatPanel
            title="Farmer A, Farmer B and Driver"
            messages={messages}
            onlineCount={job.driver ? 3 : 2}
          />
        }
      />
    </>
  );
}
