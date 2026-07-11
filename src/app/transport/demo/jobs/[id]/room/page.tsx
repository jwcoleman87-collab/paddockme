"use client";

import { MoveRight, Route, Truck, Users } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { ConfirmedDetailsCard } from "@/components/paddockme/transporter/ConfirmedDetailsCard";
import { MovementActionCard } from "@/components/paddockme/transporter/MovementActionCard";
import {
  TransportDiscussionPanel,
  useTransporterThread,
} from "@/components/paddockme/transporter/TransportDiscussionPanel";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import {
  demoPrimaryTransportJob,
  demoTransportConfirmedDetails,
  transporterMovementUpdateMessages,
} from "@/lib/paddockmeDemoData";
import {
  TRANSPORTER_MOVEMENT_STEPS,
  usePaddockmeWorkflow,
  type TransporterMovementStep,
} from "@/lib/paddockmeWorkflow";

export default function TransporterRoomPage() {
  const {
    state,
    hasHydrated,
    startTransporterMovement,
    advanceTransporterMovement,
  } = usePaddockmeWorkflow();
  const thread = useTransporterThread(state.request);
  const { transporter } = state;
  const canOpen =
    transporter.stage === "awarded" ||
    transporter.stage === "active" ||
    transporter.stage === "completed";

  if (!hasHydrated || !thread.hasHydrated) {
    return <div className="min-h-dvh bg-pm-cream-50" />;
  }

  if (!canOpen) {
    return (
      <TransporterShell title="Shared job room" backHref="/transport/demo" backLabel="Transport work">
        <TransporterPrerequisite
          title="This job has not been awarded yet"
          body="The shared operational room opens after Wayne submits a quote and James awards the movement."
          href={transporter.quote
            ? `/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/awarded`
            : `/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/quote`}
          action={transporter.quote ? "View quote outcome" : "Build your quote"}
        />
      </TransporterShell>
    );
  }

  const currentIndex = transporter.movementStep
    ? TRANSPORTER_MOVEMENT_STEPS.findIndex(
        (step) => step.key === transporter.movementStep,
      )
    : -1;
  const next =
    transporter.stage === "awarded"
      ? TRANSPORTER_MOVEMENT_STEPS[0]
      : TRANSPORTER_MOVEMENT_STEPS[currentIndex + 1] ?? null;
  const currentLabel =
    TRANSPORTER_MOVEMENT_STEPS[currentIndex]?.label ??
    (transporter.stage === "awarded" ? "Awarded" : "Delivery complete");

  function postReachedStep(step: TransporterMovementStep) {
    const label =
      TRANSPORTER_MOVEMENT_STEPS.find((item) => item.key === step)?.label ??
      step;
    const updates = transporterMovementUpdateMessages(state.request)[step];
    updates.forEach((update) =>
      thread.appendSharedUpdate({
        ...update,
        text: `${label} — ${update.text}`,
      }),
    );
  }

  function advance() {
    const reached =
      transporter.stage === "awarded"
        ? startTransporterMovement()
        : advanceTransporterMovement();
    if (reached) postReachedStep(reached);
  }

  return (
    <TransporterShell
      title="Shared job room"
      description="The pre-quote RFT discussion stays here while Wayne coordinates the same movement with James and John."
      backHref="/transport/demo"
      backLabel="Transport work"
      status={currentLabel}
    >
      <section className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-pm-gold-600">Agistment #1023 · Shared movement</p>
            <h2 className="mt-1 text-xl font-extrabold text-pm-charcoal">Dubbo to Green Hills Farm</h2>
          </div>
          <span className="rounded-full bg-pm-success/10 px-3 py-1 text-sm font-bold text-pm-success">
            Wayne Transport · {state.transporter.quote?.totalPrice ?? "$2,200"}
          </span>
        </div>
        <div className="mt-4 grid gap-3 border-t border-pm-border pt-4 sm:grid-cols-3">
          <Summary icon={Truck} label="Livestock" value={demoPrimaryTransportJob.livestock} />
          <Summary icon={Route} label="Route" value={`${demoPrimaryTransportJob.distanceKm} km`} />
          <Summary icon={Users} label="Shared with" value="James, John and Wayne" />
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <TransportDiscussionPanel
          messages={thread.messages}
          onSend={thread.appendWayne}
          title="Shared updates"
          description="The original RFT discussion, Wayne's road updates and both farmers' confirmations remain together."
          updatesLabel="Shared updates"
        />
        <aside className="min-w-0 space-y-5 md:sticky md:top-24 md:self-start">
          <MovementActionCard
            steps={TRANSPORTER_MOVEMENT_STEPS}
            currentStep={transporter.movementStep}
            nextLabel={next?.label ?? null}
            onAdvance={advance}
          />
          <ConfirmedDetailsCard details={demoTransportConfirmedDetails} compact />
          {transporter.stage === "completed" && (
            <PmButton href={`/transport/demo/jobs/${demoPrimaryTransportJob.agreementId}/complete`} className="w-full">
              View delivery record
              <MoveRight className="h-4 w-4" aria-hidden />
            </PmButton>
          )}
        </aside>
      </div>
    </TransporterShell>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-pm-green-900" aria-hidden />
      <div>
        <p className="text-xs font-semibold text-pm-muted">{label}</p>
        <p className="text-sm font-bold text-pm-charcoal">{value}</p>
      </div>
    </div>
  );
}
