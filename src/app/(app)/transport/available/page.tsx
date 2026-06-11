import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";

/**
 * Carrier capacity (backload) posting was a demo-mode surface. With demo
 * mode retired this page is an honest placeholder until the capacity
 * marketplace is rebuilt on Supabase under its own brief (logged in
 * SPEC_DRIFT.md). Live RFT work lives on the jobs board.
 */
export default function TransportAvailablePage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport marketplace"
        title="Trucks with capacity."
        description="Driver-posted runs will appear here once carriers can publish availability."
        action={
          <ButtonLink href="/transport/jobs" variant="secondary">
            Live RFT board
          </ButtonLink>
        }
      />
      <RealAccountEmptyState
        title="Capacity posting is coming soon."
        body="Carriers will be able to publish available runs and backloads here. Until then, live livestock movements are on the RFT board."
        primaryHref="/transport/jobs"
        primaryLabel="Open the RFT board"
        secondaryHref="/agreements"
        secondaryLabel="Back to dashboard"
      />
    </>
  );
}
