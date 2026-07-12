"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, MoveRight } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { ConfirmedDetailsCard } from "@/components/paddockme/transporter/ConfirmedDetailsCard";
import {
  TransportQuoteForm,
  type TransportQuoteFields,
} from "@/components/paddockme/transporter/TransportQuoteForm";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import {
  formatAudPrice,
  formatDateTimeAu,
} from "@/components/paddockme/transporter/format";
import {
  demoPrimaryTransportJob,
  demoTransportConfirmedDetails,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

export default function TransporterQuotePage() {
  const router = useRouter();
  const {
    state,
    hasHydrated,
    submitTransporterQuote,
    awardTransporterJob,
  } = usePaddockmeWorkflow();
  const quote = state.transporter.quote;

  if (!hasHydrated) {
    return <div className="min-h-dvh bg-pm-cream-50" />;
  }

  if (!state.transporter.discussionConfirmed) {
    return (
      <TransporterShell title="Quote with confidence" backHref={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}`} backLabel="Job details">
        <TransporterPrerequisite
          title="Discuss this job before quoting"
          body="Wayne needs the shared access, loading and receiving details confirmed by James and John before submitting a reliable price."
          href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/discussion`}
          action="Discuss job"
        />
      </TransporterShell>
    );
  }

  function submit(fields: TransportQuoteFields) {
    submitTransporterQuote(fields);
  }

  function showOutcome() {
    awardTransporterJob();
    router.push(`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/awarded`);
  }

  return (
    <TransporterShell
      title={quote ? "Quote submitted" : "Quote with confidence"}
      description={quote
        ? "Wayne's quote is now visible to James and remains connected to the shared RFT discussion."
        : "Price the movement from the practical details all three parties have confirmed."}
      backHref={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/discussion`}
      backLabel="RFT discussion"
      status={quote ? "Submitted" : "Draft quote"}
    >
      <div className="space-y-6">
        <ConfirmedDetailsCard details={demoTransportConfirmedDetails} />

        {quote ? (
          <section className="rounded-2xl border border-pm-success/30 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pm-success text-white">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-pm-charcoal">Wayne&apos;s submitted quote</h2>
                <p className="mt-1 text-base text-pm-muted">Saved under My quotes and ready for James to review.</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-y border-pm-border py-5 sm:grid-cols-2 lg:grid-cols-3">
              <QuoteFact label="Total price" value={`${formatAudPrice(quote.totalPrice)} inc. GST`} />
              <QuoteFact label="Availability" value={quote.availability} />
              <QuoteFact label="Estimated arrival" value={quote.estimatedArrival} />
              <QuoteFact label="Truck or trailer" value={quote.equipment} />
              <QuoteFact label="Conditions or notes" value={quote.notes || "No additional conditions"} />
              <QuoteFact label="Submitted" value={formatDateTimeAu(quote.submittedAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })} />
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <PmButton href="/transport/demo?view=quotes" variant="outline" className="w-full sm:w-auto">
                View my quotes
              </PmButton>
              <PmButton type="button" variant="accent" onClick={showOutcome} className="w-full sm:w-auto">
                See quote outcome
                <MoveRight className="h-4 w-4" aria-hidden />
              </PmButton>
            </div>
          </section>
        ) : (
          <TransportQuoteForm onSubmit={submit} />
        )}
      </div>
    </TransporterShell>
  );
}

function QuoteFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-pm-muted">{label}</dt>
      <dd className="mt-1 text-base font-bold text-pm-charcoal">{value}</dd>
    </div>
  );
}
