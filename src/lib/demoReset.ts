import { createClient } from "@/lib/supabase/client";

/**
 * Shared "factory reset" for the guided demo.
 *
 * Returns the demo to its original seeded starting point so the next presenter
 * walks in on a clean slate: clears every PaddockME-namespaced local/session
 * key (inbox unread tracker, in-progress request draft, any legacy persona keys
 * from older builds), drops the temporary records created during the run by
 * signing out of the demo Supabase session, and hard-navigates back to the
 * start of the guided demo.
 *
 * Used by both the sidebar/header control (DemoResetButton) and the inline
 * end-of-workflow action (DemoResetAction), so the behaviour stays identical
 * wherever the presenter taps it.
 */
export async function runDemoReset(): Promise<void> {
  try {
    // Clear every PaddockME-namespaced localStorage key (inbox unread tracker
    // + any legacy persona/draft keys left by older builds).
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

  // Hard navigation guarantees all in-memory React state is dropped too, so the
  // demo truly starts from zero at the guided-demo starting point.
  window.location.assign("/");
}
