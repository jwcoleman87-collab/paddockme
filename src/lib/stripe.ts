import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function isStripeWebhookConfigured() {
  return !!process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });

  return stripeClient;
}

