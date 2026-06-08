import type { Metadata } from "next";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getTransportJob } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
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
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <RealAccountEmptyState
        title="No transport room found."
        body="Transport rooms are created from real requests, listings, or accepted transport work."
        primaryHref="/transport/jobs"
        primaryLabel="View transport jobs"
        secondaryHref="/transport/available"
        secondaryLabel="Post availability"
      />
    );
  }

  return <TransportRouteClient id={id} seedJob={getTransportJob(id)} />;
}
