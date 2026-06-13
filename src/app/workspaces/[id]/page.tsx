"use client";

import { MoveRight, CheckCircle2 } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import { DealSummaryCard } from "@/components/paddockme/PmCards";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoRequest, demoWorkspace } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow, livestockLabel } from "@/lib/paddockmeWorkflow";

/** Screen 9 — Workspace Overview: what deal are we working on? */
export default function WorkspaceOverviewPage() {
  const w = demoWorkspace;
  const { state, isComplete } = usePaddockmeWorkflow();

  // Build the progress checklist from real workflow state instead of a
  // fixed snapshot, so it actually reflects what's been agreed so far.
  const baseItems = [
    { label: "Connected", done: true },
    { label: "Livestock Reviewed", done: true },
    { label: "Property Reviewed", done: true },
    { label: "Agree Price", done: state.agreement.priceAgreed },
    { label: "Arrange Transport", done: state.agreement.transportArranged },
    { label: "Complete", done: isComplete },
  ];
  const firstPending = baseItems.findIndex((item) => !item.done);
  const checklist = baseItems.map((item, idx) => ({
    ...item,
    current: idx === firstPending,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <PaddockMeLogo variant="dark" />
          <div className="text-right">
            <p className="text-sm font-bold text-pm-charcoal">
              {w.title}{" "}
              <span className="ml-1 rounded-full bg-pm-success/10 px-2 py-0.5 text-xs font-semibold text-pm-success">
                {isComplete ? "Complete" : w.status}
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
            <ChecklistPanel title="Progress" items={checklist} />
          </aside>

          {/* Deal summary */}
          <section className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-extrabold text-pm-charcoal">
              Workspace
            </h1>
            <p className="mt-1 text-sm text-pm-muted">
              {isComplete
                ? "Your agistment agreement is complete."
                : "Work through each step to complete your agistment agreement."}
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className="w-full flex-1">
                <DealSummaryCard
                  image={paddockmeImages.workspaceCattle}
                  title={livestockLabel(state.request)}
                  subtitle={state.request.location}
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
   