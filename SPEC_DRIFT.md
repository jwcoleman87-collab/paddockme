# SPEC_DRIFT — PaddockME

Deviations between the live code and `PADDOCKME_MASTER_SPEC.md` v1.1.
Format: `[section] — [file] — [what differs] — [severity: blocks-loop / cosmetic / debt]`

Seeded 2026-06-11 during DEMO-RETIRE-01 Phase 0 (baseline commit `46b5e77`). Updated through Phases 1–3.

## Section 3 — Design system

> **Closed 7 Jul 2026 (spec v1.2):** the pm-\* design system is now canonical and "Pastoral Zen" is retired, so the items below no longer measure against the spec. The R/A/G rating tokens survive only in the dormant legacy `(app)` tree and leave with it; hardcoded colour values remain disallowed under v1.2 §3 and are covered by the cross-cutting acceptance criteria, not this drift log.

- [§3] — `src/app/globals.css` — Radius tokens are 4/6/8/10px; spec expected soft 16px cards. — **closed v1.2** (Pastoral Zen radius expectation retired)
- [§3] — `src/app/globals.css` + `src/components/ListingCard.tsx` (PaddockSignalStrip) — Literal red/amber/green rating tokens render on paddock signal tiles. — **closed v1.2** (legacy `(app)` tree only; R/A/G remains unapproved in pm-\* surfaces, spec §8)
- [§3] — various components — Occasional hardcoded rgba()/hex values in shadows and overlays rather than tokens. — **closed v1.2** (superseded by v1.2 §3 pm-\* token rule)

## Section 4 — Architecture

- [§4.2] — `src/lib/prototypeStore.ts`, `src/lib/data/prototypePersistence.ts`, `src/lib/dummyData.ts` — Full legacy localStorage demo persistence layer + seed data still in bundle (unreachable for signed-in users since auth gate, but present). — debt (removed in Phases 1–2 of DEMO-RETIRE-01)
- [§4.2] — `src/app/(app)/listings/new/page.tsx`, `src/app/(app)/requests/RequestsClient.tsx`, `src/app/(app)/transport/available/CapacityClient.tsx`, `src/app/(auth)/onboarding/OnboardingClient.tsx`, `src/components/AppShellHeaderUser.tsx`, `src/lib/payments/ledger.ts`, auth pages — Components/helpers create Supabase clients directly (auth checks / reads / inserts / payment-ledger writes) instead of going through one repository/data-access boundary. — debt
- [§4.5] — `supabase/migrations/20260516120200_transport_and_messages.sql` — Spec lists core table `agreement_messages`; live table is `messages` (shared agreement+transport threads with xor constraint). Functionally equivalent; renaming needs a migration brief. — debt
- [§4.6] — `src/lib/data/repositories.ts` `buildAgreementSections()` — Agreements have exactly 6 sections ✓ but keys/labels are `parties, stock, paddock, dates, terms, transport`; spec names them `stock type, duration, rate, start date, transport, special conditions`. — debt (workspace is design-locked; rename needs its own brief)
- [§4.8] — workspace/transport UI + code — The action is labelled "Request transport"; spec requires **RFT (Request for Transport)** naming in UI copy and code. RFT naming exists only on the carrier board page copy. — cosmetic
- [§4.10] — `src/app/api/payments/transport/checkout/route.ts`, `src/lib/payments/*` — Stripe test-mode scaffolding exists for *transport* checkout only; no single provider interface; no agreement-settlement flow; not triggered at the loop's completion point. — debt (FUTURE brief per DEMO-RETIRE-01)
- [§4.11] — `src/lib/googleMapsKey.ts` — **Maps key not rotated; hardcoded fallback still committed** (centralised to one file, env-var first). Needs James: set env var in Vercel, rotate key, delete fallback. — debt ⚠ prominent flag

## Section 6 — Page specs

