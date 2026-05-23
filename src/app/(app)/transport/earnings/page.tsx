import { CircleDollarSign } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

export default function TransportEarningsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport earnings"
        title="Earnings view."
        description="A lightweight placeholder for driver earnings. Payments and payout logic are intentionally out of scope for this MVP build."
      />
      <Card className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
          <CircleDollarSign className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-sage-deep">Coming later.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          This view records job status only for now. Real invoices, payouts,
          GST, and Stripe are a later sprint.
        </p>
        <ButtonLink href="/transport/calendar" className="mt-4 inline-flex">
          Back to calendar
        </ButtonLink>
      </Card>
    </>
  );
}
