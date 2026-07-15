# Payments Milestone Plan

Last updated: 2026-05-28

This is the working checklist for building payments without turning PaddockME into a generic checkout product. It upgrades `PAYMENTS_SETTLEMENT_BLUEPRINT.md` into a milestone plan with a repeated loop:

1. Learn the marketplace/payment risk.
2. Build the narrowest useful slice.
3. Test product behaviour, data rules, and demo claims.
4. Deploy the milestone before moving on.

## List Review

Verdict: upgrade the list, then follow it.

The existing blueprint is strong on product restraint: payments belong inside agreement and transport workflows, not in a detached finance dashboard. The gap is that it does not yet say how to ship in small, verified increments. This plan keeps the blueprint's privacy and honesty rules, then adds provider choice, ledger-first engineering, test gates, and deployment rules.

## Research Snapshot

Mature marketplace payment systems separate the user checkout moment from the accounting truth underneath it:

- Airbnb-style marketplaces coordinate pay-in, payout, ledger, settlement, reconciliation, and dispute paths as separate domains.
- Uber-style marketplaces make earnings visible around completed work, then support payout timing as a product feature.
- Stripe Connect is the best interim fit for PaddockME because it supports marketplace payments, connected accounts, platform fees, hosted onboarding, and later payout flows without us storing sensitive bank details.
- Stripe's own marketplace docs split charge design into destination charges and separate charges/transfers. Destination charges fit simple one-provider transactions. Separate charges/transfers fit cases where funds need to be held until delivery or split between multiple providers.
- For PaddockME now, transport is the safest first payable because one livestock owner pays one driver for one accepted quote. Agistment deposits, bonds, and recurring schedules come after the transport pattern is proven.

Useful sources:

