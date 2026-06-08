import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
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
  const currentUserProfile = await getCurrentUserProfile();

  if (currentUserProfile) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-bold text-sage-deep">
          No agreement workspace found.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          Create a request or listing to start a live agreement workspace with
          another PaddockME customer.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/request/new">Create request</ButtonLink>
          <ButtonLink href="/listings/new" variant="secondary">
            List a paddock
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return <WorkspaceRouteClient id={id} seedAgreement={getAgreement(id)} />;
}
