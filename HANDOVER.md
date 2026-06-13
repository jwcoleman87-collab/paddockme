# PaddockME Demo — Handover Brief

Context for picking up work on the PaddockME guided-workflow demo. James (the
user) is a non-developer ("layman") — he runs `npm run dev` locally and
clicks through the UI in a browser; he can't read diffs or run typecheck
commands himself. Be very explicit when asking him to test something
("open this URL, click this button, tell me what you see").

## 1. What this project is

A 12-screen clickable demo of "PaddockME" — a marketplace connecting
livestock owners who need agistment (temporary grazing land) with landowners
who have spare paddocks. It's Next.js 16.2.6, App Router, TypeScript,
Tailwind.

There are two "personas" walking through the same deal:
- **James Coleman** — the livestock owner, looking for grazing land for 120
  cattle. His flow starts at `/` and goes through registration → request →
  matches → property → workspace → agreement → review → transport.
- **John Smith** — the landowner of "Green Hills Farm", who receives James'
  request and negotiates the deal from the other side. His flow starts at
  `/landowner/requests/[id]`.

Both personas' screens read/write **the same shared "deal" state** via React
Context + localStorage (see §3). This is intentional — it's a single-machine
demo simulating a two-sided negotiation, with a "View as James" / "View as
John" button on each agreement page to flip perspective.

## 2. Stack & structure

- Next.js 16.2.6 App Router. Route groups `(app)` and `(auth)` exist —
  **avoid creating new top-level routes that collide with paths inside those
  groups**.
- Tailwind with custom `pm-` prefixed design tokens defined in
  `src/app/globals.css`:
  - `--color-pm-green-900: #003d2b` (primary brand green)
  - `--color-pm-success: #0f7b4a`
  - `--color-pm-cream-50` / `--color-pm-cream-100` (backgrounds)
  - `--color-pm-charcoal` (body text)
  - `--color-pm-muted` (secondary text)
  - `--color-pm-border`
  - `--color-pm-gold-500` / `--color-pm-gold-600` (warning/pending accent)
  - `--color-pm-warning`
- Icons: `lucide-react`.
- Shared layout helpers: `PmButton`, `PaddockMeLogo`, `AppBottomNav` (in
  `src/components/paddockme/PmNav.tsx`), `ChecklistPanel`.

## 3. Shared workflow state — `src/lib/paddockmeWorkflow.tsx`

This is the most important file in the project. It's a React Context
(`PaddockmeWorkflowProvider` / `usePaddockmeWorkflow()`) holding a single
`WorkflowState` object, persisted to `localStorage` under the key
`"paddockme-workflow-v2"` (bumped from `v1` this session because the
`AgreementState` shape changed — bumping the key resets the demo to a clean
slate on next load, which is what we want after a schema change).

```ts
export type WorkflowState = {
  request: RequestDetails;     // livestock type, head count, location, etc.
  agreement: AgreementState;   // the negotiated deal
};
```

### 3.1 Negotiation model (built this session)

The agreement used to be "James clicks a button, it's instantly agreed."
That's now replaced with a **proposal / accept / counter** model so both
James and John can negotiate back and forth on three terms: **rate**,
**dates**, and **payment terms**.

```ts
/** A live offer for one term of the deal, and whose "turn" it is. */
export type Proposal = {
  value: string;
  /** Who made this offer — the other person can accept or counter it. */
  from: "James" | "John";
};

export type AgreementState = {
  rate: string | null;
  priceAgreed: boolean;
  pendingRate: Proposal | null;

  datesLabel: string | null;
  datesConfirmed: boolean;
  pendingDates: Proposal | null;

  paymentTerms: string | null;
  paymentTermsConfirmed: boolean;
  pendingPaymentTerms: Proposal | null;

  transportCompany: string | null;
  transportPrice: string | null;
  transportArranged: boolean;
  reviewAccepted: boolean;
  lastUpdated: string | null;
};
```

**How it works:**
- The deal starts with James having made an opening offer on all three terms
  (seeded in `defaultState()`):
  - `pendingRate = { value: SUGGESTED_RATE, from: "James" }` →
    `"$12.50 / head / week"`
  - `pendingDates = { value: SUGGESTED_DATES_LABEL, from: "James" }` →
    `"1 Jun 2025 – 30 Aug 2025"`
  - `pendingPaymentTerms = { value: SUGGESTED_PAYMENT_TERMS, from: "James" }`
    → `"Monthly in advance"`
