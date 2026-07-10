# PaddockME Venture Audit — 10 July 2026

Forensic product and technical audit of everything connected to PaddockME.
Conducted by Claude (Fable 5) with full machine access: filesystem sweep, git history, spec review, live local testing of every guided screen, production URL probing, RLS policy review, build + typecheck + e2e runs.

Evidence notation: every major claim cites a file, commit, test run, or observed behaviour. Nothing below is asserted from documentation alone.

---

## A. Executive verdict

**PaddockME is two products sharing one repository, and neither is currently the whole product.**

1. **The deployed production app** (`main` → https://paddockme-oz51.vercel.app, Supabase project `aevzcvlzfvrdipgofczx`) is a *real, database-native marketplace*: Supabase auth, listings, requests, matching, agreements with 6 canonical sections, RFT, carrier job board, transport status events + milestones, and settlement records — all behind sign-in. Its core loop was verified end-to-end with two real accounts on 11 June 2026 (`SPEC_DRIFT.md` Phase 3 log; real usage exists — the "St Air" agreement). It wears the *retired* UX ("legacy `(app)` tree") plus a restyled guided-design homepage.

2. **The canonical guided MVP** (branch `codex/private-beta-real-loop`, 23 commits ahead of `main`, **not deployed**) is a *polished, single-browser guided demo*: the 12-screen flow the master spec v1.2 declares canonical. I walked it end-to-end today — request → matches → property → workspace → agreement negotiation → review → RFT → quotes → transport room → booked → Live Agreement → reset. It works, feels coherent, and persists across refresh. But its workflow state lives in **localStorage** (`paddockme-workflow-v2`), the landowner and both transport quotes are **hardcoded demo data** (John Smith / Green Hills Farm / Wayne Transport), matching is simulated, and the "second party" is the same person in the same browser.

**Classification:** production is an *early production product with almost no users*; the guided lane is a *high-quality interactive prototype*. The venture's true state is: **the working backend is wearing the retired front-end, and the canonical front-end is wearing a demo backend.**

**What is genuinely working:** the entire guided walkthrough locally (12/12 Playwright smoke tests pass); typecheck and production build pass; the real Supabase loop on production (as of its June verification); honest demo copy; a real migration history; a real RLS pricing wall.

**What is preventing launch:**
- The public URL cannot demonstrate the product: the deployed homepage advertises "I NEED FEED" etc., but every destination is auth-gated (307 → `/sign-in`) or 404 (`/properties/*`, `/login`, `/register`, `/account` don't exist on `main`). A visitor today sees a beautiful homepage and then a sign-in wall.
- Three weeks of work (live chat, Live Agreement, review-loop fix, evergreen dates, guided auth) exists only on the unmerged local branch.
- The guided lane's second and third personas aren't real, so no genuine two-party transaction can happen in the canonical UX.
- Local development is silently degraded: `.env.local` has empty values for every key (created by `vercel env pull`), so auth and chat fall back to demo behaviour with no error.

**Should the codebase be continued or replaced? Continued — unambiguously.** The architecture (Next.js App Router + Supabase + RLS + migrations) is sound, both lanes compile in one passing build, the data model matches the spec, and the hard problems (RLS pricing wall, agreement sections, transport status trail) are already solved in the production lane. The work remaining is *reconciliation and wiring*, not rebuilding.

---

## B. Project map

### Folders on this machine
| Location | What it is | Status |
|---|---|---|
| `Desktop/paddockme` | The single active repository (origin: github.com/jwcoleman87-collab/paddockme) | **Active** |
| `Desktop/PADDOCKME_BUILD_GUIDE` | 21-file guided-MVP build spec (May 2026): build order, design system, per-flow specs, dummy data, "do not build yet" | Reference; superseded in part by `PADDOCKME_MASTER_SPEC.md` v1.2 |
| `Desktop/PADDOCKME_REFERENCE` | Brand voice, privacy rules, dispute playbook, pricing principles, map layers reference, working-together playbook | Reference; `PaddockME-Map-Layers-Reference.md` here (spec §9 says it should be in the repo — it isn't) |
| `Desktop/Agistment Project` | 2021 market research (beef industry, horticulture PDFs, competitor sites) | Historical |
| `Desktop/paddockme-push.bat` | One-off commit/push helper for a past type issue | Stale; safe to delete |
| `Downloads/` | `PADDOCKME_MASTER_SPEC.md` + `_1/_2/_3` iterations, `PaddockME-Map-Layers-Reference.md`, two paddock hero images | Spec drafting artefacts |
| `Documents/Codex` | Empty folder | Nothing |

No DigitalOcean configuration, credentials, or server notes were found anywhere on the machine. A `Dockerfile` + `docker-compose.yml` exist in the repo (branch work merged into the current line, `f16212f`). **Verdict: Vercel is the deployment path; the Docker work is optional self-hosting insurance, and no VPS is in use or needed for MVP.**

### Branches (local + origin)
| Branch | Tip | Status |
|---|---|---|
| `main` | `dd8a1a8` 30 Jun — deployed to Vercel prod | **2 commits ahead of the merge-base** (PRs #26/#28: demo reset buttons), otherwise 23 behind current work |
| `codex/private-beta-real-loop` (current) | `702a3d9` 7 Jul "Wire guided auth to Supabase profiles" | **The real HEAD of the venture.** Contains: guided flow reconstruction, transport chat-then-decide room, live 3-way chat (Supabase demo table + Realtime), Docker, review-loop fix, Live Agreement screen + complete-state fields, spec v1.2, evergreen demo dates, doc refresh, guided auth wiring |
| `fix/complete-state-review-loop-v2` | `a1ed2fb` | Fully contained in current branch (ancestor) |
| `chore/docker-professionalisation` | `1ce54cb` + 1 stash | Contained in current branch; **stash `stash@{0}`** touches review page/AnimalIcons — almost certainly superseded, review then drop |
| `paddockme-guided-mvp-rebuild` | `3f39991` 14 Jun | Historic rebuild branch, ancestor of current line |
| `codex/parallel-01-docs`, `codex/build-02-workspace-polish`, `feat/route-map-preview`, ~15 `origin/claude/*` | various | Short-lived task branches; the claude/* set is pre-rebuild era (map, pickers, filters). None contain unmerged work the venture needs |

### Documents in the repo (authority order)
1. `PADDOCKME_MASTER_SPEC.md` v1.2 (7 Jul) — canonical; pm-* design system canonical, demo mode "retired by owner decision"
2. `SPEC_DRIFT.md` — honest, current drift log (last real update ~12 Jun + v1.2 closures 7 Jul)
3. `docs/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md` — implemented on the current branch
4. `docs/AI_HANDOFF_CURRENT.md` (7 Jul) — accurate
5. **Stale and misleading:** `docs/CURRENT_PRODUCT_AUDIT.md` (23 May — describes the retired Dale/Brett/Wayne demo era), `HANDOVER.md`, `BUG_REPORT.md`, investor docs (pre-rebuild), `README.md` (documents guided routes as if deployed; live-demo link doesn't walk them)

### Infrastructure
- **Vercel:** project `paddockme-oz51` (team `team_dCW82…`), auto-deploys `main`. Production is live and serving.
- **Supabase:** project `aevzcvlzfvrdipgofczx`. 15 migrations in `supabase/migrations/` (initial schema → RLS → transport/messages → quotes/capacity → build-02/03 → coordinates → payments ledger → driver discovery → tracking/settlement → location capture → canonical sections → carrier cleanup → demo workspace chat). SPEC_DRIFT records migrations through `20260611210000` applied to prod; **whether `20260702133000_demo_workspace_chat` is applied to prod is UNVERIFIED** — must be checked before the guided chat ships.
- **Stripe:** test-mode scaffolding only (transport checkout + webhook + ledger + sandbox fallback). No live account. UI never claims money moved — correct per spec.
- **Google Maps:** key handling now env-only (`src/lib/googleMapsKey.ts` — fallback deleted). **But the old key string is still committed at HEAD in `docs/BUG_SCAN_2026-06-08.md` and throughout git history. It is public. It has not been rotated.**

---

## C. Product capability matrix

Lanes: **PROD** = deployed `main` (real marketplace, auth-gated) · **GUIDED** = current branch (public demo lane, undeployed).

| Feature | PROD | GUIDED | Evidence |
|---|---|---|---|
| Public homepage | Working (restyled) | Working | Both serve "Find Feed. Find Stock. Move Livestock."; tested live + local |
| Registration / login | Working (Supabase, `(auth)` tree) | **Partial** — wired to Supabase 7 Jul, but silently routes on without an account when Supabase is unconfigured (`RegisterCard.tsx:64-65`) | Tested locally: "account created" with no backend call |
| Onboarding (role-first) | Working | Missing (role picked at register) | `OnboardingClient.tsx` |
| Create agistment request | Working (DB insert, geocoded) | Working (localStorage) — real input carries through all 12 screens | Tested: 85 Sheep / Orange NSW flowed to every later screen |
| Matching | Partial (region-scored, real paddocks) | **Mocked** — same 2 hardcoded properties for any request | `paddockmeDemoData.ts` `demoProperties` |
| Property detail | Working (`/listings/[id]`) | Working but static (Green Hills Farm only) | Tested |
| Landowner request review | Working (`/requests` board) | **Mocked** — single notification screen `/landowner/requests/1023` | Tested |
| Agreement workspace | Working (6 sections, 2-party persist + mirror, DESIGN-LOCKED) | Working single-browser (price/dates/terms propose-accept-counter) | SPEC_DRIFT Phase 3 items 4–5; local walk |
| Workspace chat | Working (`messages` table, 5s polling) | **Partial** — Supabase `demo_chat_messages` + Realtime; silently local-only when insert fails (message vanished on nav in local test) | `PmChatPanel.tsx`; tested |
| RFT (request for transport) | Working (creates `transport_jobs`) | Working (state flag + template) | Tested both codepaths |
| Transport quotes | Working (`transport_quotes`, RLS-walled) | **Mocked** — Wayne $2,200 / Rural Freight $2,450 hardcoded | Tested |
| Transport room / coordination | Working (3-party, status stepper, milestones) | Working (chat-then-decide, accept/decline) | Tested guided; prod per SPEC_DRIFT §6.11–6.12 |
| Transport status progression | Working (`accepted→loading→in_transit→arrived→completed` + events + milestones) | **Broken/missing** — status can never leave "booked"; `picked_up/en_route/delivered` are unreachable states in `paddockmeWorkflow.tsx` | No setter exists past `acceptTransport` |
| Live Agreement (complete state) | Missing | **Working** — deal record, transport stepper, payment schedule, countdown, review-loop fixed | Tested incl. refresh + re-review |
| Payments | Partial (test checkout, ledger, settlement record, honest copy) | Missing ("View Invoices — SOON") | `api/payments/*` |
| Demo reset | Working (PRs #26/#28) | Working (`/account` → Reset Workflow) | **Two divergent implementations** — `runDemoReset()` on main vs `resetPaddockmeDemoState()` here |
| Driver map (public pillar, spec §6.15) | Missing | Missing | No route either lane |
| Public profile / trust card | Missing | Missing | SPEC_DRIFT §6.14 |
| Admin (users, disputes, verification, support) | **Missing entirely** | Missing | No admin routes in build output |
| Notifications / reminders | Missing | Missing (fake "3 online" presence) | |
| Ratings/reviews, documents/compliance records | Missing (static badges only: "NVD Accredited", "Fully Insured" — unverified claims) | Missing | Quote cards |

---

## D. End-to-end journey findings

### Livestock owner
- **GUIDED (local):** complete and genuinely pleasant. Request (2 steps) → matches → property → simulated acceptance (honestly labelled: "for this demo John has already said yes") → workspace with progress spine → negotiate 3 terms with accept/counter → review → RFT sent → 2 quotes → chat-then-decide transport room → booked → workspace flips to Complete → Live Agreement with payment schedule derived from the actual agreed terms/dates, transport stepper, 112-day countdown → reset works. Refresh-safe. **This is the product story, working.**
- **PROD:** the real path exists behind sign-in (request → matches → workspace → RFT → settlement record) — verified 11 June with two accounts; not re-tested today to avoid writing to production.
- **Gaps:** movement can never progress past "Booked" in guided; the seeded chat/backstory contradicts the user's own request (chat says "120 head… truck at Dubbo" while my request was 85 sheep from Orange); "you proposed → Accept" makes the user silently play both sides.

### Property owner
- **GUIDED:** effectively absent. "I HAVE FEED — List my property" on the homepage routes to `/landowner/requests/1023` — a mock inbound-request notification for James's request. There is no listing creation, no property management, no landowner workspace view. Accept Discussion drops you into the same shared (single-user) workspace.
- **PROD:** real journey exists (create listing w/ photos + geocode, requests board, offer paddock, workspace mirror) — the June verification covered it.

### Transporter
- **GUIDED:** no transporter journey. "I TRANSPORT — Find transport jobs" routes to the *owner's* quotes page. A transporter can be role-played via the chat's "act as" switcher, but can't see a job board, quote, or update status.
- **PROD:** real journey exists — job board (RLS-walled from agistment pricing), accept, strict status progression writing `transport_status_events`, milestone check-ins while in transit. Needs a fresh-account confirmation run (flagged in SPEC_DRIFT as pending James).

### Platform administrator
- **Does not exist in any lane.** No user management, verification queue, dispute tools, listings moderation, payments oversight, or audit views. Operating the beta means using the Supabase dashboard directly. Acceptable for a private beta; must be acknowledged.

---

## E. Critical defects (severity + dependency order)

1. **The deployed product contradicts its own homepage.** Prod homepage sells the guided journey; every CTA destination is a sign-in wall or 404. Anyone James shares the URL with today hits a dead end within one click. *Fix = deploy the current branch (defect 3 first).* — Evidence: `curl` route map, this audit.
2. **The canonical UX has no real second party.** All guided counterparties are hardcoded; no data a real landowner or transporter could act on. The venture cannot run one real transaction in its canonical UX. *This is the core-loop work.*
3. **Two divergent demo-reset implementations** (`main`'s `runDemoReset` + button UI vs branch's `resetPaddockmeDemoState` + `/account` button). Merging without reconciliation ships two reset paths, one of which misses the demo chat wipe. *Blocks the merge that fixes defect 1.*
4. **Guided register can silently "succeed" without creating an account** (fallback `router.push` when Supabase unconfigured or — worse UX — user believes a password now exists). Tested locally. On a misconfigured deploy this becomes fake registration in production.
5. **Transport status is a dead-end state machine** in the guided lane: `TransportStatus` defines 4 states; nothing can ever advance past `booked`; the Live Agreement stepper is permanently stuck. Users will ask "how do I say it's delivered?" and there is no answer.
6. **State-contradiction: `/transport/quotes/1023` ignores workflow state.** After a full reset (no request, no agreement), it still declares "Transport RFT Sent" and lets you *Accept Quote* — creating `transportArranged: true` on a deal that was never agreed. Tested.
7. **Seeded chat backstory contradicts live data** (120 head/Dubbo/cattle ramp vs the user's actual mob) — the exact "interface says one thing, data says another" failure the product exists to prevent.
8. **Local dev is invisibly broken:** `.env.local` (from `vercel env pull`, 14 Jun) has empty strings for every var incl. Supabase URL/anon key. Auth, chat, and DB paths silently degrade with zero console errors. Any AI/dev session since mid-June has been testing demo fallbacks while believing it tested wiring.
9. **Leaked Google Maps API key:** present in git history since May and *still present at HEAD* in `docs/BUG_SCAN_2026-06-08.md`; repo is on GitHub. Unrotated. (Billing/quota abuse risk; restrict + rotate.)
10. **`profiles` RLS is world-readable including `phone` and `abn`** (`using (true)`, no role restriction — `20260516120100_rls_policies.sql:24-27`). Anyone with the public anon key can enumerate every user's phone number and ABN on the production database. Privacy defect; also see §G.
11. **`demo_chat_messages` is world-writable/deletable with the anon key on the production DB** (by design, but it shares the prod database: spam/abuse surface and a public bucket). Acceptable short-term if acknowledged and rate-limited/purged; must not outlive the demo lane.

---

## F. Product and UX gaps (highest impact first)

1. **Role dead-ends on the homepage:** two of the three "I am…" doors lead to the wrong persona's screens. A landowner or transporter visitor concludes the product isn't for them. Until real journeys exist, these CTAs should set expectation honestly ("watch the walkthrough as John/Wayne") rather than mislabel.
2. **One-browser negotiation blurs who you are.** "You proposed $12.50 / Accept" — the user accepts their own offer. The act-as switcher exists in chat but not in negotiation; there's no explicit "you are now acting as John" moment, so the demo's central trick is never explained.
3. **No path to completion of the *move*.** The loop ends at "transport booked"; delivery confirmation, "stock are on the paddock", and end-of-agistment closure are unreachable, so the agreement's natural end state (and the payment moment) never demonstrates.
4. **Fake signals that will erode trust with real farmers:** "3 online" presence, star ratings (4.8/4.9), "NVD Accredited / Fully Insured" badges — all invented. Fine in an obvious demo; fatal ambiguity the moment real users are invited. The only "Demo mode" label in the app is on `/account`.
5. **Nav hardcodes deal #1023** (Requests → `/requests/matches`, Workspaces → `/workspaces/1023`, Active Agreements → `/workspaces/1023/review`) — coherent for the single-deal demo, meaningless beyond it.
6. Stale README/docs promise routes and demos the live URL doesn't serve — anyone doing diligence against the repo will find the gap in minutes.
7. Mobile: guided screens hold up at 390px with no horizontal overflow (checked programmatically on key screens) — genuinely good.

---

## G. Technical and security gaps

| Area | Finding | Risk |
|---|---|---|
| Secrets | Maps key in git history + at HEAD (§E9). `.env.local` correctly gitignored; service-role key only in local env + Vercel | Quota abuse; rotate + restrict referrers |
| RLS | Pricing wall intact (agreements unreadable by carriers; quotes exclude landowner) — good. `profiles.phone/abn` world-readable (§E10). Demo chat table world-writable on prod DB (§E11) | PII enumeration; spam |
| API auth | `api/payments/transport/checkout` has **no auth check** — anyone can create checkout sessions for any job/quote id. Settlement route correctly authenticates + authorizes parties | Low-value abuse now (test mode), must fix before live payments |
| Error handling | Guided lane swallows failures silently everywhere (`catch {}`): chat, register, storage. No user-visible error states, no logging | Silent data loss (observed: chat message vanished) |
| Observability | No error tracking, no analytics, no uptime checks. `console` clean, which is itself the problem — failures are invisible | Can't run a beta blind |
| Realtime | Real loop uses 5s polling (spec says Supabase Realtime); demo chat uses Realtime properly | Cost/latency debt, not a blocker |
| Repository boundary | Several components call Supabase directly (logged in SPEC_DRIFT §4.2) | Debt, not a blocker |
| Tests | 12-route Playwright text smoke (passes); legacy demo scripts retired; payments smoke exists. No two-party flow test, no RLS test | Regressions invisible in exactly the risky places |
| Build | `typecheck` ✅ `next build` ✅ (35 routes, both trees compile). Windows dev fine; repo-root junk (`tsconfig.tsbuildinfo`, `scan-results.json`, stray logs, `test-results/`) untracked clutter | None |
| TypeScript | Strict enough; generated DB types current (incl. `demo_chat_messages`) | — |
| Accessibility | Guided components use labels/ids (`pm-field-*`); not formally audited | Post-MVP pass |

---

## H. Specification drift register

`SPEC_DRIFT.md` already documents the legacy-lane drift honestly (section names, RFT naming, missing tracking route, maps key, boundary violations). The items below are the **meaningful drift it does not capture**:

| # | Intended (source) | Actual | Evidence | Impact | Resolution |
|---|---|---|---|---|---|
| D1 | Spec v1.2 §4.2: "Single persistence layer: Supabase. Demo mode is retired. Every business object lives in the production database." | The *canonical* guided lane keeps every business object in localStorage; personas hardcoded | `paddockmeWorkflow.tsx`, `paddockmeDemoData.ts` | The spec's architecture section and its design-system section point at opposite lanes; every future agent brief inherits this contradiction | Amend spec v1.3: name the guided lane's Supabase wiring as the active migration, with an explicit table of which screens are database-native yet |
| D2 | Spec §4.3 "no demo personas or fake seed data in production paths" | James/John/Wayne + Green Hills + fake ratings/badges ARE the canonical path | same | As above; also trust risk §F4 | Same as D1 + label demo surfaces in-UI |
| D3 | README: "Live demo: paddockme-oz51.vercel.app" + guided route spine | Live URL serves neither the guided spine (gated/404) nor labels itself as sign-in-only | curl route map | Anyone following the README hits dead ends | Deploy current branch; add "what the live URL shows" note |
| D4 | `docs/CURRENT_PRODUCT_AUDIT.md` presents itself as "current inventory" (README links it as such) | Describes the 23 May Dale/Brett/Wayne product; that world was deleted in June | file date + content | Misleads any new collaborator/AI | Replace with this audit or mark ARCHIVED |
| D5 | Spec §5 loop steps 8–10 (tracking → completed → settlement) | Guided lane ends at "booked"; no completion, no settlement moment | `paddockmeWorkflow.tsx` (no transition past booked) | Loop feels complete only up to booking | Core-loop work (§J) |
| D6 | Complete-state spec: review loop must not re-offer acceptance | **Implemented correctly** on current branch (re-review shows "Agreement in place") | tested | — | None — drift *closed*, but only on the unmerged branch |
| D7 | Handoff: "auth first, then Supabase-backed workflow provider" | Auth wired 7 Jul but optional-fallback (silently proceeds without account) | `RegisterCard.tsx:64` | Fake registrations possible | Make auth required on the beta path once deployed |
| D8 | Spec §6.15 public Driver Map pillar | Absent both lanes; middleware gates all `/transport*` on prod | middleware | Recruitment pillar missing | Defer, keep in spec as post-MVP |

---

## I. Recommended MVP scope

**Product decision this audit forces:** the fastest credible MVP is **the real loop wearing the guided UX** — exactly what the current branch name (`private-beta-real-loop`) already implies. Neither lane alone is the MVP: the guided lane can't host a real transaction; the production lane's UX is retired.

**In scope for the first credible release:**
1. Public guided **walkthrough** at the live URL (what I tested today), explicitly framed as "see how it works" — it is the sales asset.
2. **Real private-beta loop** for invited users in the guided UX: real request → real matched paddock (seeded honestly from a real listing, even if only 1–3 real properties) → two-party agreement (Supabase workflow state keyed to real workspace ids, replacing localStorage) → RFT → one real transporter quoting → booking → status progression to delivered → agreement active → "settle directly" record.
3. Movement completion + delivery confirmation (unlocks the loop's end state that's currently unreachable).
4. Auth required for the beta path; walkthrough stays auth-free.
5. Privacy fix (profiles PII), key rotation, honest labels on all demo surfaces.

**Explicitly deferred:** live Stripe payouts, driver map pillar, admin console (Supabase dashboard is the admin for beta), realtime everywhere, public profiles/ratings, document vault/compliance records, offline milestone queueing, feed marketplace (parked per spec), Docker/VPS.

---

## J. Build-to-launch plan

### Phase 0 — Immediate blockers (days)
| # | Task | Files/systems | Depends | Acceptance | Risk | Who |
|---|---|---|---|---|---|---|
| 0.1 | Reconcile the two demo-reset implementations (keep the branch's `resetPaddockmeDemoState`, port main's inline end-of-flow button UX), merge `main` into `codex/private-beta-real-loop`, run `npm run check`, merge to `main`, push → Vercel deploys | `src/lib/demoReset.ts`, main's `DemoResetButton/DemoResetAction`, middleware | — | Live URL walks all 12 guided screens signed-out; 12/12 e2e pass against prod | Low (build already green) | **Claude** end-to-end; James approves the merge to main |
| 0.2 | Verify/apply `20260702133000_demo_workspace_chat` on prod Supabase; confirm a chat message posted on the live site survives reload | Supabase SQL editor | 0.1 | Message persists across two browsers | Low | **James** (dashboard) or Claude via MCP with James watching |
| 0.3 | Repair `.env.local` (real dev values or `vercel env pull` from an env that has them); add a visible dev-mode banner when Supabase is unconfigured instead of silent fallback | `.env.local`, `supabase/env.ts` consumers | — | Local register actually hits Supabase; misconfig is loud | Low | **James** (keys) + Claude (banner) |
| 0.4 | Rotate the Google Maps key in Google Cloud; add referrer restrictions; delete the key string from `docs/BUG_SCAN_2026-06-08.md` | Google Cloud console, one doc file | — | Old key dead; new key env-only | Low | **James** (console) + Claude (doc edit) |
| 0.5 | Fix `profiles` RLS: drop world-read; expose a safe public view (name, roles, rating, verified flags) and keep phone/abn owner-only | new migration | — | Anon probe of phone/abn returns 0 rows; app still renders names | Medium (touch prod policies carefully) | **Claude** writes migration; James applies |

### Phase 1 — Core-loop completion (1–2 weeks)
| # | Task | Files/systems | Depends | Acceptance | Risk | Who |
|---|---|---|---|---|---|---|
| 1.1 | Design the guided↔real state bridge: replace `paddockmeWorkflow` localStorage persistence with a Supabase `guided_workspaces` (or reuse `agreements`) record per real workspace id, keyed to auth users; keep localStorage only for the signed-out walkthrough | `paddockmeWorkflow.tsx`, new migration, repositories | 0.1–0.3 | Two browsers signed in as two users see the same negotiation state mirror | **High — this is the product's hardest remaining problem; do it as one focused brief** | **Claude** (design + build); Codex suited to the mechanical provider refactor after the design is fixed |
| 1.2 | Real matches: guided matches page reads live paddocks (reuse `serverPaddocks` scoring) with honest empty state; property page renders a real listing | `requests/matches/page.tsx`, `properties/[slug]` | 1.1 | A real listing created on prod appears as a match | Medium | Claude/Codex |
| 1.3 | Real transport lane: guided quotes page lists real `transport_quotes` for the RFT; transporter gets a minimal guided job view (reuse legacy board logic under pm-* skin); status progression through delivered writes `transport_status_events` and drives the Live Agreement stepper | `transport/quotes`, `transport/rooms`, legacy `transport/jobs` logic | 1.1 | One real quote → accept → carrier advances to delivered → owner's stepper moves | Medium | Claude |
| 1.4 | Movement completion + agreement-active closure: delivery confirmation flips agreement to active; "settle directly" record opens (reuse `agistment-settlement` route) | live page, settlement API | 1.3 | Loop reaches step 10 with an auditable trail | Low | Claude |
| 1.5 | Kill contradiction bugs meanwhile: quotes page honours `transportRequestSent`; seeded chat derives from live request data; auth required on beta path | guided pages | 0.1 | Reset → quotes page shows "no RFT yet"; chat matches the mob | Low | **Codex-suited brief** (mechanical, well-scoped) |

### Phase 2 — Deployment & external testing (days, overlaps 1)
- Add a two-party Playwright test (two contexts negotiating one workspace) and an anon RLS probe test (phone/abn must 0-row). Claude.
- Error tracking (Sentry free tier) + Vercel analytics. Claude; James creates the Sentry project.
- Seed prod honestly: 2–3 real properties (James's network), 1 real transporter profile. **James.**
- Beta invite copy + "this is a beta / payments settle directly" framing. James + Claude.

### Phase 3 — First-user feedback
- Run 3–5 real matches with real farmers (James's contacts; `docs/CUSTOMER_VALIDATION_GUIDE.md` already exists and is good).
- Watch where the loop stalls; fix the top 3 stalls before widening.

### Phase 4 — Post-MVP
- Stripe Connect go-live (config-only by design), driver map pillar, admin console, realtime migration, public profiles/ratings, compliance records (NVD/PIC/vaccination uploads), disputes flow per the playbook.

**Specialists required (flagged, not optional):** Australian legal review of agistment agreement terms, platform liability, and refund/dispute policy before money moves; insurance advice (platform + carrier verification); livestock movement compliance (NVD/PIC/eNVD integration rules per state) before claiming any compliance feature. None of these block the private beta if the product plainly states it does not yet verify credentials.

---

## K. First action

**Merge `codex/private-beta-real-loop` into `main` and deploy, after reconciling the demo-reset duplication.** (Task 0.1 above.)

Exactly:
1. On branch `codex/private-beta-real-loop`: `git merge main` — the only conflicts will be the reset feature (`src/lib/demoReset.ts` vs main's `runDemoReset` + `DemoResetButton`/`DemoResetAction` components and their mount points in the guided end-of-flow screens and app shell).
2. Resolve by keeping this branch's `resetPaddockmeDemoState()` (it also wipes the demo chat thread) and re-pointing main's two button components at it; keep the inline end-of-workflow reset placement from PR #28 (it's the better UX — the branch's reset hides on `/account`).
3. `npm run check` (typecheck + build + 12 e2e) must stay green.
4. Merge to `main`, push. Vercel auto-deploys.
5. Verify on https://paddockme-oz51.vercel.app: signed-out walk `/` → `/requests/new` → … → `/workspaces/1023/live` → reset. Check the chat message persists (this smokes out the unapplied demo-chat migration — if it vanishes, apply `20260702133000` in the Supabase SQL editor and re-test).

**Why this first:** it is the only single action that turns the venture's best asset — the guided loop that already works — into the shareable, stable URL James needs for farmers, transporters, and partners *this week*, and every Phase 1 task builds on the merged line. Claude can do all of it except the final "merge to main" approval and the Supabase dashboard check, which are James's.

---

*Audit artefacts: this file. No code, data, or production systems were modified. Local build output written to a scratch dir and removed. The one production write considered (posting a test chat row) was not performed.*
