import type { Metadata } from "next";
import { getAgreement, getListing, farmers } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { WorkspaceRouteClient } from "./WorkspaceRouteClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agreement = getAgreement(id);
  const listing = agreement ? getListing(agreement.listingId) : undefined;
  const farmerA = agreement && !agreement.farmerAName
    ? farmers.find((f) => f.id === agreement.farmerAId)
    : undefined;
  const farmerB = agreement && !agreement.farmerBName
    ? farmers.find((f) => f.id === agreement.farmerBId)
    : undefined;
  const parts = [
    (agreement?.farmerAName ?? farmerA?.name)?.split(" ")[0],
    (agreement?.farmerBName ?? farmerB?.name)?.split(" ")[0],
  ]
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
  const currentUserProfile = await getCurrentUserProfile();

  // Real (signed-in) accounts load their agreement from Supabase inside the
  // route client; demo visitors get an instant seed from the prototype data.
  const seedAgreement = currentUserProfile ? null : getAgreement(id);
  return <WorkspaceRouteClient id={id} seedAgreement={seedAgreement} />;
}