- [Stripe Connect marketplace overview](https://docs.stripe.com/connect)
- [Stripe marketplace payment design](https://docs.stripe.com/connect/marketplace/tasks/accept-payment?locale=en-GB)
- [Stripe destination charges](https://docs.stripe.com/connect/destination-charges?locale=en-GB)
- [Stripe separate charges and transfers](https://docs.stripe.com/connect/separate-charges-and-transfers?locale=en-GB)
- [Stripe connected payout accounts](https://docs.stripe.com/connect/payouts-bank-accounts)

## Operating Rules

- Do not use the word escrow in product UI until legal review approves the exact model.
- Do not collect or store card or bank details directly in PaddockME.
- Use hosted/provider flows for checkout and payout onboarding.
- Keep the first payment slice inside the transport room and agreement transport tab.
- Keep commercial visibility narrow: livestock owner and driver can see transport payment amounts; landowner only sees logistics/payment-readiness status unless the product later needs more.
- Build the internal ledger before real payment capture so PaddockME knows what is owed even when Stripe is unavailable.
- Every payment state change must create an auditable event.
- Every provider webhook must be idempotent.
- Every milestone must pass local verification before deployment.

## Deployment Rule

Each milestone should finish with:

1. `npm run docs:check`
2. `npm run typecheck`
3. `npm run build`
4. A narrow smoke test for the payment surface changed in that milestone.
5. A preview deploy, or a production deploy only when explicitly approved.

Current repo note: the local Vercel CLI is linked to the canonical `paddockme-oz51` project for preview deployments, and `.vercel` is ignored. The default milestone target is preview unless production is explicitly approved.

## Milestone 0 - Rules, Fit, And Build Gates

Goal: make the payment strategy explicit enough that implementation can start without accidental legal or product claims.

Learn:

- Which payment actor is the first payer/payee pair.
- Whether transport should use destination charges first or separate charges/transfers later.
- What data must remain private from landowners and drivers.
- Which claims must stay out of the app and pitch.

Build:

- This milestone plan.
- Updated blueprint link and build-gate wording.
- A provider decision record: Stripe Connect test mode first, no real money until legal/provider setup is complete.

Test:

- Markdown links pass.
- TypeScript and production build still pass.
- Payment language remains honest in docs.

Deploy:

- Ship the docs milestone through the normal branch/preview path.

Acceptance:

- Founder and builder can point at one checklist and know the next build step.
- No UI claims that payments, escrow, settlement, guarantees, or dispute handling are live.

## Milestone 1 - Internal Payable Ledger

Goal: create payment records when transport terms are accepted, without moving money yet.

Learn:

- Exact payable states needed for transport: `draft`, `awaiting_payment`, `payment_recorded`, `ready_to_release`, `released`, `cancelled`, `disputed`.
- Whether accepted transport quotes should create one payable automatically or require a "request payment" action.

Build:

- Supabase migration for `payables` and `payment_events`.
- RLS policies matching the transport quote visibility wall.
- Repository mapping and TypeScript types.
- Prototype fallback records for the seeded Glenbarra transport job.
- Transport room payment status panel: amount, payer, payee, status, next action.

Test:

- Unit-style checks for amount calculation and status transitions where practical.
- Typecheck/build.
- Manual role check: Dale sees amount owed, Wayne sees amount due, Brett does not see private amount.

Deploy:

- Preview deploy for the ledger-only milestone.

Acceptance:

- Accepting a transport quote creates or reveals a payable record.
- No Stripe dependency required.
- No card form or bank onboarding shown yet.

## Milestone 2 - Stripe Test-Mode Pay-In

Goal: let the livestock owner pay an accepted transport quote in Stripe test mode.

Status: in progress. The app now has a hosted Stripe Checkout route, a verified webhook route, and a no-money sandbox checkout fallback when Stripe env vars are not configured.

Learn:

- Whether hosted Checkout or embedded Checkout is the smoother first UX.
- What metadata is required to reconcile Checkout sessions back to payables.

Build:

- `stripe` server dependency.
- Server-only Stripe client.
- Checkout session creation for transport payables.
- Success/cancel return routes.
- Webhook endpoint that verifies signatures and updates `payment_events` idempotently.
- Test-mode environment variable documentation.
- Sandbox checkout page for preview/demo builds where Stripe keys are not ready yet.

Test:

- Stripe test card happy path.
- Cancel path leaves payable awaiting payment.
- Duplicate webhook does not duplicate events.
- Build and smoke path, including `npm run payments:smoke`.
- Sandbox fallback path with no card collection and clear no-funds-moving copy.

Deploy:

- Preview deploy with sandbox checkout now; repeat with Stripe test-mode env vars when the account is ready.

Acceptance:

- Dale can pay a transport payable in test mode.
- Dale can walk the full no-money payment journey before Stripe is configured.
- The transport room updates from webhook-backed state.
- Wayne sees payment received, not payout complete.

## Milestone 3 - Connected Account Onboarding

Goal: prepare drivers and landowners to receive payouts without PaddockME handling bank details.

Learn:

- Which account type and capabilities are appropriate in Australia.
- Whether drivers need onboarding before quoting or only before payout.

Build:

- `payment_accounts` table.
- Stripe Connect account creation for a profile.
- Hosted onboarding link.
- Account status panel: not connected, onboarding needed, connected, restricted.

Test:

- Onboarding link generation.
- Account status refresh.
- Role visibility: user sees their own account only.

Deploy:

- Preview deploy with Connect test-mode setup.

Acceptance:

- Wayne can start provider-hosted payout onboarding.
- No bank details enter PaddockME.

## Milestone 4 - Settlement Release

Goal: release or mark release of transport funds after delivery confirmation.

Learn:

- Whether the first live model should transfer immediately at payment or delay release until delivery.
- Which transport milestone counts as settlement trigger: loaded, arrived, delivered, or both parties confirm.

Build:

- Settlement status and event transitions.
- If using destination charges first: record payout status from Stripe, but do not overstate milestone control.
- If using separate charges/transfers later: create transfer after delivery milestone.
- Release action or automatic release rule, depending on provider/legal decision.

Test:

- Delivery milestone updates payable to ready-to-release.
- Settlement event is auditable.
- Refund/dispute states prevent release.

Deploy:

- Preview deploy first; production only after legal/provider review.

Acceptance:

- Payment certainty and delivery status are connected in the product.
- PaddockME can explain why the driver is paid and when.

## Milestone 5 - Agistment Deposit And Schedule

Goal: extend the proven transport payable pattern to agistment without jumping straight to recurring complexity.

Learn:

- Whether livestock owners and landowners prefer deposit, bond, first week/month upfront, or post-arrival payment.
- Which records are needed for tax and farm management.

Build:

- Agistment payable schedule attached to agreement.
- Deposit or first-period payable.
- Agreement snapshot settlement record.
- Landowner payment visibility.

Test:

- Dale sees what he owes.
- Brett sees what is owed/received.
- Wayne sees no agistment commercial details.

Deploy:

- Preview deploy, then production after validation.

Acceptance:

- Agistment payment state is attached to the agreement, not a generic billing dashboard.

## Milestone 6 - Disputes, Refunds, And Reconciliation

Goal: make payment operations survivable before scaling transaction volume.

Learn:

- Common dispute reasons in agistment and livestock transport.
- Which disputes can be workflow-resolved and which require human/admin review.

Build:

- Refund request records.
- Dispute records.
- Admin-facing reconciliation export or report.
- Event history suitable for accounting review.

Test:

- Refund/dispute paths lock unsafe release actions.
- Reconciliation report ties payables, Stripe IDs, and events together.

Deploy:

- Preview deploy plus operational review before production.

Acceptance:

- The platform has a clear record of what happened when payment goes wrong.

## Provider Path

Start with Stripe Connect test mode.

Phase 1 uses a ledger-only milestone because it is provider-independent. Phase 2 adds Stripe Checkout for pay-in. Phase 3 adds Connect onboarding. Phase 4 decides whether to stay with destination charges for simple one-driver transport jobs or move to separate charges/transfers when delayed settlement becomes a hard requirement.

Reassess Adyen, Airwallex, or another provider after real user interviews prove needs that Stripe does not cover cleanly, such as multi-currency settlement, enterprise marketplace operations, or specific Australia/NZ payout constraints.
