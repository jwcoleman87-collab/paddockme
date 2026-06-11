import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { listTransportJobsBoardServer } from "@/lib/data/serverPaddocks";
import { RealJobsBoard } from "./RealJobsBoard";

export default async function TransportJobsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Ftransport%2Fjobs");
  }

  // Live Supabase RFT board. Transport providers see every still-available
  // job (driver-discovery RLS policy) plus their accepted work; farmers see
  // the jobs raised from their agreements.
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
