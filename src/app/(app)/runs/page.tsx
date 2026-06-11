import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

export default async function RunsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) redirect("/sign-in?next=%2Fruns");

  return (
    <>
      <PageHeader
        eyebrow="Run pipeline"
        title="Your run pipeline."
        description="Live transport runs will appear here once real customer jobs are accepted."
      />
      <RealAccountEmptyState
        title="No runs yet."
        body="Post transport availability or review open transport jobs to start building your pipeline."
        primaryHref="/transport/available"
        primaryLabel="Post availability"
        secondaryHref="/transport/jobs"
        secondaryLabel="View transport jobs"
      />
    </>
  );
}
