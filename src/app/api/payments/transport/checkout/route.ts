import { NextResponse } from "next/server";
import { recordTransportCheckoutSession } from "@/lib/payments/ledger";
import { findTransportPayableSnapshot } from "@/lib/payments/transportPayables";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

type CheckoutRequestBody = {
  transportJobId?: unknown;
  quoteId?: unknown;
};

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.transportJobId !== "string" || typeof body.quoteId !== "string") {
    return NextResponse.json(
      { error: "transportJobId and quoteId are required" },
      { status: 400 }
    );
  }

  const payable = findTransportPayableSnapshot(body.transportJobId, body.quoteId);
  if (!payable) {
    return NextResponse.json(
      { error: "Transport payable could not be found" },
      { status: 404 }
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe test mode is not configured yet" },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const origin = new URL(request.url).origin;
  const metadata = {
    type: "transport_payable",
    transport_job_id: payable.transportJobId,
    agreement_id: payable.agreementId,
    quote_id: payable.quoteId,
    payer_profile_id: payable.payerProfileId,
    payee_profile_id: payable.payeeProfileId,
    source: "paddockme_test_mode",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: `transport:${payable.transportJobId}:${payable.quoteId}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: payable.currency.toLowerCase(),
          unit_amount: payable.amountCents,
          product_data: {
            name: "PaddockME transport payable",
            description: payable.description,
          },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${origin}/payments/transport/success?session_id={CHECKOUT_SESSION_ID}&transport_job_id=${encodeURIComponent(payable.transportJobId)}`,
    cancel_url: `${origin}/payments/transport/cancel?transport_job_id=${encodeURIComponent(payable.transportJobId)}`,
  });

  const ledgerResult = await recordTransportCheckoutSession(payable, session);

  return NextResponse.json({
    url: session.url,
    checkoutSessionId: session.id,
    ledgerRecorded: ledgerResult.recorded,
    ledgerReason: ledgerResult.recorded ? undefined : ledgerResult.reason,
  });
}

