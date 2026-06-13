"use client";

import { UserCircle2, RotateCcw } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoLivestockOwner } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow, livestockLabel } from "@/lib/paddockmeWorkflow";

/** Profile — account summary plus a way to reset the demo workflow. */
export default function ProfilePage() {
  const { state, isComplete, resetWorkflow } = usePaddockmeWorkflow();

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <UserCircle2 className="h-14 w-14 text-pm-green-900" aria-hidden />
            <div>
              <h1 className="text-xl font-extrabold text-pm-charcoal">
                {demoLivestockOwner.name}
              </h1>
              <p className="text-sm text-pm-muted">
                {demoLivestockOwner.location} · Member since{" "}
                {demoLivestockOwner.memberSince}
              </p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-pm-border border-t border-pm-border">
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-pm-muted">Current request</dt>
              <dd className="text-sm font-bold text-pm-charcoal">
                {livestockLabel(state.request)}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-pm-muted">Location</dt>
              <dd className="text-sm font-bold text-pm-charcoal">
                {state.request.location}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm text-pm-muted">Agreement status</dt>
              <dd className="text-sm font-bold text-pm-charcoal">
                {isComplete ? "Complete" : "In progress"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-pm-border pt-6">
            <p className="text-sm text-pm-muted">
              Reset the demo to start a fresh request from scratch. This
              clears your saved request details and agreement progress.
            </p>
            <PmButton
              variant="outline"
              onClick={resetWorkflow}
              className="mt-3"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset demo data
            </PmButton>
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
