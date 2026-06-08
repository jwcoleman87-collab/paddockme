import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import {
  farmers,
  listTransportCapacities,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { CapacityClient } from "./CapacityClient";

export default async function TransportAvailablePage() {
  // For a real signed-in account, never show the Dale/Brett/Wayne prototype
  // capacity rows. Real backloads will come from Supabase once that surface
  // is wired; until then, show the empty state invite.
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Transport marketplace"
          title="Trucks with capacity."
          description="Driver-posted runs will appear here once carriers publish availability."
          action={
            <ButtonLink href="/transport" variant="secondary">
              Live transport jobs
            </ButtonLink>
          }
        />
        <RealAccountEmptyState
          title="No capacity posted yet."
          body="Drivers haven't posted available runs yet. Carriers can publish backloads from the transport workspace, and they'll show up here."
          primaryHref="/transport"
          primaryLabel="Open transport workspace"
          secondaryHref="/preview/transport"
          secondaryLabel="See how transport works"
        />
      </>
    );
  }

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
        eyebrow="Transport capacity"
        title="Trucks with capacity."
        description="Browse available carrier runs by route, timing, and stock fit. Carriers can publish capacity; farmers can keep an eye on options before they need to move stock."
        action={
          <ButtonLink href="/transport/jobs" variant="secondary">
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
