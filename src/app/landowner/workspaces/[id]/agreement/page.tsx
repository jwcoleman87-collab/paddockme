"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import {
  ChatPanel,
  LiveAgreementPanel,
  NegotiationStep,
} from "@/components/paddockme/WorkspacePanels";
import {
  demoConversation,
  demoLivestockOwner,
  demoLandowner,
  demoRequest,
} from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  lastUpdatedLabel,
  PAYMENT_TERM_CHOICES,
} from "@/lib/paddockmeWorkflow";

/**
 * Landowner's side of the negotiation — same shared deal as
 * /workspaces/[id]/agreement, but from John's perspective: his chat
 * messages appear on the right, and "Next Steps" are framed as responding
 * to James' offers (accept or counter) rather than making them.
 */
export default function LandownerAgreementPage() {
  const {
    state,
    proposeRate,
    acceptRate,
    proposeDates,
    acceptDates,
    proposePaymentTerms,
    acceptPaymentTerms,
  } = usePaddockmeWorkflow();
  const { agreement } = state;

  const checklistItems = [
    { label: "Stock Numbers", done: true },
    { label: "Property Details", done: true },
    { label: "Price", done: agreement.priceAgreed },
    { label: "Dates", done: agreement.datesConfirmed },
    { label: "Payment Terms", done: agreement.paymentTermsConfirmed },
    { label: "Transport", done: agreement.transportArranged },
  ];
  const firstPending = checklistItems.findIndex((item) => !item.done);
  const checklist = checklistItems.map((item, idx) => ({
    ...item,
    current: idx === firstPending,
  }));

  const agreementFields = [
    { label: "Livestock", value: livestockLabel(state.request) },
    { label: "Requested by", value: demoLivestockOwner.name },
    { label: "Duration", value: demoRequest.duration },
    {
      label: "Rate",
      value: agreement.rate ?? "Pending",
      pending: !agreement.priceAgreed,
    },
    {
      label: "Dates",
      value: agreement.datesLabel ?? "Pending",
      pending: !agreement.datesConfirmed,
    },
    {
      label: "Payment Terms",
      value: agreement.paymentTerms ?? "Pending",
      pending: !agreement.paymentTermsConfirmed,
    },
    {
      label: "Transport",
      value: agreement.transportArranged
        ? `${agreement.transportCompany} — ${agreement.transportPrice}`
        : "Pending (James arranges)",
      pending: !agreement.transportArranged,
    },
  ];

  const yourPartDone =
    agreement.priceAgreed &&
    agreement.datesConfirmed &&
    agreement.paymentTermsConfirmed;

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href={`/landowner/requests/${demoRequest.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Link>
          <PaddockMeLogo variant="dark" />
          <PmButton
            href={`/workspaces/${demoRequest.id}/agreement`}
            variant="outline"
            className="px-4 py-2 min-h-0"
          >
            View as {demoLivestockOwner.name.split(" ")[0]}
          </PmButton>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
        <p className="rounded-lg bg-pm-cream-100 px-4 py-2.5 text-sm text-pm-charcoal">
          You&apos;re viewing this deal as <strong>{demoLandowner.name}</strong>{" "}
          (Green Hills Farm) — the landowner {demoLivestockOwner.name} is
          hoping to agist with.
        </p>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
          {/* Live agreement + next steps first on mobile, last on desktop */}
          <section className="order-1 rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-3">
            <LiveAgreementPanel
              fields={agreementFields}
              lastUpdated={lastUpdatedLabel(agreement.lastUpdated)}
            />

            <div className="mt-4 space-y-2 border-t border-pm-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                Your Next Steps
              </h3>
              {!agreement.priceAgreed && agreement.pendingRate && (
                <NegotiationStep
                  label="Rate"
                  pending={agreement.pendingRate}
                  me="John"
                  otherName={demoLivestockOwner.name.split(" ")[0]}
                  onAccept={acceptRate}
                  onPropose={(value) => proposeRate(value, "John")}
                  mode="text"
                  placeholder="e.g. $14.00 / head / week"
                />
              )}
              {!agreement.datesConfirmed && agreement.pendingDates && (
                <NegotiationStep
                  label="Dates"
                  pending={agreement.pendingDates}
                  me="John"
                  otherName={demoLivestockOwner.name.split(" ")[0]}
                  onAccept={acceptDates}
                  onPropose={(value) => proposeDates(value, "John")}
                  mode="text"
                  placeholder="e.g. 1 Jul 2025 – 30 Sep 2025"
                />
              )}
              {!agreement.paymentTermsConfirmed &&
                agreement.pendingPaymentTerms && (
                  <NegotiationStep
                    label="Payment terms"
                    pending={agreement.pendingPaymentTerms}
                    me="John"
                    otherName={demoLivestockOwner.name.split(" ")[0]}
                    onAccept={acceptPaymentTerms}
                    onPropose={(value) => proposePaymentTerms(value, "John")}
                    mode="choices"
                    choices={PAYMENT_TERM_CHOICES}
                  />
                )}
              {yourPartDone && (
                <p className="text-sm text-pm-success">
                  {agreement.transportArranged
                    ? "Everything's agreed on both sides!"
                    : `You're all set — waiting on ${demoLivestockOwner.name.split(" ")[0]} to arrange transport.`}
                </p>
              )}
            </div>
          </section>

          {/* Checklist */}
          <aside className="order-2 rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-1">
            <ChecklistPanel title="Deal Progress" items={checklist} />
          </aside>

          {/* Conversation, from John's side */}
          <section className="order-3 flex min-h-[420px] flex-col rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-2">
            <ChatPanel messages={demoConversation} currentUser="John" />
          </section>
        </div>
      </main>
    </div>
  );
}
