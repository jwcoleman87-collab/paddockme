# Payments And Settlement Blueprint

This is a product blueprint, not an implementation claim. Payments, escrow, settlement, dispute handling, and automated invoicing are not built yet. The purpose of this document is to make the next commercial unlock concrete enough to discuss without overpromising.

Implementation checklist: see [Payments Milestone Plan](./PAYMENTS_MILESTONE_PLAN.md).

## Why Payments Are Next

The current MVP proves the coordination loop:

1. Livestock owner needs feed.
2. Landowner can offer country.
3. Both parties agree the terms.
4. Driver coordinates the movement.
5. Messages, artefacts, and status stay attached to the job.

Payments turn that coordination loop into the transaction layer:

1. Quote.
2. Agree.
3. Move stock.
4. Confirm milestones.
5. Settle.

## What Payments Must Not Do

Payments must not make PaddockME feel like a generic checkout flow.

Do not start with:

- A standalone payments dashboard.
- A generic cart/checkout metaphor.
- Subscription UI.
- Premature escrow language without legal review.
- Complex admin tooling.
- Anything that makes the demo claim "payments are done."

Payments should appear only where the workflow has earned them: agreement terms, transport quote, milestone confirmation, and settlement record.

## Actors

### Livestock Owner

Usually pays:

- Agistment fees.
- Transport fees.
- Potential platform fee.
- Potential bond or deposit.

Needs:

- Clear total expected cost.
- Payment timing before stock move.
- Receipt and records.
- Confidence funds are not released unfairly.

### Landowner

Usually receives:

- Agistment fees.
- Potential bond/deposit.

Needs:

- Confidence payment exists before stock arrive.
- Clear settlement timing.
- Records for tax/accounting.
- Dispute path if terms are breached.

### Transport Operator

Usually receives:

- Transport fee.

Needs:

- Quote acceptance.
- Cash-flow certainty.
- Clear payment terms.
- Proof of delivery/movement status.
- Low admin, especially for repeat operators.

### Platform

May receive:

- Transaction fee.
- Payment processing margin, if appropriate.
- Future SaaS or workflow fee for larger operators.

Needs:

- Clean audit trail.
- Low dispute burden.
- Clear compliance posture.
- No commingling or ambiguous custody claims before legal design.

## Payment Events

The workflow should eventually create structured payment events:

- `quote_created`
- `quote_countered`
- `quote_accepted`
- `agreement_ready_for_payment`
- `payment_authorised`
- `payment_received`
- `stock_loaded`
- `stock_delivered`
- `agistment_started`
- `milestone_confirmed`
- `settlement_released`
- `refund_requested`
- `dispute_opened`
- `dispute_resolved`

These events should attach to the agreement or transport room, not float in a separate finance area.

## First Payment Slice

The first build should be deliberately narrow:

- Transport quote acceptance creates a payable record.
- Farmer A can see the accepted transport rate.
- Driver can see quote/payment status for their job.
- Farmer B cannot see private transport rate details unless the product later decides they need a narrow status-only view.
- No real money movement in prototype until provider setup, legal review, and settlement rules are clear.

Why transport first:

- The quote/rate workflow already exists in the demo.
- The payer/payee relationship is easier to explain than agistment escrow.
- Wayne's pain is cash flow and backload utilisation, so payment certainty is a strong proof point.

## Second Payment Slice

After transport quote settlement is understood:

- Agistment agreement can create a payable schedule.
- Deposit/bond can be recorded.
- Recurring or milestone-based agistment fees can be planned.
- Settlement records attach to the agreement snapshot.

Do not build recurring complexity until interviews prove how users actually expect agistment to be paid.

## Data Model Sketch

Potential future tables:

- `payment_accounts`
- `payables`
- `payment_events`
- `settlements`
- `refund_requests`
- `disputes`

Potential `payables` fields:

- `id`
- `agreement_id`
- `transport_job_id`
- `payer_profile_id`
- `payee_profile_id`
- `amount_cents`
- `currency`
- `kind`
- `status`
- `due_at`
- `accepted_quote_id`
- `description`
- `metadata`
- `created_at`
- `updated_at`

Potential statuses:

- `draft`
- `pending_acceptance`
- `awaiting_payment`
- `paid`
- `partially_released`
- `released`
- `refunded`
- `disputed`
- `cancelled`

## Visibility Rules

Payments must inherit the privacy model:

- Livestock owner sees what they pay.
- Landowner sees agistment payments owed to them.
- Driver sees transport payments owed to them.
- Driver does not see agistment commercial terms.
- Landowner does not need to see every private transport quote detail unless required for workflow status.
- Platform/admin visibility comes later and should be explicit.

## Demo Language

Use:

"Payments and settlement are the next commercial unlock. The product already knows who agreed what, who moved the stock, and which milestone happened next. That is the foundation for settlement."

Avoid:

- "Escrow is built."
- "Stripe is live."
- "We handle disputes."
- "We guarantee payment."
- "The payment rails are done."

## Open Questions For Interviews

Ask livestock owners:

- Would you pay before stock arrive, on arrival, weekly, monthly, or after pickup?
- What would make you trust a deposit/bond?
- What records do you need for tax or farm management?

Ask landowners:

- Would you require payment before accepting stock?
- How do you handle missed payments today?
- What would make a settlement record credible?

Ask transport operators:

- What payment terms are normal?
- Which terms hurt cash flow?
- Would accepted quote plus delivery confirmation be enough to support faster settlement?
- Who disputes transport invoices today, and why?

## Build Gate

Do not start real-money payments UI until:

- `npm run verify:pitch` is green.
- At least five customer interviews mention payment timing or settlement risk unprompted.
- The team decides the first payable is transport, agistment, or deposit.
- Legal/compliance assumptions are written down.
- RLS visibility rules are designed before UI.

Founder override for the current build: it is acceptable to start the provider-independent payment foundation now if it stays ledger-first, test-mode/provider-hosted, and clearly labelled as not live money movement. The first payable remains transport quote settlement unless customer discovery forces a sharper priority.
