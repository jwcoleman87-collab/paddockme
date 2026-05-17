# Foundation Build 02 — Workspace and Agreement Flow Polish

This brief covers the second build phase. Foundation Build 01 (see [SCOPE.md](./SCOPE.md)) delivered the skeleton — routes scaffolded, brand applied, Supabase schema in place, Vercel auto-deploying. Build 02 makes PaddockME **feel like a real product instead of a prototype**: visual polish, the workspace fleshed out, the transport room introduced, and dummy data replaced with persisted, role-aware Supabase flows.

By the end of Build 02, each of the six personas should land on a coherent workspace or transport room with the right surfaces and access rules, and the agreement lifecycle should move through its states with real data.

> Guiding principle for this build: **the app needs to feel right before it gets clever.** Polish first, persistence second, cleverness later.

## Build sequence

Eight steps. The order matters — each one unlocks the next.

### 1. Polish the visual system

Settle typography, spacing, cards, bottom dock, page headers, and mobile layout so every page feels like the same product. The brand is already defined in `globals.css` and [DESIGN_INTELLIGENCE.md](./DESIGN_INTELLIGENCE.md) — this step is about applying it consistently, not redefining it.

### 2. Improve the 2-party workspace

The workspace is the heart of PaddockME. The split-screen scaffolding exists ([`SplitWorkspace.tsx`](../src/components/SplitWorkspace.tsx), [`AgreementPanel.tsx`](../src/components/AgreementPanel.tsx), [`ChatPanel.tsx`](../src/components/ChatPanel.tsx)) — now it needs to deliver real value:

- Clearer agreement sections (parties, stock, paddock, dates, rate, terms, artefacts)
- Shared artefact viewing (both parties can see the same NVD, photo, fence map)
- "Both parties agree" state per section
- Chat aligned with the agreement (which section is being discussed?)

### 3. Build the 3-party transport room

A distinct surface from the workspace. Three participants — Farmer A, Farmer B, Driver — coordinating the actual stock movement. No equivalent components exist in code yet; this is a new build, not a polish pass.

- Logistics-only visibility for the driver (see the [PERSONAS.md](./PERSONAS.md) driver-visibility rule)
- Pickup, route, gate access, arrival, headcount on/off, return move
- Linked to but separate from the workspace

### 4. Persist with roles — together, not sequentially

Turn dummy flows into real Supabase-backed flows **and** define the role/RLS model in the same pass. Farmer A, Farmer B, and Driver have different read/write access. The driver-visibility rule is enforced at the **data layer** (RLS policy on the agreements table), not just the UI.

Doing persistence before roles bakes in lax policies that leak. Doing roles before persistence has nothing to gate. Build them together.

### 5. Agreement lifecycle

State machine: **Draft → Negotiating → Ready to finalise → Active → Completed / Cancelled.** This defines the states matching produces *into*, so it has to come before matching.

Each transition has visible UI affordances and is auditable in the agreement history.

### 6. Light matching logic

Filters, not algorithms: region, stock type, head count, feed, water, fencing, availability. Chip-based, tap-don't-type. The goal is to surface real candidates a livestock owner would actually shortlist — not to be "smart". Smart comes later.

### 7. Verification / profile layer

Mobile verified, PIC and ABN placeholders, livestock readiness, property readiness, transport accreditations (LBCA, TruckSafe, NHVAS). Placeholders are fine — model the trust signals in the schema and the profile UI; don't wire to real verification services yet.

This is also where Sharon's multi-truck complexity lives (fleet, drivers, sub-contractors, document trails) per the PERSONAS.md profile-carries-the-difference rule.

### 8. Deployment QA — every push, not at the end

Not a final step. A discipline applied after every meaningful merge to `main`:

- Vercel build green
- All routes load
- Mobile responsive on a real phone (not just devtools)
- Auth behaviour unchanged (sign-in, sign-up, magic-link callback)

If a push breaks any of these, fix forward before starting the next item.

## What's IN scope

Anything in the build sequence above. Plus:

