"use client";

import { useState } from "react";
import { Info, RotateCcw } from "lucide-react";
import { PmButton } from "./PmButton";
import { resetPaddockmeDemoState } from "@/lib/demoReset";

/**
 * The guided-demo affordances for the pm-* customer lane.
 *
 * This branch IS the guided demonstration, so these render unconditionally
 * here (unlike the legacy tree's DemoResetButton/DemoResetAction, which stay
 * behind NEXT_PUBLIC_DEMO_MODE for production safety).
 */

/**
 * Restrained "Guided Demo" indicator. Lives in the bottom app nav (and the
 * public header) so every screen quietly says the people and transaction
 * shown are representative — without covering the interface in warnings.
 */
export function GuidedDemoBadge({ light = false }: { light?: boolean }) {
  return (
    <span
      title="You're viewing a guided demonstration. The people and transaction shown are representative."
      className={
        light
          ? "inline-flex shrink-0 items-center gap-1 rounded-full border border-white/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80"
          : "inline-flex shrink-0 items-center gap-1 rounded-full border border-pm-gold-500/50 bg-pm-gold-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pm-gold-600"
      }
    >
      <Info className="h-3 w-3" aria-hidden />
      Guided Demo
    </span>
  );
}

/**
 * Inline "Reset Demo" action for the guided lane's end-of-flow surfaces —
 * sits in the button row like any other action (the placement pattern from
 * PR #28), confirms before wiping, and runs the single shared reset.
 */
export function GuidedDemoResetAction({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (loading) return;
    const confirmed = window.confirm(
      "Reset the demo? This clears the whole walkthrough — request, agreement, transport and chat — and starts fresh.",
    );
    if (!confirmed) return;
    setLoading(true);
    await resetPaddockmeDemoState();
  }

  return (
    <PmButton
      type="button"
      variant="outline"
      onClick={handleReset}
      disabled={loading}
      className={className}
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {loading ? "Resetting…" : "Reset Demo"}
    </PmButton>
  );
}
