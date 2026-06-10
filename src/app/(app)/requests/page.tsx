import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { CirclePlus } from "lucide-react";
import {
  farmers,
  livestockRequests,
  paddockListings,
  type Farmer,
} from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listLivestockRequestsServer,
  listProfilesByIdServer,
  listSupabasePaddockListingsServer,
} from "@/lib/data/serverPaddocks";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
  const currentUserProfile = await getCurrentUserProfile();

  // Real signed-in users see genuine open livestock requests (no Dale/Brett
  // seed). Landowners browse these to offer paddocks against; livestock owners
  // can see what else is being sought.
  if (currentUserProfile) {
    const [requests, listings] = await Promise.all([
      listLivestockRequestsServer(),
      listSupabasePaddockListingsServer(),
    ]);
    // Show real requester names on the cards instead of a generic
    // "Livestock owner" label.
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
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
              Live livestock requests will appear here as customers post them.
              Check back shortly for livestock owners looking for paddock
              capacity.
            </p>
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

  const requestersById: Record<string, Farmer> = {};
  for (const farmer of farmers) requestersById[farmer.id] = farmer;

  return (
    <>
      <PageHeader
        eyebrow="Open requests"
        title="Livestock seeking paddocks."
        description="Landowners browse open inquiries here. Mirror surface to the capacity board for drivers and the paddock listings for livestock owners."
        action={
          <ButtonLink href="/listings/new" variant="secondary">
            List a paddock
          </ButtonLink>
        }
      />
      <RequestsClient
        requests={livestockRequests}
        requestersById={requestersById}
        paddockListings={paddockListings}
      />
    </>
  );
}
