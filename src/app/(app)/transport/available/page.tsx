import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  farmers,
  listTransportCapacities,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import { CapacityClient } from "./CapacityClient";

export default function TransportAvailablePage() {
  const capacities = listTransportCapacities();
  // Build a quick lookup so the client can render driver names + fleet size
  // alongside each capacity row without needing a second fetch.
  const driverLookup: Record<string, Farmer | undefined> = {};
  for (const capacity of capacities) {
    if (!driverLookup[capacity.driverId]) {
      driverLookup[capacity.driverId] = farmers.find(
        (farmer) => farmer.id === capacity.driverId
      );
    }
  }

  // Map driverId -> the transport job they're currently on (if any). The
  // "Request this run" CTA routes the farmer into that room when the driver
  // is already in flight on something, so the conversation gets a real
  // surface to land on.
  const driverActiveRoom: Record<string, string | undefined> = {};
  for (const job of transportJobs) {
    if (!driverActiveRoom[job.driverId]) {
      driverActiveRoom[job.driverId] = job.id;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Transport marketplace"
        title="Trucks with capacity."
        description="Browse runs drivers have posted, filter by route and stock fit, then send a quote request from the run that suits."
        action={
          <ButtonLink href="/transport" variant="secondary">
            Live transport jobs
          </ButtonLink>
        }
      />

      <CapacityClient
        capacities={capacities}
        drivers={driverLookup}
        driverActiveRoom={driverActiveRoom}
      />
    </>
  );
}
