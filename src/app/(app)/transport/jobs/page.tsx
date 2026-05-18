import { PageHeader } from "@/components/PageHeader";
import { TransportJobsClient } from "../TransportJobsClient";

export default function TransportJobsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Available transport jobs"
        title="Jobs Wayne can accept."
        description="Transport requests created from agreement workspaces appear here until a driver accepts them."
      />
      <TransportJobsClient mode="jobs" />
    </>
  );
}
