import type { Metadata } from "next";
import { getTransportJob } from "@/lib/dummyData";
import { TransportRouteClient } from "./TransportRouteClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = getTransportJob(id);
  return {
    title: job
      ? `Transport: ${job.routeSummary} — PaddockME`
      : "Transport room — PaddockME",
  };
}

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransportRouteClient id={id} seedJob={getTransportJob(id)} />;
}
