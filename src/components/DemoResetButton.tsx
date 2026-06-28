"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Demo reset control.
 *
 * Gives a presenter a one-tap "factory reset" so the next walk-through starts
 * from a clean slate: clears all PaddockME local/session state (inbox unread
 * tracker, in-progress request draft, any legacy persona keys from older
 * builds), signs out of Supabase, and hard-navigates to the public landing.
 *
 * Rendered beside the sign-out control in both the desktop sidebar and the
 * mobile header. The label shows on the desktop sidebar (lg+) and collapses
 * to an icon-only button in the tighter mobile header - same control, two
 * presentations.
 */
export function DemoResetButton() {
  const [loading, setLoading] = useState(false);

  async function resetDemo() {
    if (loading) return;
    const confirmed = window.confirm(
      "Reset the demo? This clears local demo state and signs you out so the next run-through starts fresh."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // Clear every PaddockME-namespaced localStorage key (inbox unread
      // tracker + any legacy persona/draft keys left by older builds).
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith("paddockme")) toRemove.push(key);
        }
        toRemove.forEach((key) => window.localStorage.removeItem(key));
        // Request flow draft lives in sessionStorage under its own key.
        window.sessionStorage.removeItem("pm-request-draft");
      } catch {
        // ignore - private mode / quota
      }

      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore - sign-out is best-effort during a reset
      }
    } finally {
      // Hard navigation guarantees all in-memory React state is dropped too,
      // so the demo truly starts from zero.
      window.location.assign("/");
    }
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
