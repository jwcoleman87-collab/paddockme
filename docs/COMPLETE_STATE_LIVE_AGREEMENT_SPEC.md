# Spec: Live Agreement screen for the Complete state

Status: proposed — not built yet. Written 3 Jul 2026 after killing the
Complete-state "review agreement" loop (workspace -> agree terms -> review ->
accept -> workspace) with state-gated CTAs. That was the cheap fix. This doc
is the proper fix for the next round.

## Problem

Once an agistment agreement hits Complete (price, dates, payment terms,
transport all agreed and the review accepted), the app has nothing to show
the user except the negotiation flow they just finished. Every CTA routes
back into screens built for deal-making, not deal-running. The cheap fix
suppresses the dead buttons, but the Complete state still has no home of
its own.

The negotiation flow (Connect -> Review Livestock -> Review Property ->
Agree Price -> Arrange Transport) has no place in the Complete state. Any
route into that flow while the agreement is Complete should redirect to the
Live Agreement view described below.

## Proposed fix: a dedicated Live Agreement screen

A read-only executed-deal screen that becomes the user's daily home base
for the life of the agistment (typically 90 days). Route suggestion:
`/workspaces/[id]/live` — and make it the workspace's primary CTA target
whenever `isComplete` is true.

### 1. Executed deal summary (read-only)

The facts of the deal, no edit or accept actions:

- Livestock (head count and type)
- Property and location
- Duration and dates
- Rate
- Payment terms
- Transport (carrier and price)
- Date the agreement was accepted, and both parties' names

### 2. Live status timeline

The stuff that changes day to day — this is why users come back:

- Transport pickup date and current status (booked / en route / picked up)
- Delivery ETA and confirmation of arrival
- First payment due date, then ongoing payment schedule status
- Agreement end date countdown

Data model note: the current `AgreementState` in
`src/lib/paddockmeWorkflow.tsx` has none of these fields. It needs
transport status, payment schedule, and an `acceptedAt` timestamp added
(and the Supabase equivalents when this moves off localStorage).

### 3. Post-completion actions

- Contact counterparty (opens the existing workspace chat)
- View invoices
- Track transport
- Report an issue
- Request amendment

None of these exist yet; stub the ones that don't have a backend rather
than hiding them, so the layout is honest about where the product is going.

## Routing rules

- Workspace overview, Complete state: primary CTA -> Live Agreement.
- `agreement` and `review` pages, Complete state: redirect (or at minimum
  link prominently) to Live Agreement. Keep the read-only review page
  reachable from the Live Agreement summary ("View full agreement") for
  anyone who wants the formal record.
- Negotiation routes stay untouched for non-Complete states.

## Out of scope for this spec

- Payments integration beyond showing due dates already known
- Amendment workflow itself (Request amendment just opens chat with a
  pre-filled message in v1)
- Multi-agreement dashboards
