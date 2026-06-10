import { NextResponse } from "next/server";
import Stripe from "stripe";
import { recordStripeCheckoutCompleted } from "@/lib/payments/ledger";
import {
  getStripe,
  isStripeConfigured,
  isStripeWebhookConfigured,
} from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.type === "transport_payable") {
      try {
        await recordStripeCheckoutCompleted(session, event.id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to record payment";
        console.error("[stripe webhook] ledger write failed:", message);
        // Return 500 so Stripe retries. recordStripeCheckoutCompleted is
        // idempotent on provider_event_id, so a later retry won't duplicate.
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

