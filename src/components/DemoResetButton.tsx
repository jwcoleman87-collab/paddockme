"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { isDemoMode } from "@/lib/demoMode";
import { runDemoReset } from "@/lib/demoReset";

/**
 * Demo reset control.
 *
 * Gives a presenter a one-tap "factory reset" so the next walk-through starts
 * from a clean slate: clears all PaddockME local/session state (inbox unread
 * tracker, in-progress request draft, any legacy persona keys from older
 * builds), and hard-navigates to the public landing. Real account and database
 * state stay untouched.
 *
 * Rendered beside the sign-out control in both the desktop sidebar and the
 * mobile header. The label shows on the desktop sidebar (lg+) and collapses
 * to an icon-only button in the tighter mobile header - same control, two
 * presentations. Demo-only: hidden unless the build runs in demo mode, so real
 * users never see a reset control in production.
 */
export function DemoResetButton() {
  const [loading, setLoading] = useState(false);

  if (!isDemoMode()) return null;

  async function resetDemo() {
    if (loading) return;
    const confirmed = window.confirm(
      "Reset the demo? This clears local demo state so the next run-through starts fresh."
    );
    if (!confirmed) return;

    setLoading(true);
    await runDemoReset();
  }

  return (
    <button
      type="button"
      onClick={resetDemo}
      disabled={loading}
      aria-label="Reset demo"
      title="Reset demo"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sage-deep/20 bg-warm-white px-3 text-sm font-bold text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden lg:inline">
        {loading ? "Resetting…" : "Reset demo"}
      </span>
    </button>
  );
}
