import type { Metadata } from "next";
import { MoveRight } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import { DealSummaryCard } from "@/components/paddockme/PmCards";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoRequest, demoWorkspace } from "@/lib/paddockmeDemoData";

export const metadata: Metadata = {
  title: "Workspace — PaddockME",
};

/** Screen 9 — Workspace Overview: what deal are we working on? */
export default function WorkspaceOverviewPage() {
  const w = demoWorkspace;
  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <PaddockMeLogo variant="dark" />
          <div className="text-right">
            <p className="text-sm font-bold text-pm-charcoal">
              {w.title}{" "}
              <span className="ml-1 rounded-full bg-pm-success/10 px-2 py-0.5 text-xs font-semibold text-pm-success">
                {w.status}
              </span>
            </p>
            <p className="text-xs text-pm-muted">{w.parties}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[230px_1fr]">
          {/* Progress checklist */}
          <aside className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm md:order-first">
            <ChecklistPanel title="Progress" items={w.checklist} />
          </aside>

          {/* Deal summary */}
          <section className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-extrabold text-pm-charcoal">
              Workspace
            </h1>
            <p className="mt-1 text-sm text-pm-muted">
              Work through each step to complete your agistment agreement.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className="w-full flex-1">
                <DealSummaryCard
                  image={paddockmeImages.workspaceCattle}
                  title={demoRequest.livestock}
                  subtitle={demoRequest.currentLocation}
                />
              </div>
              <MoveRight
                className="h-8 w-8 shrink-0 rotate-90 text-pm-gold-500 sm:rotate-0"
                aria-label="moving to"
              />
              <div className="w-full flex-1">
                <DealSummaryCard
                  image={paddockmeImages.workspaceProperty}
                  title="Green Hills Farm"
                  subtitle={demoRequest.targetLocation}
                />
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-pm-border pt-5">
              <div>
                <dt className="text-xs text-pm-muted">Target Start Date</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {w.targetStartDate}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-pm-muted">Duration</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {w.duration}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <PmButton
                href={`/workspaces/${w.id}/agreement`}
                className="w-full sm:w-auto"
              >
                Continue Agreement
              </PmButton>
            </div>
          </section>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