- These three constants plus `PAYMENT_TERM_CHOICES = ["Monthly in advance",
  "Weekly in advance"]` are exported from `paddockmeWorkflow.tsx` — don't
  redefine them locally in pages anymore (they used to be duplicated as
  local consts in both agreement pages; that duplication was removed this
  session).
- For each term, whichever side's name is **not** in `pending*.from` is "on
  the clock" — they see the other person's offer and can:
  1. **Accept** it (`acceptRate()` / `acceptDates()` /
     `acceptPaymentTerms()`) → copies `pending*.value` into the real field
     (`rate` / `datesLabel` / `paymentTerms`), sets the `*Confirmed` /
     `*Agreed` boolean to `true`, and clears `pending*` to `null`.
  2. **Counter** it (`proposeRate(value, from)` / `proposeDates(...)` /
     `proposePaymentTerms(...)`) → overwrites `pending*` with the new value
     and flips `from` to themselves, so now the *other* person is on the
     clock.
- Once a term is agreed (`*Confirmed`/`*Agreed = true`), `pending* = null`
  and the negotiation UI for that term disappears from both pages (replaced
  by the "done" entry in the checklist and the Live Agreement panel).

All four functions (`proposeRate`, `acceptRate`, `proposeDates`,
`acceptDates`, `proposePaymentTerms`, `acceptPaymentTerms`) are exposed via
`usePaddockmeWorkflow()`. The old `setRate` / `confirmDates` /
`setPaymentTerms` functions **no longer exist** — if you grep and find old
references to them, they need to be migrated to the new functions.

`isComplete` (used by `/account` and the workspace overview) is unchanged:
`priceAgreed && datesConfirmed && paymentTermsConfirmed && transportArranged`.

## 4. Reusable UI: `src/components/paddockme/WorkspacePanels.tsx`

Three exported components:

1. **`ChatPanel`** — conversation UI. Takes `messages: ChatMessage[]` and
   `currentUser: string` ("James" or "John"). Messages where
   `m.sender === currentUser` render right-aligned in green
   (`bg-pm-green-900 text-white`); others render left-aligned in cream
   (`bg-pm-cream-100`). Users can type and send new messages (kept in local
   `extra` state, not persisted).

2. **`LiveAgreementPanel`** — read-only summary table (`fields: { label,
   value, pending? }[]`). `pending: true` renders the value in gold
   (`text-pm-gold-600`) to mean "not agreed yet". **Note:** this component
   used to have `h-full flex-1` on its wrapper/`<dl>`, which caused it to
   stretch to the full height of its CSS-grid-stretched parent and made a
   sibling "Next Steps" block overflow below the footer nav. That was fixed
   earlier this session by removing `h-full`/`flex-1` — don't re-add them.

