/**
 * Demo-mode gate.
 *
 * PaddockME normally runs in real operation mode against Supabase. When a build
 * is deployed purely to walk a prospect through the guided workflows, set
 * `NEXT_PUBLIC_DEMO_MODE=true`. That unlocks presenter-only affordances (the
 * inline "Reset demo" action at the end of each workflow) without ever exposing
 * them to real users in production - the flag is off unless explicitly set.
 *
 * Because the value is read from a `NEXT_PUBLIC_*` variable it is inlined at
 * build time and is safe to call from both server and client components.
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
