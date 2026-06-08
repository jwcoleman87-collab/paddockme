import type { TransportPayableSnapshot } from "@/lib/payments/transportPayables";

/**
 * Sandbox checkout is opt-in in production. If Stripe is misconfigured on a
 * production deploy we hard-fail (503) rather than silently letting users
 * land on the "demo payment recorded" page without actually paying. Set
 * PAYMENTS_SANDBOX_CHECKOUT=true explicitly when you want sandbox on prod
 * (e.g. internal demos). Outside production it stays on by default so local
 * dev and preview deploys keep working without Stripe keys.
 */
export function isSandboxCheckoutEnabled() {
  const explicit = process.env.PAYMENTS_SANDBOX_CHECKOUT;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function createSandboxCheckoutUrl(
  origin: string,
  payable: TransportPayableSnapshot
) {
  const params = new URLSearchParams({
    transport_job_id: payable.transportJobId,
    quote_id: payable.quoteId,
  });
  return `${origin}/payments/transport/sandbox?${params.toString()}`;
}

export function createSandboxSessionId(payable: TransportPayableSnapshot) {
  return `sandbox_${slug(payable.transportJobId)}_${slug(payable.quoteId)}`;
}

export function isSandboxSessionId(sessionId?: string) {
  return !!sessionId && sessionId.startsWith("sandbox_");
}

function slug(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