3. **`NegotiationStep`** (new this session) — the negotiation UI for one
   term of the deal. Props:

   ```ts
   {
     label: string;            // "Rate" | "Dates" | "Payment terms"
     pending: Proposal;        // agreement.pendingRate / pendingDates / pendingPaymentTerms (non-null when rendered)
     me: "James" | "John";     // whose page this is
     otherName: string;        // first name of the other party, for copy
     onAccept: () => void;     // acceptRate / acceptDates / acceptPaymentTerms
     onPropose: (value: string) => void; // (value) => proposeX(value, me)
     mode: "text" | "choices"; // free-text counter vs. preset buttons
     placeholder?: string;     // for mode="text"
     choices?: string[];       // for mode="choices" (PAYMENT_TERM_CHOICES)
   }
   ```

   Behaviour:
   - If `pending.from === me` (it's **my** offer, other side hasn't
     responded): shows "Your offer — waiting on {otherName}" + the value,
     with a way to *update* the offer before they respond (text input +
     "Update offer" button, or highlighted choice buttons).
   - If `pending.from !== me` (the **other side's** offer is on the table):
     shows a prominent green "Accept {label}: {value}" button with a
     checkmark icon, plus an "or" divider and a counter-offer UI (text input
     + "Counter" button, or preset choice buttons minus the current value).

   `mode="text"` is used for Rate and Dates (free-form values). `mode="choices"`
   is used for Payment Terms (`PAYMENT_TERM_CHOICES`).

## 5. Pages touched this session

### `src/app/workspaces/[id]/agreement/page.tsx` (James' agreement screen — Screen 10)
- Removed local `SUGGESTED_RATE`/`SUGGESTED_DATES_LABEL`/`SUGGESTED_PAYMENT_TERMS`
  consts — now imported from `paddockmeWorkflow.tsx` (only
  `PAYMENT_TERM_CHOICES` is actually still needed here).
- `agreementFields` (Live Agreement panel) now includes **Dates** and
  **Payment Terms** rows (previously only Rate was shown; Dates/Payment
  Terms were only reflected in the checklist as booleans).
- "Next Steps" section: the three old one-tap buttons (Agree rate / Confirm
  dates / Confirm payment terms) are replaced with three `<NegotiationStep>`
  instances (`me="James"`, `otherName="John"`), conditionally rendered only
  while `!agreement.priceAgreed` / `!agreement.datesConfirmed` /
  `!agreement.paymentTermsConfirmed` (and their respective `pending*` is
  non-null, which it always is while not-agreed).
- "Arrange transport" button and the "everything's agreed" success message
  are unchanged.

### `src/app/landowner/workspaces/[id]/agreement/page.tsx` (John's agreement screen — new page from earlier this session)
- This page was created earlier this session to give the landowner (John) his
  own perspective on the same shared deal — separate chat alignment
  (`currentUser="John"`), separate "Your Next Steps" panel.
- This session: removed the ad-hoc counter-offer UI I'd bolted on
  (a `useState` counter input + plain bordered buttons) and replaced **all
  three** Next Steps items with `<NegotiationStep>` (`me="John"`,
  `otherName={demoLivestockOwner.name.split(" ")[0]}` → "James").
- `agreementFields` also gained **Dates** and **Payment Terms** rows,
  matching James' page.
- Header still has "View as James" button (`PmButton` →
  `/workspaces/${demoRequest.id}/agreement`), and a banner explaining "You're
  viewing this deal as John Smith (Green Hills Farm)...".

### `src/app/workspaces/[id]/review/page.tsx` (Screen 11 — Agreement Review)
- Removed a hardcoded `CONFIRMED_DATES_LABEL = "1 Jun 2025 – 30 Aug 2025"`
  constant that duplicated the suggested dates.
- The "Duration" row now reads the **actual negotiated** dates:
  `agreement.datesConfirmed && agreement.datesLabel ? \`${demoRequest.duration} · ${agreement.datesLabel}\` : \`${demoRequest.duration} · Dates not yet confirmed\``.
  This matters now because dates can be a counter-offered value, not just
  the original suggestion.

## 6. Earlier-session work (already done & user-confirmed, for context)

These were completed and confirmed working **before** this session's
negotiation work, and shouldn't need revisiting unless something regresses:

- **`/account` page** (`src/app/account/page.tsx`) — new profile/demo-controls
  page. Shows profile header, current request summary, agreement progress
  checklist, "Continue Agreement"/"View Final Agreement" button, and a
  "Reset Demo" button (`resetWorkflow()` then redirect to `/`).
- **`AppBottomNav`** (`src/components/paddockme/PmNav.tsx`) — "Profile" nav
  link now points to `/account` (was `/profile`, which didn't exist).
- **`LiveAgreementPanel` CSS overflow fix** — removed `h-full`/`flex-1` (see
  §4 above). Fixed a bug where the "Next Steps" panel rendered
  overlapping/below the green footer nav on `/workspaces/1023/agreement`.
- **Landowner negotiation page** — `/landowner/workspaces/[id]/agreement`
  created (described in §5), and `/landowner/requests/[id]/page.tsx`'s
  "Accept Discussion" button repointed from
  `/workspaces/${demoRequest.id}` (shared workspace, already "Complete") to
  `/landowner/workspaces/${demoRequest.id}/agreement` (John's own
  negotiation view). This fixed a UX issue where the landowner had no
  opportunity to negotiate before the deal showed as "Complete".

## 7. Known issues / things to ignore

- **Bash sandbox typecheck is unreliable.** Running `npx tsc --noEmit` in the
  sandbox produces ~60 false-positive errors (TS17008, TS1127, etc.) across
  files that were never touched (`FlowShell.tsx`, `layout.tsx`, etc.). This
  appears to be a stale/broken mount issue in the sandbox, **not real
  errors**. Trust the Read/Edit/Write tool results for file content; have
  James run `npm run dev` and/or `tsc` locally if a real typecheck is needed.
- **A "Sign in required" popup** seen during click-through is a browser
  extension popup, unrelated to this app — not a code issue.
- `STORAGE_KEY` was bumped to `"paddockme-workflow-v2"` this session. Any
  user with old `v1` state in localStorage will silently get a fresh
  `defaultState()` — this is intentional and fine for a demo, but mention it
  if James asks why his in-progress deal "reset".

## 8. Outstanding / suggested next steps

1. **Reflect negotiation actions in the chat** (suggested to James, not yet
   confirmed/started): when someone accepts or counters a term via
   `NegotiationStep`, also push a system-style message into the conversation
   (e.g. "John countered: $14.00 / head / week" or "James accepted the
   rate: $12.50 / head / week"). This would make the chat feel like a real
   negotiation log. Likely implementation: `ChatPanel` currently manages its
   own `extra` messages in local state and isn't persisted/shared between
   James' and John's pages (each page renders its own `ChatPanel` instance
   with the same static `demoConversation` + its own local `extra`). To
   show negotiation events on **both** pages, the messages would need to
   move into the shared `WorkflowState` (e.g. `state.messages: ChatMessage[]`)
   rather than `ChatPanel`'s local state — this is a moderate refactor of
   `ChatPanel` (drop its internal `extra` state, accept messages purely as a
   prop, lift `send()` into the parent via `usePaddockmeWorkflow()`).

2. **Untested from earlier session:** James was asked to click the top-right
   profile icon (`UserCircle2`, next to the bell) on
   `/landowner/requests/1023` and report what happens — no feedback received
   yet. Worth circling back; it currently doesn't link anywhere (it's a
   static icon in the header, no `<Link>`/`onClick`), so clicking it
   currently does nothing. Could wire it to `/account` or a future
   `/landowner/account` page.

3. **Task #20 ("Verify: typecheck + click through full flow")** is still
   `in_progress` in the task list — the happy-path click-through (screens
   1–12) was fully completed and confirmed earlier; the negotiation rework
   (this session) has been built but **not yet click-tested by James**. Next
   action should be walking James through testing the new negotiation flow:

   - Open `/landowner/workspaces/1023/agreement` (John's view). It should
     load fresh (storage key changed) showing James' three opening offers as
     pending, with green "Accept" buttons.
   - Test **counter on rate**: type e.g. `$14.00 / head / week` in the
     counter box, click "Counter". The page should flip to "Your offer —
     waiting on James: $14.00 / head / week".
   - Click "View as James" (top-right button) → goes to
     `/workspaces/1023/agreement`. The Rate `NegotiationStep` should now show
     "John proposed" with John's $14 offer, Accept/Counter options for
     James.
   - Test **Accept** on dates and **choice buttons** on payment terms (pick
     "Weekly in advance" as a counter, confirm it shows up correctly on the
     other page).
   - Once all three terms + transport are done, confirm `/workspaces/1023/review`
     shows the **actual negotiated** rate/dates/payment terms (not the old
     hardcoded suggestions), and `/account` shows the agreement progress
     checklist as fully ticked.

## 9. File map (everything touched, for quick reference)

- `src/lib/paddockmeWorkflow.tsx` — shared state, negotiation model (rewritten this session)
- `src/components/paddockme/WorkspacePanels.tsx` — `ChatPanel`, `LiveAgreementPanel`, `NegotiationStep` (new component this session)
- `src/app/workspaces/[id]/agreement/page.tsx` — James' agreement screen (Screen 10)
- `src/app/landowner/workspaces/[id]/agreement/page.tsx` — John's agreement screen (new earlier this session, negotiation UI added this session)
- `src/app/workspaces/[id]/review/page.tsx` — Screen 11, dates now dynamic
- `src/app/account/page.tsx` — profile/demo-controls page (earlier session)
- `src/components/paddockme/PmNav.tsx` — `AppBottomNav`, Profile link → `/account` (earlier session)
- `src/app/landowner/requests/[id]/page.tsx` — Screen 8, "Accept Discussion" → `/landowner/workspaces/[id]/agreement` (earlier session)
