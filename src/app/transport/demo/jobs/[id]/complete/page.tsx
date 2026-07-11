"use client";

import { CalendarCheck2, CheckCircle2, FileText, MoveRight, Receipt, Truck, Users } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import {
  formatAudPrice,
  formatDateTimeAu,
} from "@/components/paddockme/transporter/format";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import { demoPrimaryTransportJob } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

export default function TransporterCompletePage() {
  const { state, hasHydrated } = usePaddockmeWorkflow();
  const { transporter } = state;

  if (!hasHydrated) {
    return <div className="min-h-dvh bg-pm-cream-50" />;
  }

  if (transporter.stage !== "completed" || !transporter.completedAt) {
    return (
      <TransporterShell title="Completed transport work" backHref="/transport/demo" backLabel="Transport work">
        <TransporterPrerequisite
          title="Delivery is not complete yet"
          body="Wayne's completed record appears after every shared movement update reaches Delivery complete."
          href={transporter.stage === "awarded" || transporter.stage === "active"
            ? `/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/room`
            : "/transport/demo"}
          action={transporter.stage === "awarded" || transporter.stage === "active" ? "Open shared job room" : "View transport work"}
        />
      </TransporterShell>
    );
  }

  const quotePrice = formatAudPrice(transporter.quote?.totalPrice ?? "$2,200");
  const invoiceLabel =
    transporter.invoiceStatus === "invoice_sent"
      ? "Invoice sent · Payment pending"
      : "Invoice ready · Payment pending";

  return (
    <TransporterShell
      title="Delivery complete"
      description="Wayne has a proper commercial ending and all three parties retain the same completed movement record."
      backHref={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/room`}
      backLabel="Shared job room"
      status="Completed"
    >
      <section className="overflow-hidden rounded-2xl border border-pm-success/30 bg-white shadow-sm">
        <div className="bg-pm-green-900 p-6 text-white sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pm-gold-500 text-pm-charcoal">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold">120 cattle delivered to Green Hills Farm</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80">
            Final count confirmed, livestock unloaded in good order and John has confirmed arrival.
          </p>
        </div>

        <dl className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
          <RecordFact icon={Truck} label="Delivered livestock" value={`${transporter.deliveredHeadCount ?? demoPrimaryTransportJob.headCount} ${demoPrimaryTransportJob.livestockType.toLowerCase()}`} />
          <RecordFact icon={CalendarCheck2} label="Completed" value={formatDateTimeAu(transporter.completedAt, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })} />
          <RecordFact icon={Receipt} label="Agreed transport amount" value={`${quotePrice} inc. GST`} />
          <RecordFact icon={FileText} label="Invoice and payment" value={invoiceLabel} />
          <RecordFact icon={Users} label="Shared record" value="James, John and Wayne" />
          <RecordFact icon={CheckCircle2} label="Movement status" value="Delivery complete" />
        </dl>

        <div className="border-t border-pm-border bg-pm-cream-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h3 className="text-lg font-extrabold text-pm-charcoal">Ready for the next movement</h3>
            <p className="mt-1 text-base text-pm-muted">This job stays under Completed while Wayne returns to available work.</p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row">
            <PmButton href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/room`} variant="outline" className="w-full sm:w-auto">
              Shared movement record
            </PmButton>
            <PmButton href="/transport/demo" variant="accent" className="w-full sm:w-auto">
              Find more jobs
              <MoveRight className="h-4 w-4" aria-hidden />
            </PmButton>
          </div>
        </div>
      </section>
    </TransporterShell>
  );
}

function RecordFact({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-pm-border bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <dt className="text-sm text-pm-muted">{label}</dt>
        <dd className="mt-0.5 text-base font-bold text-pm-charcoal">{value}</dd>
      </div>
    </div>
  );
}
