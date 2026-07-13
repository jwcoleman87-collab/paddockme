/**
 * Demo-mode gate.
 *
 * PaddockME normally runs in real operation mode against Supabase. When a build
 * is deployed purely to walk a prospect through the guided workflows, set
 * `NEXT_PUBLIC_DEMO_MODE=true`. The dedicated investor hostname is also treated
 * as demo mode so a missing Vercel environment flag cannot send a presenter
 * into real authentication.
 *
 * Because the value is read from a `NEXT_PUBLIC_*` variable it is inlined at
 * build time and is safe to call from both server and client components.
 */
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;

  return (
    typeof window !== "undefined" &&
    window.location.hostname === "paddockme.vercel.app"
  );
}
