import { redirect } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
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
        <Card className="text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
            <CirclePlus className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-sage-deep">
            No open requests yet.
          </h1>
        </Card>
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
