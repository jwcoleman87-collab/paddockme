import { PageHeader } from "@/components/PageHeader";
import { TransportJobsClient } from "../TransportJobsClient";

export default function TransportJobsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport jobs map"
        title="Wayne's operational jobs board."
        description="Browse available, accepted, in-transit, and completed stock transport work with routes, status, distance, timing, and totals."
      />
      <TransportJobsClient mode="jobs" />
    </>
  );
}