- Consistent typography (Fraunces display + Outfit body) and spacing applied to every route
- Mobile layout that passes the "one-handed in a ute" test
- Workspace agreement sections with persisted state
- Both-parties-agree state per section, persisted
- Transport room as a separate 3-party surface
- Supabase persistence for: profiles, paddocks, agistment_requests, matches, agreements, plus new tables for transport jobs and journey artefacts as needed
- Role model (Farmer A, Farmer B, Driver) enforced by RLS
- Agreement lifecycle state machine in the UI and the database
- Light matching with chip-based filters
- Profile pages rendering verification placeholders for all six personas
- Deployment QA checklist run after every push

## What's still NOT in scope

These remain explicitly deferred (carried forward from [SCOPE.md](./SCOPE.md)):

- Real money movement / Stripe / payments — the rate is a number on a screen, no money moves
- AI contract generation, AI mediation of disputes
- Real e-signatures or legal contract automation — "both parties agree" is a mutual click, not a legal signature
- Real Google Maps — static placeholder map only
- Real GPS or telematics on transport — fake animated dot is fine
- Broker workflows — no broker persona, no broker UI
- Reviews and ratings
- Admin panels
- Messaging beyond the workspace chat panel (no global inbox yet)
- Testing frameworks (Vitest comes later)
- Complex matching algorithms — chip filters only
- Over-engineering of any kind

The app needs to feel right before it gets clever.

## Definition of done

When Build 02 finishes, the persona walkthrough must be able to:

| Item | Status |
| --- | --- |
| Land on persona-appropriate home, profile, and transport views | partial (profile and transport persona views exist; auth-gated home view still pending Supabase) |
| Visit every route at consistent typography, spacing, and component patterns | done |
| Pass the "one-handed in a ute" test on a real 6.1" phone | pending (manual test) |
| Open a 2-party workspace and see the agreement state pulled from Supabase | partial (workspace renders, persistence still pending Supabase) |
| Toggle a "both parties agree" state per section and have it persist | partial (toggles wired; persistence pending Supabase) |
| Open a 3-party transport room as Wayne or Sharon and see logistics-only fields | done (role switcher, driver-visibility wall) |
| Confirm via SQL that the driver cannot SELECT the agreement rate column (RLS proof) | pending Supabase |
| Move an agreement through all five lifecycle states from the UI | done |
| Filter matches by region + stock type + head count and see real Supabase rows | partial (chip filters on /listings; real data pending Supabase) |
| View a profile page rendering verification placeholders for each persona type | done |
| Push a change to `main` and watch the QA checklist still pass | ongoing |

## Acceptance principles

Every screen and migration in this build must honour:

- The five DNA principles in [PRINCIPLES.md](./PRINCIPLES.md)
- **"Feel right before it gets clever"** (this build's guiding principle)
- The **2-party workspace + 3-party transport room** shape rule from [PERSONAS.md](./PERSONAS.md)
- The **driver-visibility rule** — enforced at the data layer, not just the UI
- Tap, don't type — chips, pills, sliders. No new free-text fields except chat messages and the profile bio
- No emoji as state indicators — lucide-react icons only

## Open questions

Defer answering until they're blocking — but capture so they don't surprise us:

- **Verification:** what's auto-verified (PIC lookup, ABN lookup) and what's manual? Likely manual for Build 02, automated in a later build.
- **Both-parties-agree granularity:** per-section, per-artefact, or per-whole-agreement? Recommend per-section so partial agreement is visible.
- **Driver invitation flow:** how does the driver get added to a transport room? Invited by Farmer A? Matched from Wayne/Sharon's available capacity? Auto-suggested by the system? Defer the answer — for Build 02, manual invitation by Farmer A is enough.
- **Intermediate lifecycle state:** do we need a state between Draft and Negotiating (e.g., "Sent" — drafted by one party, not yet viewed by the other)? Recommend yes if the audit history needs it; defer if not.
- **Workspace ↔ transport room linkage:** does the transport room get auto-created when an agreement hits "Ready to finalise"? Or is it a separate manual creation step? Recommend auto-create as a draft transport room when the agreement activates.

Resolve these as they come up. None of them should block starting Build 02.
