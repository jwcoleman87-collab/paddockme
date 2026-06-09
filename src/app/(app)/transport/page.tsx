import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { TransportJobsClient } from "./TransportJobsClient";

export default async function TransportPortalPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport"
          title="Transport coordination."
          description="Live transport jobs will appear here once agreements raise transport requests."
        />
        <RealAccountEmptyState
          title="No transport jobs yet."
          body="When an agreement needs stock or feed moved, the transport job shows up here. Open an agreement to get started."
          primaryHref="/agreements"
          primaryLabel="Back to agreements"
          secondaryHref="/preview/transport"
          secondaryLabel="See how transport works"
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
