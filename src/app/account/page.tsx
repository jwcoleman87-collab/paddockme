"use client";

import { useRouter } from "next/navigation";
import { UserCircle2, RotateCcw, CheckCircle2, Circle } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoLivestockOwner } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  needUntilLabel,
} from "@/lib/paddockmeWorkflow";

/**
 * Profile / account screen for the demo. Shows the signed-in demo user,
 * a snapshot of where they're at in the agistment workflow, and a way to
 * reset the demo back to its starting state.
 */
export default function AccountPage() {
  const router = useRouter();
  const { state, isComplete, resetWorkflow } = usePaddockmeWorkflow();
  const { agreement } = state;

  const progressItems = [
    { label: "Price agreed", done: agreement.priceAgreed },
    { label: "Dates confirmed", done: agreement.datesConfirmed },
    { label: "Payment terms confirmed", done: agreement.paymentTermsConfirmed },
    { label: "Transport arranged", done: agreement.transportArranged },
  ];

  function handleReset() {
    resetWorkflow();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white">
              <UserCircle2 className="h-8 w-8" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-pm-charcoal">
                {demoLivestockOwner.name}
              </h1>
              <p className="text-sm text-pm-muted">
                {demoLivestockOwner.location} · Member since{" "}
                {demoLivestockOwner.memberSince}
              </p>
            </div>
            <span className="ml-auto rounded-full bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
              Signed in (demo)
            </span>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Your current request
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-pm-muted">Livestock</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {livestockLabel(state.request)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-pm-muted">Location</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {state.request.location}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-pm-muted">Timing</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {needUntilLabel(state.request)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Agreement progress
            </h2>
            <ul className="mt-3 space-y-2">
              {progressItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-sm"
                >
                  {item.done ? (
                    <CheckCircle2
                      className="h-4 w-4 text-pm-success"
                      aria-hidden
                    />
                  ) : (
                    <Circle className="h-4 w-4 text-pm-muted" aria-hidden />
                  )}
                  <span
                    className={
                      item.done ? "text-pm-charcoal" : "text-pm-muted"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <PmButton
              href={
                isComplete
                  ? "/workspaces/1023/review"
                  : "/workspaces/1023/agreement"
              }
              variant="outline"
              className="mt-4"
            >
              {isComplete ? "View Final Agreement" : "Continue Agreement"}
            </PmButton>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">Demo controls</h2>
            <p className="mt-1 text-sm text-pm-muted">
              Reset the agistment request and agreement back to their
              starting state.
            </p>
            <PmButton variant="ghost" className="mt-3" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset Demo
            </PmButton>
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
