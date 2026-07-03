# Live Agreement Screen — Product Spec (post-finalisation home base)

**Status: proposal for James's sign-off. Do not build without approval (master spec §8 discipline).**
This is the "proper fix" follow-up to the Complete-state loop bug (July 2026). The cheap fix
(state-gating the negotiation CTAs) is done; this document specifies the surface that should
exist instead of the dead end those CTAs used to loop through.

Subordinate to `PADDOCKME_MASTER_SPEC.md`. Reads alongside §6.9 (workspace), §6.10 (RFT),
§6.12 (transport tracking), §6.13 (payments).

---

## 1. The problem this screen solves

The workspace flow was built for the **negotiation phase**: connect → resolve sections →
agree terms → arrange transport → complete. Once every milestone ticks over, the app has
nowhere else to send the user, so historically it routed them back through the negotiation
pages — a four-page loop (Workspace → Agree terms → Review Agreement → Accept → Workspace)
where nothing changed on any click.

The deeper issue isn't the loop; it's the missing room. **A completed agreement is where
users spend most of their time.** A 90-day agistment lives long after the negotiation is
over — stock is on someone else's country, money falls due monthly, a truck moves twice.
Today the app treats "Complete" as the end of the story. For the customer it's the start.

## 2. The rule that prevents the bug class (already enforced, keep enforcing)

> **Any CTA that mutates the agreement must be gated on the agreement's lifecycle state.**

| Action | Negotiating | Ready to finalise | Active | Completed | Cancelled |
|---|---|---|---|---|---|
| Edit / agree sections | ✅ | ✅ (demotes to Negotiating) | ✅ (demotes) | ❌ | ❌ |
| Advance lifecycle | ✅ | ✅ | ✅ | ❌ | ❌ |
| Push RFT | ❌ until all sections agreed | ✅ | ✅ | ❌ | ❌ |
| Cancel agreement | ✅ | ✅ | ✅ | ❌ | ❌ |
| Accept / re-accept terms | ✅ | ✅ | ❌ (already executed) | ❌ | ❌ |

Every new surface inherits this table. A button that would be a no-op or a re-acceptance
must not render as a live primary action.

## 3. What the Live Agreement screen is

**Purpose:** the daily home base for an agreement whose terms are executed — the screen a
farmer opens with their morning coffee to answer "is everything on track?" in five seconds.

**When it's shown:** lifecycle `Active` (and, as a read-only archive variant, `Completed`).
The workspace remains the negotiation surface; once the agreement is Active, the
workspace's primary CTA and all dashboard/agreement-list links route **here**, not back
into the negotiation flow.

### 3.1 Layout (top to bottom)

1. **Executed deal summary (read-only).** Livestock, property, dates, rate, payment terms,
   transport carrier + price. This is the record, not a form — no agree buttons, no
   amber "accept" CTA. One quiet "View full agreement record" link opens the complete
   section-by-section detail with the event trail.

2. **Live timeline.** The single most valuable element. Derived from existing data, never
   re-typed:
   - Transport: pickup date, milestone progress, delivery ETA (from `transport_jobs` +
     `transport_status_events`, same source as §6.12 tracking).
   - Money: next payment due and amount (derived from the agreement's rate + payment-terms
     sections, per the §6.13 blueprint; "settle directly for now" honesty rules apply).
   - Term: days elapsed / days remaining in the agistment, end date, and — near the end —
     a "term ending soon" marker that sets up renewal or exit.
   Timeline items light up in the sage/positive token as they pass (§6.12 colour rules —
   no new colour language).

3. **Actions row.** All post-execution, all state-legitimate:
   - **Message {counterparty}** — the existing workspace chat, same thread.
   - **Track transport** — deep link to the §6.12 tracking surface (only while a movement
     is live; afterwards shows "Delivered ✓" with the date).
   - **Payments** — the §6.13 summary: what's owed, to whom, when; record/mark settled.
   - **Report an issue** — opens chat pre-scoped to a flagged concern, written to the
     event trail.
   - **Request amendment** — the one deliberate path back into negotiation. Uses the
     existing demotion mechanic (agreement drops to Negotiating, both parties re-agree the
     changed section, system message records why). Framed as a serious action, not a
     casual edit.

### 3.2 Completed variant (agistment has ended)

Same skeleton, archival tone: final record, full event trail, payments ledger showing
settled, transport history. Primary CTA becomes forward-looking — "Rebook with
{counterparty}" / "Find feed again" — pointing back into the core loop (§5) rather than at
the dead agreement.

## 4. Data requirements

Nothing new. Everything derives from existing rows: `agreements` + sections,
`agreement_messages`, `transport_jobs`, `transport_status_events`, and the payments ledger
scaffolding. The screen is a **read-model** over the loop's event trail — which is the
test that the trail is actually complete.

## 5. Must not

- Re-render any negotiation CTA ("agree", "accept", "counter") as live on this screen.
- Imply money has moved when it hasn't (§6.13).
- Invent timeline events in the UI — every item maps to a stored row/event.
- Touch the §6.9 workspace layout — that redesign is parked pending James's design
  discussion. This is a **new surface**, and the routing change (workspace CTA → here when
  Active) is the only workspace-adjacent edit.

## 6. Done when

A farmer whose agreement went Active a month ago can open the app and, within five
seconds and zero dead ends: see that their stock arrived, when the next payment falls due,
how long remains on the term, and reach the other party — without ever being offered a
button that re-accepts, re-requests, or re-agrees anything that is already done.
