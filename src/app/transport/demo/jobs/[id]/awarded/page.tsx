"use client";

import { useEffect } from "react";
import { CheckCircle2, CalendarDays, MoveRight, Route, Truck, Trophy } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { formatAudPrice } from "@/components/paddockme/transporter/format";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import { demoPrimaryTransportJob } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

export default function TransporterAwardedPage() {
  const { state, hasHydrated, awardTransporterJob } = usePaddockmeWorkflow();
  const quote = state.transporter.quote;

  useEffect(() => {
    if (hasHydrated && quote && state.transporter.stage === "quoted") {
      awardTransporterJob();
    }
  }, [hasHydrated, quote, state.transporter.stage, awardTransporterJob]);

  if (!hasHydrated) {
    return <div className="min-h-dvh bg-pm-cream-50" />;
  }

  if (!quote) {
    return (
      <TransporterShell title="Awarded transport work" backHref="/transport/demo?view=quotes" backLabel="My quotes">
        <TransporterPrerequisite
          title="No submitted quote yet"
          body="Wayne must confirm the RFT discussion and submit a quote before this scripted award can arrive."
          href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/quote`}
          action="Build your quote"
        />
      </TransporterShell>
    );
  }

  return (
    <TransporterShell
      title="You've been awarded this job"
      description="James selected Wayne's informed quote. The original RFT conversation now continues as the operational job room."
      backHref="/transport/demo?view=awarded"
      backLabel="Awarded work"
      status="Awarded"
    >
      <section className="overflow-hidden rounded-2xl border border-pm-success/30 bg-white shadow-sm">
        <div className="bg-pm-green-900 p-6 text-white sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pm-gold-500 text-pm-charcoal">
            <Trophy className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold">Dubbo to Green Hills Farm</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/80">
            120 cattle moving on the plan Wayne confirmed with James and John.
          </p>
        </div>

        <dl className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          <AwardFact icon={Truck} label="Livestock" value={demoPrimaryTransportJob.livestock} />
          <AwardFact icon={Route} label="Route" value={`${demoPrimaryTransportJob.pickup} → ${demoPrimaryTransportJob.destination}`} />
          <AwardFact icon={CheckCircle2} label="Agreed price" value={`${formatAudPrice(quote.totalPrice)} inc. GST`} />
          <AwardFact icon={CalendarDays} label="Confirmed pickup" value={`${demoPrimaryTransportJob.preferredDate} · 6:30 AM`} />
        </dl>

        <div className="border-t border-pm-border bg-pm-cream-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h3 className="text-lg font-extrabold text-pm-charcoal">What happens next</h3>
            <p className="mt-1 text-base text-pm-muted">Open the shared room, keep the same conversation and post one road update at a time.</p>
          </div>
          <PmButton href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/room`} variant="accent" className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
            Open shared job room
            <MoveRight className="h-4 w-4" aria-hidden />
          </PmButton>
        </div>
      </section>
    </TransporterShell>
  );
}

function AwardFact({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
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
