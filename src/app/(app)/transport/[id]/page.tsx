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
    // Real transport jobs (created via "Request transport" in a workspace)
    // live in Supabase with uuid ids - let the route client load them.
    // Anything else is a dead link for a real account.
    if (isUuid(id)) {
      return <TransportRouteClient id={id} seedJob={null} />;
    }
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

  return <TransportRouteClient id={id} seedJob={getTransportJob(id) ?? null} />;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
