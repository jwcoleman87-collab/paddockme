import { PageHeader } from "@/components/PageHeader";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { TransportJobsClient } from "./TransportJobsClient";

export default function TransportPortalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport"
        title="Transport coordination."
        description="Track carrier details and movement status, or manage driver jobs when you are operating transport."
      />
      <PersonaIntroBanner page="transport-portal" />
      <TransportJobsClient mode="portal" />
    </>
  );
}
