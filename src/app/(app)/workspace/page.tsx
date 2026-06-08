import { redirect } from "next/navigation";
import { agreements } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

export default async function WorkspaceIndexPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    redirect("/agreements");
  }

  const first = agreements[0];
  if (!first) {
    redirect("/agreements");
  }
  redirect(`/workspace/${first.id}`);
}
