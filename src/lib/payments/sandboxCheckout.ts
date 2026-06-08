import type { TransportPayableSnapshot } from "@/lib/payments/transportPayables";

export function isSandboxCheckoutEnabled() {
  return process.env.PAYMENTS_SANDBOX_CHECKOUT !== "false";
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
