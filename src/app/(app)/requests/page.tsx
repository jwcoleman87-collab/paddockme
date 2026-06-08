import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import {
  farmers,
  livestockRequests,
  paddockListings,
  type Farmer,
} from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Open requests"
          title="Livestock seeking paddocks."
          description="Live livestock requests from customers will appear here."
          action={
            <ButtonLink href="/listings/new" variant="secondary">
              List a paddock
            </ButtonLink>
          }
        />
        <RealAccountEmptyState
          title="No live livestock requests yet."
          body="List a paddock or check back as livestock owners begin posting requests."
          primaryHref="/listings/new"
          primaryLabel="List a paddock"
          secondaryHref="/agreements"
          secondaryLabel="Back to my work"
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
