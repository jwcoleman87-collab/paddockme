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
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport RFT map"
          title="Farmer routes and feed runs waiting for carriers."
          description="Live RFT routes raised from agistment agreements will appear here for carriers."
        />
        <RealAccountEmptyState
          title="No RFT routes yet."
          body="Routes raised from agistment agreements will appear here for carriers to quote on."
          primaryHref="/agreements"
          primaryLabel="Back to agreements"
          secondaryHref="/preview/transport"
          secondaryLabel="See how transport works"
        />
      </>
    );
  }
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
