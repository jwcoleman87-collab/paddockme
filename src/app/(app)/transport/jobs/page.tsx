import { PageHeader } from "@/components/PageHeader";
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
