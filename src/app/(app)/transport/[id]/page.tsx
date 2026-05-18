import { getTransportJob } from "@/lib/dummyData";
import { TransportRouteClient } from "./TransportRouteClient";

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransportRouteClient id={id} seedJob={getTransportJob(id)} />;
}
