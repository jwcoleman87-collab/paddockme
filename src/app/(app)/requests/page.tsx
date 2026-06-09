import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  farmers,
  livestockRequests,
  paddockListings,
  type Farmer,
} from "@/lib/dummyData";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Open requests"
          title="Livestock seeking paddocks."
          description="Live requests from other PaddockME customers will appear here."
          action={
            <ButtonLink href="/listings/new" variant="secondary">
              List a paddock
            </ButtonLink>
          }
        />
        <RealAccountEmptyState
          title="No open requests yet."
          body="Live livestock requests will appear here as customers post them. Post your own request, or list a paddock to start receiving inquiries."
          primaryHref="/request/new"
          primaryLabel="Post a request"
          secondaryHref="/listings/new"
          secondaryLabel="List a paddock"
        />
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
