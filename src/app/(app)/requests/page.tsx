import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listLivestockRequestsServer,
  listProfilesByIdServer,
  listSupabasePaddockListingsServer,
} from "@/lib/data/serverPaddocks";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Frequests");
  }

  const [requests, listings] = await Promise.all([
    listLivestockRequestsServer(),
    listSupabasePaddockListingsServer(),
  ]);
  const requesters = await listProfilesByIdServer(
    requests.map((request) => request.requesterId)
  );

  return (
    <>
      <PageHeader
        eyebrow="Open requests"
        title="Livestock seeking paddocks."
        description="Live requests from PaddockME customers looking for agistment."
      />
      {requests.length === 0 ? (
        <RealAccountEmptyState
          title="No open requests yet."
          body="Livestock requests will appear here as owners publish them. You can prepare a paddock listing now so it is ready to offer."
          primaryHref="/listings/new"
          primaryLabel="List a paddock"
          secondaryHref="/listings"
          secondaryLabel="Browse paddocks"
        />
      ) : (
        <RequestsClient
          requests={requests}
          requestersById={requesters}
          paddockListings={listings}
          currentUserId={currentUserProfile.id}
        />
      )}
    </>
  );
}
