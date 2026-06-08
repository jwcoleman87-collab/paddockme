import { AlertCircle, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { createSandboxSessionId } from "@/lib/payments/sandboxCheckout";
import {
  findTransportPayableSnapshot,
  formatCurrency,
} from "@/lib/payments/transportPayables";

export default async function TransportSandboxCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    transport_job_id?: string;
    quote_id?: string;
  }>;
}) {
  const params = await searchParams;
  const transportJobId = params.transport_job_id ?? "";
  const quoteId = params.quote_id ?? "";
  const payable = findTransportPayableSnapshot(transportJobId, quoteId);

  if (!payable) {
    return (
      <main className="min-h-dvh bg-warm-white px-5 py-10 text-bark">
        <section className="mx-auto max-w-2xl rounded-[8px] border border-terra/25 bg-cream p-6 shadow-[0_10px_28px_rgba(63,51,40,0.07)]">
          <div className="mb-4 flex items-center gap-3 text-terra">
            <AlertCircle className="h-7 w-7" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-wide">
              Sandbox checkout unavailable
            </p>
          </div>
          <h1 className="text-3xl font-bold text-sage-deep">
            Transport payable not found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bark/70">
            This demo checkout could not find an accepted transport payable for
            the job and quote in the URL.
          </p>
          <div className="mt-6">
            <ButtonLink href="/transport/transport-glenbarra">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to transport room
            </ButtonLink>
          </div>
        </section>
      </main>
    );
  }

  const sessionId = createSandboxSessionId(payable);
  const successParams = new URLSearchParams({
    session_id: sessionId,
    transport_job_id: payable.transportJobId,
    mode: "sandbox",
  });
  const cancelParams = new URLSearchParams({
    transport_job_id: payable.transportJobId,
    mode: "sandbox",
  });

  return (
    <main className="min-h-dvh bg-warm-white px-5 py-10 text-bark">
      <section className="mx-auto max-w-2xl rounded-[8px] border border-amber/30 bg-cream p-6 shadow-[0_10px_28px_rgba(63,51,40,0.07)]">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sage-deep">
          <CreditCard className="h-7 w-7" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            Payment demo only
          </p>
          <StatusBadge tone="warning">No money moves</StatusBadge>
        </div>
        <h1 className="text-3xl font-bold text-sage-deep">
          Sandbox transport checkout
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-bark/70">
          Stripe is not configured for this preview, so this page simulates the
          checkout handoff. It does not collect card details, charge anyone, or
          release driver payout.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-mist bg-warm-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Amount
            </p>
            <p className="mt-1 text-xl font-bold text-bark">
              {formatCurrency(payable.amount, payable.currency)}{" "}
              {payable.currency}
            </p>
          </div>
          <div className="rounded-lg border border-mist bg-warm-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Payee
            </p>
            <p className="mt-1 text-xl font-bold text-bark">
              {payable.payeeLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-mist bg-warm-white px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            Description
          </p>
          <p className="mt-1 text-sm leading-relaxed text-bark/70">
            {payable.description}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/payments/transport/success?${successParams}`}>
            <CheckCircle className="h-4 w-4" aria-hidden />
            Record demo payment
          </ButtonLink>
          <ButtonLink
            href={`/payments/transport/cancel?${cancelParams}`}
            variant="secondary"
          >
            Cancel demo
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
