import type { Metadata } from "next";
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
import {
  demoAgreementChecklist,
  demoConversation,
  demoLiveAgreement,
} from "@/lib/paddockmeDemoData";

export const metadata: Metadata = {
  title: "Agreement Workspace — PaddockME",
};

/**
 * Screen 10 — the core product screen: guided agreement checklist,
 * conversation, and a live agreement summary forming in real time.
 * Mobile stacks: Live Agreement → Checklist → Conversation.
 */
export default function WorkspaceAgreementPage() {
  const agreementFields = [
    { label: "Livestock", value: demoLiveAgreement.livestock },
    { label: "Duration", value: demoLiveAgreement.duration },
    { label: "Rate", value: demoLiveAgreement.rate },
    { label: "Property", value: demoLiveAgreement.property },
    { label: "Transport", value: demoLiveAgreement.transport, pending: true },
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
              lastUpdated={demoLiveAgreement.lastUpdated}
            />
          </section>

          {/* Checklist */}
          <aside className="order-2 rounded-2xl border border-pm-border bg-white p-5 shadow-sm lg:order-1">
            <ChecklistPanel title="Checklist" items={demoAgreementChecklist} />
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
