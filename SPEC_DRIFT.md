# SPEC_DRIFT — PaddockME

Deviations between the live code and `PADDOCKME_MASTER_SPEC.md` v1.1.
Format: `[section] — [file] — [what differs] — [severity: blocks-loop / cosmetic / debt]`

Seeded 2026-06-11 during DEMO-RETIRE-01 Phase 0 (baseline commit `46b5e77`). Updated through Phases 1–3.

## Section 3 — Design system

- [§3] — `src/app/globals.css` — Radius tokens are 4/6/8/10px; spec expects soft 16px cards. Components also use Tailwind utility radii (`rounded-2xl` etc.) rather than the tokens. — cosmetic
- [§3] — `src/app/globals.css` + `src/components/ListingCard.tsx` (PaddockSignalStrip) — Literal red/amber/green rating tokens (`--color-rating-low/mid/high`) exist and render on paddock signal tiles; spec §3 says R/A/G bars are NOT approved without James's sign-off. — cosmetic (explicit sign-off item, spec §8)
- [§3] — various components — Occasional hardcoded rgba()/hex values in shadows and overlays rather than tokens. — cosmetic

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
- [§6.9] — `src/app/(app)/workspace/[id]/*` — DESIGN-LOCKED, not redesigned. Persist + mirror ✓ (sections, agree ticks, lifecycle, chat poll ~5s; spec asks Realtime — polling logged). Section names differ (see §4.6). "Summary comments area with Done button" — absent. Caution dialogs deep-link to flagged section ✓. Push-RFT does not become *primary* on full resolution (transport request available throughout). Demo persona role-switcher still rendered for legacy non-UUID agreements (removed Phase 1). — debt
- [§6.10] — workspace → `requestTransportJob` — Prefill from agreement ✓ (no re-entry); no route visualiser with distance/time/deck stats; no explicit "RFT sent — carriers notified" interstitial (flash + system message only); RFT naming absent in copy. — debt
- [§6.11] — `src/app/(app)/transport/jobs/*`, `src/app/(app)/transport/[id]/RealTransportRoom.tsx` — Board ✓ (no agistment pricing — RLS wall holds: `transport_jobs`/`transport_quotes` policies exclude rate data; agreements unreadable by carriers). Status progression ✓ strict, writes `transport_status_events` ✓. Milestone check-in: **absent** (§6.12 future). Offline queueing: absent. Realtime: polling (5s), not Supabase Realtime. — debt
- [§6.12] — (no file) — Transport tracking surface **absent**: no milestone model, no milestone timeline, no live truck position, no ETA degradation, no notifications. Today both farmers see status history + stepper in `/transport/[id]` via polling. — debt (FUTURE brief per DEMO-RETIRE-01; recorded, not built)
- [§6.13] — `src/app/payments/transport/*`, `src/app/api/payments/transport/checkout/route.ts`, `src/lib/payments/*` — Today: transport-only Stripe test checkout + sandbox + payments ledger (`payment_events`), reachable from payment routes; **not** triggered at transport `completed`; no plain-words settlement summary from the agreement rate section; no "settle directly for now → mark settled" record. Loop currently ends at transport `completed` with no payment step. — debt (FUTURE brief; recorded, not built)
- [§6.14] — `src/app/(app)/profile/ProfileClient.tsx` — Owner view exists; **no public profile mode** (no distinct render path, no trust-badge surface); legacy demo persona switcher rendered (removed Phase 1). — debt
- [§6.15] — (no file) — Public Driver Map pillar **absent**. Additionally middleware (`src/lib/supabase/middleware.ts`) auth-gates all `/map` and `/transport*` routes, so no carrier surface is publicly reachable; spec requires the Driver Map to be public. — debt
- [§5 step 8] — n/a — "Live transport tracking" per spec is absent (see §6.12); farmers do see live status updates in the transport room, so the loop's information need is partially met. — debt

## Phase 1 notes — demo personas & seed data (what was removed)

Filled during Phase 1; see git history of DEMO-RETIRE-01 commits for the full file list.

## Database cleanup — needs James's confirmation

Filled during Phase 1 from production SELECTs (no rows deleted by the agent).

## Phase 3 — Core loop verification log

Filled during Phase 3.
