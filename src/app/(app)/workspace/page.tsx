import { redirect } from "next/navigation";
import { agreements } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { listAgreementSummariesForUserServer } from "@/lib/data/serverPaddocks";

export default async function WorkspaceIndexPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    // The nav "Workspace" tab lands here. Bouncing real users to /agreements
    // felt like "it won't let me into the workspace" - send them straight to
    // their most recent agreement workspace instead.
    const summaries = await listAgreementSummariesForUserServer();
    if (summaries.length > 0) {
      redirect(`/workspace/${summaries[0].id}`);
    }
    redirect("/agreements");
  }

  const first = agreements[0];
  if (!first) {
    redirect("/agreements");
  }
  redirect(`/workspace/${first.id}`);
}
