import type Stripe from "stripe";
import type { TransportPayableSnapshot } from "@/lib/payments/transportPayables";
import {
  createServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";

type LedgerRecordResult =
  | { recorded: true; payableId: string }
  | { recorded: false; reason: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function recordTransportCheckoutSession(
  payable: TransportPayableSnapshot,
  session: Stripe.Checkout.Session
): Promise<LedgerRecordResult> {
  if (!isSupabaseServiceConfigured()) {
    return { recorded: false, reason: "supabase_service_not_configured" };
  }

  if (!hasUuidBackedPayable(payable)) {
    return { recorded: false, reason: "prototype_ids_are_not_database_uuids" };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payables")
    .upsert(
      {
        agreement_id: payable.agreementId,
        transport_job_id: payable.transportJobId,
        accepted_quote_id: payable.quoteId,
        payer_profile_id: payable.payerProfileId,
        payee_profile_id: payable.payeeProfileId,
        kind: "transport",
        status: "awaiting_payment",
        amount_cents: payable.amountCents,
        currency: payable.currency,
        description: payable.description,
        provider: "stripe",
        provider_checkout_session_id: session.id,
        metadata: {
          basis: payable.basis,
          unit_amount: payable.unitAmount,
          stripe_checkout_url: session.url,
        },
      },
      { onConflict: "accepted_quote_id" }
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    return { recorded: false, reason: error?.message ?? "payable_not_recorded" };
  }

  await supabase.from("payment_events").insert({
    payable_id: data.id,
    event_type: "checkout_session_created",
    from_status: null,
    to_status: "awaiting_payment",
    provider: "stripe",
    provider_event_id: `checkout_session:${session.id}`,
    metadata: {
      checkout_session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });

  return { recorded: true, payableId: data.id };
}

export async function recordStripeCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripeEventId: string
): Promise<LedgerRecordResult> {
  if (!isSupabaseServiceConfigured()) {
    return { recorded: false, reason: "supabase_service_not_configured" };
  }

  const supabase = createServiceClient();
  const { data: existingEvent } = await supabase
    .from("payment_events")
    .select("id,payable_id")
    .eq("provider", "stripe")
    .eq("provider_event_id", stripeEventId)
    .maybeSingle();

  if (existingEvent?.payable_id) {
    return { recorded: true, payableId: existingEvent.payable_id };
  }

  const { data: payable, error: payableError } = await supabase
    .from("payables")
    .select("id,status")
    .eq("provider", "stripe")
    .eq("provider_checkout_session_id", session.id)
    .maybeSingle();

  if (payableError || !payable?.id) {
    return {
      recorded: false,
      reason: payableError?.message ?? "payable_not_found_for_checkout_session",
    };
  }

  const previousStatus = typeof payable.status === "string" ? payable.status : null;
  await supabase
    .from("payables")
    .update({
      status: "payment_recorded",
      provider_payment_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      metadata: {
        stripe_payment_status: session.payment_status,
        stripe_customer: session.customer,
      },
    })
    .eq("id", payable.id);

  const { error: eventError } = await supabase.from("payment_events").insert({
    payable_id: payable.id,
    event_type: "payment_received",
    from_status: previousStatus,
    to_status: "payment_recorded",
    provider: "stripe",
    provider_event_id: stripeEventId,
    metadata: {
      checkout_session_id: session.id,
      payment_intent: session.payment_intent,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });

  if (eventError) {
    return { recorded: false, reason: eventError.message };
  }

  return { recorded: true, payableId: payable.id };
}

function hasUuidBackedPayable(payable: TransportPayableSnapshot) {
  return [
    payable.agreementId,
    payable.transportJobId,
    payable.quoteId,
    payable.payerProfileId,
    payable.payeeProfileId,
  ].every((value) => uuidPattern.test(value));
}

