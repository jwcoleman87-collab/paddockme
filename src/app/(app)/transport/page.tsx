import { PageHeader } from "@/components/PageHeader";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { TransportJobsClient } from "./TransportJobsClient";

export default function TransportPortalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Driver portal"
        title="Transport workbench."
        description="Browse available stock movements, open accepted jobs, and keep the transport leg moving."
      />
      <PersonaIntroBanner page="transport-portal" />
      <TransportJobsClient mode="portal" />
    </>
  );
}
