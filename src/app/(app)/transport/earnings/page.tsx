import { CircleDollarSign } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

export default function TransportEarningsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Transport earnings"
        title="Earnings."
        description="Driver invoices, payouts, GST, and settlement land here once payments are wired. The current build tracks job status, not money movement."
      />
      <Card className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
          <CircleDollarSign className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-sage-deep">Coming next.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          Real invoices, payouts, GST handling, and Stripe settlement are the
          next milestone. Today the room records the job; tomorrow it records
          the money.
        </p>
        <ButtonLink href="/transport/calendar" className="mt-4 inline-flex">
          Back to calendar
        </ButtonLink>
      </Card>
    </>
  );
}
