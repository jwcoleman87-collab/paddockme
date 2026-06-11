import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { listAgreementSummariesForUserServer } from "@/lib/data/serverPaddocks";

export default async function WorkspaceIndexPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fworkspace");
  }

  // The nav "Workspace" tab lands here: open the most recent agreement
  // workspace, or the dashboard when none exist yet.
  const summaries = await listAgreementSummariesForUserServer();
  if (summaries.length > 0) {
    redirect(`/workspace/${summaries[0].id}`);
  }
  redirect("/agreements");
}
