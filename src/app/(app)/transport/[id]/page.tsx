import type { Metadata } from "next";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { TransportRouteClient } from "./TransportRouteClient";

export const metadata: Metadata = {
  title: "Transport room — PaddockME",
};

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Real transport jobs live in Supabase with uuid ids; anything else is a
  // dead link.
  if (isUuid(id)) {
    return <TransportRouteClient id={id} />;
  }
  return (
    <RealAccountEmptyState
      title="No transport room found."
      body="Transport rooms are created when an agreement raises an RFT (Request for Transport)."
      primaryHref="/transport/jobs"
      primaryLabel="Open the RFT board"
      secondaryHref="/agreements"
      secondaryLabel="Back to dashboard"
    />
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
