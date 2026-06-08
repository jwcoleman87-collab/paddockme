import { PageHeader } from "@/components/PageHeader";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import {
  farmers,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import { feedRuns } from "@/lib/feedRuns";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { RunsClient } from "./RunsClient";

export default async function RunsPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
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

  const drivers = farmers.filter(
    (farmer) => farmer.role === "Transport Provider"
  );
  const farmersById: Record<string, Farmer> = {};
  for (const farmer of farmers) farmersById[farmer.id] = farmer;

  return (
    <>
      <PageHeader
        eyebrow="Driver home"
        title="Your run pipeline."
        description="Active runs, farmer RFTs, feed cartage for hay and silage, and recently delivered jobs."
      />
      <PersonaIntroBanner page="runs" />
      <RunsClient
        drivers={drivers}
        transportJobs={transportJobs}
        feedRuns={feedRuns}
        farmersById={farmersById}
      />
    </>
  );
}