- [§6.1] — `src/app/LandingMarketing.tsx` — Log in link present ✓; no entry point to a public Driver Map (pillar absent, see §6.15). Feed marketplace appears only as copy mentions. — debt
- [§6.2] — `src/app/(auth)/onboarding/OnboardingClient.tsx` — Role-first onboarding exists ✓; no disabled "I have feed to sell — coming soon" waitlist card. Writes `paddockme.onboarding` localStorage snapshot as insert-failure fallback (business data). — cosmetic (card) / debt (localStorage, removed Phase 2)
- [§6.3] — `src/app/(app)/agreements/*` — Dashboard shows live agreements, counts, next-step CTA ✓. Single primary CTA is role-static, not loop-state-aware (e.g. doesn't switch to "Track your stock" mid-transport). — cosmetic
- [§6.4] — `src/app/(app)/request/new/page.tsx`, `src/lib/data/repositories.ts` `createLivestockRequestRecord` — No Google Places Autocomplete; region multi-pick pills only; request `location` column is written with a fixed legacy coordinate (`mapCoordinates.dale`, Central West NSW) for every request. Matching runs on regions, so the loop completes, but stored coordinates are wrong/placeholder. — debt (borders blocks-loop for map accuracy; loop itself completes)
- [§6.5] — `src/app/(app)/listings/new/page.tsx` — Single-page form, not a step wizard; no Places geocoding (region→representative coordinate); no Static Maps thumbnail; photos upload exists. Acres field: numeric input present — leading-zero default not re-verified this brief. — debt
- [§6.6] — `src/app/(app)/map/page.tsx`, `src/components/LiveMap.tsx` — Live paddock pins + user's routes exist; no price pins, no filter chips, no bottom-sheet peek card, no layer system; `PaddockME-Map-Layers-Reference.md` not present in repo. — debt
- [§6.7] — `src/app/(app)/listings/[id]/ListingDetailClient.tsx` — Decision-funnel layout ✓; CTA is "Select this paddock"/open workspace, not "Request Agistment"; no landowner trust card (public profile mode absent, §6.14); "Quick look" secondary CTA competes mildly. — cosmetic
- [§6.8] — `src/app/(app)/matches/page.tsx` — Match cards + scoring exist; selecting routes via listing detail rather than straight into workspace creation; match request is reconstructed from query params rather than a persisted request id. — debt
- [§6.9] — `src/app/(app)/workspace/[id]/*` — DESIGN-LOCKED, not redesigned. Persist + mirror ✓ (sections, agree ticks, lifecycle, chat poll ~5s; spec asks Realtime — polling logged). Section names differ (see §4.6). "Summary comments area with Done button" — absent. Caution dialogs deep-link to flagged section ✓. Push RFT now becomes the primary transport action only after every section is mutually agreed. Demo persona role-switcher still rendered for legacy non-UUID agreements (removed Phase 1). — debt
- [§6.10] — workspace → `requestTransportJob` — Prefill from agreement ✓ (no re-entry); no route visualiser with distance/time/deck stats; no explicit "RFT sent — carriers notified" interstitial (flash + system message only); RFT naming absent in copy. — debt
- [§6.11] — `src/app/(app)/transport/jobs/*`, `src/app/(app)/transport/[id]/RealTransportRoom.tsx` — Board ✓ (no agistment pricing — RLS wall holds: `transport_jobs`/`transport_quotes` policies exclude rate data; agreements unreadable by carriers). Status progression ✓ strict, writes `transport_status_events` ✓. Milestone check-in now exists for the assigned driver while in transit; offline queueing still absent. Realtime: polling (5s), not Supabase Realtime. — debt
- [§6.12] — `supabase/migrations/20260611190000_real_loop_tracking_and_settlement.sql`, `src/app/(app)/transport/[id]/RealTransportRoom.tsx` — Milestone model + timeline now exist (`transport_milestones`) and passed milestones light up in the transport room; automatic status-linked milestones cover loaded/departed/arriving/delivered and driver one-tap check-in covers route progress. Live truck GPS/map position, derived named towns/landmarks, offline queueing, and notifications remain absent. — debt
- [§6.13] — `src/app/api/payments/agistment-settlement/route.ts`, `src/app/(app)/transport/[id]/RealTransportRoom.tsx`, `src/lib/data/repositories.ts` — Completed transport now opens a database-backed agistment settlement record from agreement terms with honest "online payments launching soon — settle directly for now" handling and a "mark settled directly" event path. Stripe Connect remains test/scaffold-only; provider interface and live payout flow still absent. — debt
- [§6.14] — `src/app/(app)/profile/ProfileClient.tsx` — Owner view exists; **no public profile mode** (no distinct render path, no trust-badge surface); legacy demo persona switcher rendered (removed Phase 1). — debt
- [§6.15] — (no file) — Public Driver Map pillar **absent**. Additionally middleware (`src/lib/supabase/middleware.ts`) auth-gates all `/map` and `/transport*` routes, so no carrier surface is publicly reachable; spec requires the Driver Map to be public. — debt
- [§5 step 8] — n/a — "Live transport tracking" per spec is absent (see §6.12); farmers do see live status updates in the transport room, so the loop's information need is partially met. — debt

## Phase 1–2 completion notes — what was removed

Across the DEMO-RETIRE-01 and Codex sessions (commits `08dd012`…HEAD):

- **Deleted demo store/persistence:** `src/lib/prototypeStore.ts`, `src/lib/data/prototypePersistence.ts`.
- **Deleted demo clients/components:** `MessagesClient`, `RunsClient`, `TransportJobsClient`, `TransportClient` (demo room), `CapacityClient`, `WhatNeedsYou`, `ActivityFeed`, `ComplianceReadinessPanel`, `PaddockMap`, `DummyMap`, `PersonaIntroBanner`, `ListingsExplorer`.
- **Deleted demo routes:** `/preview/[kind]`, `/landowner`, `/runs`, `/workspace/[id]/snapshot`, `/_marketing_disabled`. `/transport` now redirects to the RFT board; `/transport/available` is an honest "coming soon" placeholder (capacity marketplace rebuild = future brief).
- **Seed data:** `src/lib/dummyData.ts` stripped to domain TYPES + livestock reference options only (zero personas, zero seed records). Module rename pending — logged under §4.2 debt.
- **Demo coordinates:** `mapCoordinates` persona keys (dale/brett/tash/lyn/wayne/sharon) replaced with neutral town keys; repository fallbacks re-pointed.
- **Persona assets:** `public/avatars/{dale,brett,wayne}.jpg` deleted.
- **Persona-era API:** `PersonaId`, `selectPersona`, `repositoryMode`, merge-with-seed helpers removed from the repository layer; `driver-1` fallback id removed; ChatPanel demo sender-tone removed.
- **localStorage business data:** all removed (prototype store, workspace/transport browser persistence, `paddockme.onboarding`, persona keys + cookie). Remaining localStorage: `src/lib/inbox.ts` thread-seen counts only — judged trivial UI state (permitted class).
- **Demo docs:** `docs/DEMO_SCRIPT.md`, `docs/DEMO_CHEATSHEET.md`, `docs/DEMO_REHEARSAL_LOG.md`, `docs/PERSONAS.md` deleted.
- **Acceptance interpretation:** persona names still appear in historical/business documents (`docs/BUILD_02.md`, handover docs, investor docs, `README.md`) and in the master spec's own legacy-names note. Product code and assets (`src/`, `public/`) have ZERO occurrences (word-boundary grep; "Armidale" is a town, not a persona). Scrubbing James's historical/investor documents was judged out of scope — James to confirm or request a docs scrub.

## Database cleanup — needs James's confirmation

No rows were deleted by the agent. Suspected demo/test rows are identifiable as anything created before the marketplace go-live cutoff already used by the app (`2026-06-09T11:20:59Z`, `MARKETPLACE_LIVE_SINCE` in `serverPaddocks.ts`). Run this in the Supabase SQL editor to list them:

```sql
select 'request' as kind, id::text, stock_type || ' x' || head_count as label, created_at
from public.agistment_requests where created_at < '2026-06-09T11:20:59Z'
union all
select 'paddock', id::text, title, created_at from public.paddocks where created_at < '2026-06-09T11:20:59Z'
union all
select 'agreement', id::text, coalesce(status,'?'), created_at from public.agreements where created_at < '2026-06-09T11:20:59Z'
union all
select 'transport_job', id::text, status, created_at from public.transport_jobs where created_at < '2026-06-09T11:20:59Z'
order by 1, 4;
```

Pre-go-live REQUESTS are already hidden from the live site by the cutoff filter; pre-go-live paddocks/agreements/jobs are not filtered. Decide per row: delete, or keep (your own James/Leona test records are in this set — the St Air agreement is real usage and should stay).

## Phase 3 — Core loop verification log (spec §5)

Method: database evidence + code-path references + this session's two-account browser testing (James = livestock owner, Leona = landowner). Fresh-account walk for all three roles still requires James (agent cannot create accounts or enter passwords — see "Items requiring James").

1. Request creation → **works** (verified this session: Supabase `agistment_requests` rows; `request/new/page.tsx` → `createLivestockRequestRecord`, now geocoded via `locationGeocode.ts`).
2. Listing creation → **works** (St Air + others; `listings/new/page.tsx`; geocoding added by Codex session — geocode-on-create re-verify with a fresh listing pending).
3. Matches → select → **works** (`/matches` scores live paddocks from the real request id; selection carries request id → agreement).
4. Agreement + 6 sections → **works** (verified in DB: 6 canonical sections per agreement after migration `20260611210000`).
5. Section resolution + chat persistence → **works** (verified two-account this session: edits, agree ticks, lifecycle, chat all persist and mirror ~5s polling).
6. RFT from workspace → **works** (`transport_jobs` row created; creation hardened to require real pickup/destination/coords/start date).
7. Carrier board + accept → **works** (driver-discovery RLS policy applied; accept assigns driver; needs fresh carrier-account confirmation by James).
8. Status updates visible to both farmers → **works** (transport room status stepper/history, polling; milestones model applied — first full milestone run pending a real movement).
9. Status progression events → **works** (`transport_status_events` written per change; verified rows exist for the test job this session).
10. Payment settlement → **partial by design** (FUTURE brief): on transport completion an agistment settlement record opens from agreement terms with "online payments launching soon — settle directly" handling (`/api/payments/agistment-settlement`); Stripe Connect provider interface and live payouts absent. No UI implies money moved.

RLS pricing wall → **intact**: `agreements` readable only by its two parties (carrier excluded ⇒ no `rate_per_head_week` access); `transport_jobs`/`transport_milestones` carry no agistment pricing; `transport_quotes` exclude the landowner. No policy was weakened this brief; one ADDITIVE select policy (driver discovery of available jobs) and the new `transport_milestones`/`payables` policies were added — logged, not weakening.

Migrations applied to production this session (SQL editor): `20260528123000_payments_ledger_foundation`, `20260610130000` (previously), `20260611190000`, `20260611203000`, `20260611210000`. Local migration files match what was executed.

## Guided demo — three customer lanes (added 14 Jul 2026)

The demo must demonstrate all three customer journeys — Farmer A (livestock
owner), Farmer B (landowner) and the carrier — as equally important views.

- [§2/§6] — `src/app/PaddockHomepage.tsx`, `src/lib/supabase/middleware.ts`, `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx` — Homepage role cards point at real signed-in surfaces (`/listings/new`, `/transport/jobs`); on demo builds/host these bounced the landowner and carrier roles into sign-in, which then dropped everyone into the livestock-owner lane, leaving the finished carrier lane (`/transport/demo`) unreachable from the front page. — **fixed 14 Jul 2026**: demo requests to those paths now redirect to each role's guided lane (`GUIDED_DEMO_LANES` in `src/lib/demoMode.ts`), and demo sign-in/sign-up preserve the chosen role via the sign-up `intent` param and the `next` path.
- [§2/§6] — `src/app/landowner/requests/[id]/page.tsx` — Farmer B's (landowner) guided lane is one handoff screen plus the shared workspace; there is no standalone start-to-finish landowner journey equivalent in depth to the owner and carrier lanes. — debt (needs its own build brief)
