import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { TransportJobsClient } from "../TransportJobsClient";

type SearchParams = {
  work?: string;
};

export default async function TransportJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport jobs"
          title="Open transport work."
          description="Real transport requests will appear here once customers raise them."
        />
        <RealAccountEmptyState
          title="No open transport jobs yet."
          body="Post your availability or check back as customers start raising transport requests."
          primaryHref="/transport/available"
          primaryLabel="Post availability"
          secondaryHref="/agreements"
          secondaryLabel="Back to my work"
        />
      </>
    );
  }

  const params = await searchParams;
  const initialWorkFilter =
    params.work === "feed"
      ? "feed"
      : params.work === "livestock"
        ? "livestock"
        : "all";

  return (
    <>
      <PageHeader
        eyebrow="Transport RFT map"
        title="Farmer routes and feed runs waiting for carriers."
        description="Browse livestock RFTs raised from agistment agreements alongside feed freight such as hay and silage. Truckies see route, load, timing, and quote status without seeing private agistment terms."
      />
      <TransportJobsClient mode="jobs" initialWorkFilter={initialWorkFilter} />
    </>
  );
}
