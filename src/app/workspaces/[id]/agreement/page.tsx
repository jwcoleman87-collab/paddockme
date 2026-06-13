"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import {
  ChatPanel,
  LiveAgreementPanel,
} from "@/components/paddockme/WorkspacePanels";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoConversation, demoRequest } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  lastUpdatedLabel,
} from "@/lib/paddockmeWorkflow";

// Demo values offered as one-tap "agree" actions — in a real product these
// would come from the negotiation/chat, but for this demo we let the user
// confirm each term so the agreement can actually reach Complete.
const SUGGESTED_RATE = "$12.50 / head / week";
const SUGGESTED_DATES_LABEL = "1 Jun 2025 – 30 Aug 2025";
const SUGGESTED_PAYMENT_TERMS = "Monthly in advance";

/**
 * Screen 10 — the core product screen: guided agreement checklist,
 * conversation, and a live agreement summary forming in real time.
 * Mobile stacks: Live Agreement → Checklist → Conversation.
 */
export default function WorkspaceAgreementPage() {
  const { state, setRate, confirmDates, setPaymentTerms } =
    usePaddockmeWorkflow();
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
    { label: "Duration", value: demoRequest.duration },
    {
      label: "Rate",
      value: agreement.rate ?? "Pending",
      pending: !agreement.priceAgreed,
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
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/workspaces/1023"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Workspace
          </Link>
          <PaddockMeLogo variant="dark" />
          <PmButton
            href="/workspaces/1023/review"
            variant="accent"
            className="px-4 py-2 min-h-0"
          >
            Review Agreement
          </PmButton>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
          {/* Live agreement first on mobile, last on desktop */}
          <section className="order-1 rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-3">
            <LiveAgreementPanel
              fields={agreementFields}
              lastUpdated={lastUpdatedLabel(agreement.lastUpdated)}
            />

            {/* Quick actions to move the agreement forward */}
            <div className="mt-4 space-y-2 border-t border-pm-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                Next Steps
              </h3>
              {!agreement.priceAgreed && (
                <button
                  type="button"
                  onClick={() => setRate(SUGGESTED_RATE)}
                  className="w-full rounded-lg border border-pm-border px-3 py-2 text-left text-sm font-medium text-pm-green-900 hover:bg-pm-cream-50"
                >
                  Agree rate: {SUGGESTED_RATE}
                </button>
              )}
              {!agreement.datesConfirmed && (
                <button
                  type="button"
                  onClick={() => confirmDates()}
                  className="w-full rounded-lg border border-pm-border px-3 py-2 text-left text-sm font-medium text-pm-green-900 hover:bg-pm-cream-50"
                >
                  Confirm dates: {SUGGESTED_DATES_LABEL}
                </button>
              )}
              {!agreement.paymentTermsConfirmed && (
                <button
                  type="button"
                  onClick={() => setPaymentTerms(SUGGESTED_PAYMENT_TERMS)}
                  className="w-full rounded-lg border border-pm-border px-3 py-2 text-left text-sm font-medium text-pm-green-900 hover:bg-pm-cream-50"
                >
                  Confirm payment terms: {SUGGESTED_PAYMENT_TERMS}
                </button>
              )}
              {!agreement.transportArranged && (
                <PmButton
                  href="/transport/quotes/1023"
                  variant="outline"
                  className="w-full px-3 py-2 min-h-0 text-sm"
                >
                  Arrange transport
                </PmButton>
              )}
              {agreement.priceAgreed &&
                agreement.datesConfirmed &&
                agreement.paymentTermsConfirmed &&
                agreement.transportArranged && (
                  <p className="text-sm text-pm-success">
                    Everything&apos;s agreed — head to Review Agreement above.
                  </p>
                )}
            </div>
          </section>

          {/* Checklist */}
          <aside className="order-2 rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-1">
            <ChecklistPanel title="Checklist" items={checklist} />
          </aside>

          {/* Conversation */}
          <section className="order-3 flex min-h-[420px] flex-col rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-2">
            <ChatPanel messages={demoConversation} currentUser="James" />
          </section>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
