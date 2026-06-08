import { PageHeader } from "@/components/PageHeader";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { TransportJobsClient } from "./TransportJobsClient";

export default async function TransportPortalPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport"
          title="Transport coordination."
          description="Live transport jobs and availability will appear here once real records exist."
        />
        <RealAccountEmptyState
          title="No transport activity yet."
          body="Post transport availability or create a request/listing first, then transport coordination will appear here."
          primaryHref="/transport/available"
          primaryLabel="Post availability"
          secondaryHref="/preview/transport"
          secondaryLabel="Preview transport"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Transport"
        title="Transport coordination."
        description="Track carrier details and movement status, or browse farmer RFT routes when you are operating transport."
      />
      <PersonaIntroBanner page="transport-portal" />
      <TransportJobsClient mode="portal" />
    </>
  );
}
