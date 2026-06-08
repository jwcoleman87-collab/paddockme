import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  farmers,
  livestockRequests,
  paddockListings,
  type Farmer,
} from "@/lib/dummyData";
import { RequestsClient } from "./RequestsClient";

export default async function RequestsPage() {
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
