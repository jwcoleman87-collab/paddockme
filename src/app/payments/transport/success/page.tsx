import { CheckCircle, ReceiptText } from "lucide-react";
import { ButtonLink } from "@/components/Button";

export default async function TransportPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
    transport_job_id?: string;
  }>;
}) {
  const params = await searchParams;
  const transportJobId = params.transport_job_id ?? "transport-glenbarra";

  return (
    <main className="min-h-dvh bg-warm-white px-5 py-10 text-bark">
      <section className="mx-auto max-w-2xl rounded-[8px] border border-match/25 bg-cream p-6 shadow-[0_10px_28px_rgba(63,51,40,0.07)]">
        <div className="mb-4 flex items-center gap-3 text-sage-deep">
          <CheckCircle className="h-7 w-7 text-match" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            Stripe test mode
          </p>
        </div>
        <h1 className="text-3xl font-bold text-sage-deep">
          Transport payment recorded
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-bark/70">
          Stripe returned a successful Checkout Session. In the database-backed
          path, the webhook records this against the transport payable and
          leaves payout settlement for a later milestone.
        </p>
        {params.session_id && (
          <p className="mt-4 rounded-lg border border-mist bg-warm-white px-3 py-2 text-xs text-bark/65">
            Session: {params.session_id}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/transport/${transportJobId}`}>
            <ReceiptText className="h-4 w-4" aria-hidden />
            Back to transport room
          </ButtonLink>
          <ButtonLink href="/agreements" variant="secondary">
            Agreements
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

