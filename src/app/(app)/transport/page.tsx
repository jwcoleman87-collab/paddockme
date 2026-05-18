import { PageHeader } from "@/components/PageHeader";
import { TransportJobsClient } from "./TransportJobsClient";

export default function TransportPortalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Driver portal"
        title="Wayne's transport workbench."
        description="Browse available stock movements, open accepted jobs, and keep the transport leg moving."
      />
      <TransportJobsClient mode="portal" />
    </>
  );
}
