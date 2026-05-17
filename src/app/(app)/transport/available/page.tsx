import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  farmers,
  listTransportCapacities,
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

  return (
    <>
      <PageHeader
        eyebrow="Transport marketplace"
        title="Trucks with capacity."
        description="Browse runs drivers have posted. Filter by origin, destination, and stock fit - same chip pattern as paddock browse. Tap to send a quote request."
        action={
          <ButtonLink href="/transport" variant="secondary">
            Live transport jobs
          </ButtonLink>
        }
      />

      <CapacityClient capacities={capacities} drivers={driverLookup} />
    </>
  );
}
