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

export const DEMO_HOSTNAME = "paddockme.vercel.app";

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;

  return (
    typeof window !== "undefined" &&
    window.location.hostname === DEMO_HOSTNAME
  );
}

/**
 * Demo-mode check for middleware and other server code, where `window` does
 * not exist: pass the request's hostname explicitly.
 */
export function isDemoRequest(hostname: string): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || hostname === DEMO_HOSTNAME;
}

/**
 * Guided-demo entry screen for each of the three customer roles. The demo is
 * a demo of all three journeys — the carrier's view is as much the product as
 * the two farmers' views, so every role card must land in its own lane.
 */
export const GUIDED_DEMO_LANES = {
  /** Farmer A — livestock owner who needs feed. */
  livestock: "/requests/new",
  /** Farmer B — landowner's hub: his paddock listing, the incoming request, and his agreements. */
  landowner: "/landowner",
  /** Carrier — Wayne's transport job board. */
  transport: "/transport/demo",
} as const;

/**
 * Pick the guided-demo lane matching the role a visitor chose, so demo-mode
 * sign-in/sign-up keeps them on their journey instead of defaulting everyone
 * into the livestock-owner flow. `intent` is the sign-up role param; `next`
 * is the gated path the visitor was originally headed to.
 */
export function guidedDemoPathFor(
  intent: string | null | undefined,
  next: string | null | undefined
): string {
  if (intent === "landowner") return GUIDED_DEMO_LANES.landowner;
  if (intent === "transport") return GUIDED_DEMO_LANES.transport;
  if (intent === "livestock") return GUIDED_DEMO_LANES.livestock;
  if (next) {
    if (next.startsWith("/transport")) return GUIDED_DEMO_LANES.transport;
    if (next.startsWith("/listings") || next.startsWith("/landowner")) {
      return GUIDED_DEMO_LANES.landowner;
    }
  }
  return GUIDED_DEMO_LANES.livestock;
}
