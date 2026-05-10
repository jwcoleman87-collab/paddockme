import { MapPin, ShieldCheck, Truck } from "lucide-react";
import { Card } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { DummyMap } from "@/components/DummyMap";
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
                <Fact icon={<MapPin />} label="Pickup" value={job.pickup} />
                <Fact icon={<MapPin />} label="Destination" value={job.destination} />
                <Fact icon={<Truck />} label="Livestock" value={job.livestockCount} />
                <Fact icon={<Truck />} label="Preferred date" value={job.preferredDate} />
                <Fact icon={<Truck />} label="Driver" value={job.driver} />
                <Fact icon={<MapPin />} label="Route" value={job.routeSummary} />
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
        right={<ChatPanel title="Farmer A, Farmer B and Driver" messages={messages} />}
      />
    </>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-mist bg-warm-white p-4">
      <div className="mb-2 text-sage-deep">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-1 font-semibold text-bark">{value}</p>
    </div>
  );
}
