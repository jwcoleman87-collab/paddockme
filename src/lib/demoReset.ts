"use client";

/**
 * Shared "factory reset" for the guided demo — the single reset path used
 * everywhere (account screen, inline end-of-workflow action, legacy-tree
 * presenter buttons), so the behaviour stays identical wherever it's tapped.
 *
 * Returns the demo to its original seeded starting point so the next
 * presenter walks in on a clean slate:
 * - clears every PaddockME-namespaced localStorage key (workflow state,
 *   demo chat threads, inbox unread tracker, any legacy persona keys)
 * - clears the in-progress request draft from sessionStorage
 * - leaves real account and database state untouched; the guided workflow is
 *   deliberately localStorage-backed
 * - hard-navigates back to the start of the guided demo so all in-memory
 *   React state is dropped too
 */
export async function resetPaddockmeDemoState(): Promise<void> {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("paddockme")) toRemove.push(key);
    }
    toRemove.forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.removeItem("pm-request-draft");
  } catch {
    // ignore blocked storage/private browsing
  }

  // Hard navigation guarantees all in-memory React state is dropped too, so
  // the demo truly starts from zero at the guided-demo starting point.
  window.location.assign("/");
}

/**
 * Back-compat alias for the legacy `(app)` tree's DemoResetButton /
 * DemoResetAction (PRs #26/#28). Same reset, one implementation.
 */
export const runDemoReset = resetPaddockmeDemoState;
