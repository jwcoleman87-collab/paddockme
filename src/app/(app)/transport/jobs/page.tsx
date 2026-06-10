import { PageHeader } from "@/components/PageHeader";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { listTransportJobsBoardServer } from "@/lib/data/serverPaddocks";
import { TransportJobsClient } from "../TransportJobsClient";
import { RealJobsBoard } from "./RealJobsBoard";

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
    // Real RFT board: live Supabase jobs. Transport providers see every
    // still-available job (driver-discovery RLS policy) plus their accepted
    // work; farmers see the jobs raised from their agreements.
    const jobs = await listTransportJobsBoardServer();
    const isTransportProvider = currentUserProfile.accountTypes.includes(
      "Transport Provider"
    );
    return (
      <>
        <PageHeader
          eyebrow="Transport RFT board"
          title="Livestock routes waiting for carriers."
          description={
            isTransportProvider
              ? "Live RFTs raised from agistment agreements. Accept a job to open its transport room - route, load, and timing only, never private agistment terms."
              : "Transport jobs raised from your agreements. Open a job to follow its status and chat with the carrier."
          }
        />
        <RealJobsBoard jobs={jobs} isTransportProvider={isTransportProvider} />
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
