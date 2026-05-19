import type { Metadata } from "next";
import { getAgreement, getListing, farmers } from "@/lib/dummyData";
import { WorkspaceRouteClient } from "./WorkspaceRouteClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agreement = getAgreement(id);
  const listing = agreement ? getListing(agreement.listingId) : undefined;
  const farmerA = agreement
    ? farmers.find((f) => f.id === agreement.farmerAId)
    : undefined;
  const farmerB = agreement
    ? farmers.find((f) => f.id === agreement.farmerBId)
    : undefined;
  const parts = [farmerA?.name.split(" ")[0], farmerB?.name.split(" ")[0]]
    .filter(Boolean)
    .join(" & ");
  const title = listing
    ? `${listing.title}${parts ? ` · ${parts}` : ""} — PaddockME`
    : "Agreement workspace — PaddockME";
  return { title };
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceRouteClient id={id} seedAgreement={getAgreement(id)} />;
}
