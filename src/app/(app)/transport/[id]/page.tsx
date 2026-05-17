import { PageHeader } from "@/components/PageHeader";
import { getTransportJob, getTransportMessages } from "@/lib/dummyData";
import { TransportClient } from "./TransportClient";

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
        description="Farmer A, Farmer B and the driver coordinate the move here. Pricing and contract terms stay in the agreement workspace - this surface only carries logistics."
      />
      <TransportClient job={job} messages={messages} />
    </>
  );
}
