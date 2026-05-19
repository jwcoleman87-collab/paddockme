import { PageHeader } from "@/components/PageHeader";
import {
  farmers,
  transportCapacities,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import { RunsClient } from "./RunsClient";

export default function RunsPage() {
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
        description="Active runs, open offers, and recently delivered jobs - plus capacity you've posted to find more work."
      />
      <RunsClient
        drivers={drivers}
        transportJobs={transportJobs}
        transportCapacities={transportCapacities}
        farmersById={farmersById}
      />
    </>
  );
}
