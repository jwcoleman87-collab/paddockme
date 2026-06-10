import { AlertCircle, ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/Button";

export default async function TransportPaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{
    transport_job_id?: string;
    mode?: string;
  }>;
}) {
  const params = await searchParams;
  const transportJobId = params.transport_job_id ?? "transport-glenbarra";
  const sandboxMode = params.mode === "sandbox";

  return (
    <main className="min-h-dvh bg-warm-white px-5 py-10 text-bark">
      <section className="mx-auto max-w-2xl rounded-[8px] border border-amber/25 bg-cream p-6 shadow-[0_10px_28px_rgba(63,51,40,0.07)]">
        <div className="mb-4 flex items-center gap-3 text-sage-deep">
          <AlertCircle className="h-7 w-7 text-amber" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            {sandboxMode ? "Demo checkout cancelled" : "Payment cancelled"}
          </p>
        </div>
        <h1 className="text-3xl font-bold text-sage-deep">
          Transport payment still awaiting action
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-bark/70">
          {sandboxMode
            ? "No demo payment was marked complete. The transport payable remains open, and the livestock owner can return to the transport room to try again."
            : "No payment was recorded. The transport payable remains open, and the livestock owner can return to the transport room to start checkout again."}
        </p>
        <div className="mt-6">
          <ButtonLink href={`/transport/${transportJobId}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to transport room
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
