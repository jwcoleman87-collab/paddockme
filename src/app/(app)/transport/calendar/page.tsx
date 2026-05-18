import { PageHeader } from "@/components/PageHeader";
import { TransportJobsClient } from "../TransportJobsClient";

export default function TransportCalendarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport calendar"
        title="Accepted movements."
        description="Wayne's accepted jobs sit here, then open into a room where status and timeline progress."
      />
      <TransportJobsClient mode="calendar" />
    </>
  );
}
