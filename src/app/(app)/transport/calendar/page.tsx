import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { TransportJobsClient } from "../TransportJobsClient";

export default async function TransportCalendarPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport calendar"
          title="Accepted movements."
          description="Accepted real movements will appear here."
        />
        <RealAccountEmptyState
          title="No accepted movements yet."
          body="Accepted transport jobs will appear in your calendar once real customer jobs are booked."
          primaryHref="/transport/jobs"
          primaryLabel="View transport jobs"
          secondaryHref="/transport/available"
          secondaryLabel="Post availability"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Transport calendar"
        title="Accepted movements."
        description="Accepted jobs sit here, then open into a room where status and timeline progress."
      />
      <TransportJobsClient mode="calendar" />
    </>
  );
}
