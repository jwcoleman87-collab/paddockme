import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  agreements,
  farmers,
  paddockListings,
  transportJobs,
} from "@/lib/dummyData";
import { AgreementsClient } from "./AgreementsClient";

export default function AgreementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="Your work, by role."
        description="Switch personas to see how the home view adapts. Livestock owners and landowners see their agreements; transport providers see their jobs."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

      <AgreementsClient
        farmers={farmers}
        agreements={agreements}
        transportJobs={transportJobs}
        listings={paddockListings}
      />
    </>
  );
}
