"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { ConfirmedDetailsCard } from "@/components/paddockme/transporter/ConfirmedDetailsCard";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import {
  TransportDiscussionPanel,
  useTransporterThread,
} from "@/components/paddockme/transporter/TransportDiscussionPanel";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import {
  demoPrimaryTransportJob,
  demoTransportConfirmedDetails,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

export default function TransporterDiscussionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    state,
    hasHydrated,
    startTransporterDiscussion,
    confirmTransporterDiscussion,
  } = usePaddockmeWorkflow();
  const thread = useTransporterThread(state.request);
  const { transporter } = state;
  // Direct navigation straight after a reset must not silently re-open a
  // live discussion: Wayne reaches this thread through the job details.
  const canDiscuss =
    transporter.selectedJobId !== null ||
    transporter.discussionStarted ||
    transporter.stage !== "available";

  useEffect(() => {
    if (hasHydrated && canDiscuss) {
      startTransporterDiscussion(demoPrimaryTransportJob.id);
    }
    // Start this route's scripted discussion once on legitimate entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, hasHydrated, canDiscuss]);

  if (!hasHydrated) {
    return <div className="min-h-dvh bg-pm-cream-50" />;
  }

  if (!canDiscuss) {
    return (
      <TransporterShell
        title="RFT discussion"
        backHref="/transport/demo"
        backLabel="Transport work"
      >
        <TransporterPrerequisite
          title="Start with the job details"
          body="Open the livestock movement first so Wayne is discussing a specific job with James and John."
          href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}`}
          action="Open job details"
        />
      </TransporterShell>
    );
  }

  function continueToQuote() {
    confirmTransporterDiscussion();
    router.push(`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/quote`);
  }

  return (
    <TransporterShell
      title="Discuss job with both farmers"
      description="Wayne is not quoting blindly. James, John and Wayne clarify one movement together before a price is submitted."
      backHref={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}`}
      backLabel="Job details"
      status="Private RFT discussion"
    >
      {!thread.hasHydrated ? (
        <div className="h-96 animate-pulse rounded-2xl border border-pm-border bg-white" aria-label="Loading discussion" />
      ) : (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <TransportDiscussionPanel
            messages={thread.messages}
            onSend={thread.appendWayne}
            title="RFT discussion"
            updatesLabel="Shared updates"
          />
          <aside className="min-w-0 space-y-4 md:sticky md:top-24 md:self-start">
            <ConfirmedDetailsCard details={demoTransportConfirmedDetails} compact />
            <section className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-pm-charcoal">Ready to quote with confidence?</h2>
              <p className="mt-2 text-sm leading-relaxed text-pm-muted">
                These five outcomes stay attached to Wayne's quote and continue into the awarded job room.
              </p>
              <PmButton type="button" variant="accent" onClick={continueToQuote} className="mt-4 w-full">
                Use confirmed details and continue
                <MoveRight className="h-4 w-4" aria-hidden />
              </PmButton>
            </section>
          </aside>
        </div>
      )}
    </TransporterShell>
  );
}
