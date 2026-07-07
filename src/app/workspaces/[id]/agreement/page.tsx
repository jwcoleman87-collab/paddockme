"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, MoveRight } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import {
  ChatPanel,
  LiveAgreementPanel,
  NegotiationStep,
} from "@/components/paddockme/WorkspacePanels";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import {
  demoConversation,
  demoRequest,
  demoTransportRft,
} from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  PAYMENT_TERM_CHOICES,
} from "@/lib/paddockmeWorkflow";

/**
 * Screen 10 — the core product screen: guided agreement checklist,
 * conversation, and a live agreement summary forming in real time.
 * Mobile stacks: Live Agreement → Checklist → Conversation.
 */
export default function WorkspaceAgreementPage() {
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

  // All three negotiable terms agreed — ready to move to review (and, from
  // there, to send the RFT). Transport stays pending until a quote is accepted.
  const termsComplete =
    agreement.priceAgreed &&
    agreement.datesConfirmed &&
    agreement.paymentTermsConfirmed;
  const agreementAccepted = agreement.reviewAccepted;
  // Transport already booked beats "request sent" — never point someone at
  // the quotes board once a carrier is locked in.
  const progressionHref =
    !agreementAccepted && agreement.transportRequestSent && !agreement.transportArranged
      ? "/transport/quotes/1023"
      : "/workspaces/1023/review";
  const progressionLabel = agreementAccepted
    ? "View Accepted Agreement"
    : agreement.transportArranged
      ? "Review Agreement"
      : agreement.transportRequestSent
        ? "View Transport Quotes"
        : "Review Agreement & Request Transport";

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
    { label: "Property", value: "Green Hills Farm" },
    {
      label: "Transport",
      value: agreement.transportArranged
        ? `${agreement.transportCompany} — ${agreement.transportPrice}`
        : "Pending",
      pending: !agreement.transportArranged,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <Link
            href="/workspaces/1023"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Workspace
          </Link>
          <PaddockMeLogo variant="dark" className="hidden sm:block" />
          <PmButton href="/workspaces/1023/review" variant="outline">
            {agreementAccepted ? "View Agreement" : "Review Agreement"}
          </PmButton>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Negotiation — the primary action column */}
          <section>
            <h1 className="text-xl font-extrabold text-pm-charcoal">
              Agree the terms
            </h1>
            <p className="mt-1 text-sm text-pm-muted">
              Accept the offer on the table, or send back a counter. Each
              agreed item locks in and updates the live agreement.
            </p>

            <div className="mt-6 space-y-3">
              <NegotiationStep
                label="Price"
                pending={agreement.pendingRate}
                confirmed={agreement.priceAgreed}
                confirmedValue={agreement.rate}
                onAccept={acceptRate}
                onPropose={(value) => proposeRate(value, "James")}
                placeholder="e.g. $13 / head / week"
              />
              <NegotiationStep
                label="Dates"
                pending={agreement.pendingDates}
                confirmed={agreement.datesConfirmed}
                confirmedValue={agreement.datesLabel}
                onAccept={acceptDates}
                onPropose={(value) => proposeDates(value, "James")}
                placeholder="e.g. 1 Jun – 30 Aug 2025"
              />
              <NegotiationStep
                label="Payment Terms"
                pending={agreement.pendingPaymentTerms}
                confirmed={agreement.paymentTermsConfirmed}
                confirmedValue={agreement.paymentTerms}
                onAccept={acceptPaymentTerms}
                onPropose={(value) => proposePaymentTerms(value, "James")}
                choices={PAYMENT_TERM_CHOICES}
              />
            </div>

            {/* Bottom progression CTA — appears right where the user finishes
                accepting the terms, so they never have to scroll back up. */}
            {termsComplete && (
              <div className="mt-6 rounded-2xl border border-pm-success/40 bg-pm-success/5 p-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pm-success text-white">
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                  </span>
                  <h2 className="text-lg font-extrabold text-pm-charcoal">
                    {agreementAccepted
                      ? "Agreement accepted"
                      : agreement.transportArranged
                        ? "Transport booked"
                        : agreement.transportRequestSent
                          ? "Transport request sent"
                          : "Agreement terms complete"}
                  </h2>
                </div>
                <p className="mt-3 text-sm text-pm-muted">
                  {agreementAccepted
                    ? "The agreement is already in place. You can view the accepted record without accepting it again."
                    : agreement.transportArranged
                      ? "Transport is locked in. Review the agreement to finish up."
                      : agreement.transportRequestSent
                        ? "Your agreement has already been reviewed and the transport request is open for quotes."
                        : "Your agistment terms are ready to review. After review, PaddockME will create an RFT - Request For Transport - so livestock transporters can quote the movement."}
                </p>

                {!agreementAccepted && (
                <div className="mt-4 rounded-xl border border-pm-border bg-white p-4">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-pm-charcoal">
                    {state.request.location}
                    <MoveRight
                      className="h-4 w-4 text-pm-gold-600"
                      aria-label="to"
                    />
                    {demoTransportRft.destination}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-pm-muted">Approx. distance</dt>
                      <dd className="text-sm font-semibold text-pm-charcoal">
                        {demoTransportRft.distanceKm} km
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-pm-muted">Livestock</dt>
                      <dd className="text-sm font-semibold text-pm-charcoal">
                        {livestockLabel(state.request)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-pm-muted">Target start</dt>
                      <dd className="text-sm font-semibold text-pm-charcoal">
                        {demoRequest.startDate}
                      </dd>
                    </div>
                  </dl>
                </div>
                )}

                <PmButton
                  href={progressionHref}
                  variant={agreementAccepted ? "primary" : "accent"}
                  className="mt-5 w-full sm:w-auto"
                >
                  {progressionLabel}
                  <MoveRight className="h-4 w-4" aria-hidden />
                </PmButton>
              </div>
            )}

            <div className="mt-8 h-[360px] rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <ChatPanel messages={demoConversation} currentUser="James" />
            </div>
          </section>

          {/* Checklist + live agreement */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <ChecklistPanel title="Checklist" items={checklist} />
            </div>
            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <LiveAgreementPanel
                fields={agreementFields}
                lastUpdated={agreement.lastUpdated}
              />
            </div>
          </aside>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
