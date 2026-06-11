# PaddockME — Master Build Specification
**Version:** 1.1 · June 2026 — **Demo mode retired by owner decision. Real operation mode only.**
**Owner:** James Coleman
**Live preview:** https://paddockme-oz51.vercel.app/
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres, Auth, Storage, Realtime) · Vercel
---
## 0. How to use this document (READ FIRST, EVERY SESSION)
This is the **canonical specification** for PaddockME. It outranks any previous brief, any code comment, and any pattern you find in the existing codebase. If the code disagrees with this spec, **the code is wrong** — but do not "fix" anything outside the scope of your current task brief. Instead, log the discrepancy in `SPEC_DRIFT.md` at the repo root (create it if missing) and continue.
**Session protocol:**
1. Read this entire spec before writing any code.
2. Read your task brief for this session. Your brief defines *what* you do; this spec defines *what the result must look and behave like*.
3. Before touching any data flow, locate and read the repository/data-access layer (likely `src/lib/repositories/` or `src/lib/data/`).
4. One concern per commit. Run `typecheck` and `build` between commits. Never commit a broken build.
5. If a task brief asks you to do something that violates this spec, stop and flag it instead of complying.
**First-session task (if Appendix A is empty):** audit the codebase and fill in Appendix A (route map and design tokens) from what actually exists, then commit it. From then on Appendix A is canonical.
---
## 1. What PaddockME is
PaddockME is an Australian agistment marketplace and coordination engine. It connects three personas:
| Persona | Needs |
|---|---|
| **Livestock owner** | Feed/grazing for stock; transport to get them there |
| **Landowner** | To monetise spare grazing capacity safely |
| **Transport carrier** | Paid livestock movement jobs, especially backloads |
> **Note on legacy names:** earlier builds used demo personas "Dale" (owner), "Brett" (landowner) and "Wayne" (carrier). These were demo-mode artefacts and are **retired**. If you find them in code, copy, seed data, component names, or test fixtures, that is spec drift — log it in `SPEC_DRIFT.md` and remove them when your task brief covers that area. Real authenticated users only.
A **fourth pillar** exists: the **Driver Map** — a *public, logged-out* recruitment surface where any qualified livestock/bee carrier in Australia is discoverable and recruitable, not just registered users.
**Parked (long-term vision only, do NOT build):** a feed commodities marketplace (hay, silage, fodder). If it appears anywhere in UI, it is a "coming soon — join the waitlist" card only. Never a live signup path or feature.
---
## 2. Product DNA — the four sentences
Every screen, every component, every copy decision is tested against these:
1. **"Reduce agricultural coordination friction."**
2. **"PaddockME is reducing hidden coordination costs in Australian agriculture."**
3. **"Coordination friction is expensive."**
4. **"You only care about successful matches."**
**Practical translation for you, the coding agent:**
- Every screen must remove a step, never add one. If your change adds a click, a field, or a decision the user didn't have before, justify it or don't do it.
- PaddockME is a *coordination engine*, not a browse-and-hope classifieds site. The UI always pulls the user toward the next action in their flow (request → match → agree → move → done).
- Dead ends are bugs. Every screen must answer: "what does the user do next?" with one visually primary action.
- Simplicity wins ties. When two implementations are equal, choose the one with fewer concepts on screen.
---
## 3. Design system — "Pastoral Zen"
**This is a single, fixed visual language. Do not invent variants.**
- **Display/headings:** Fraunces, italic serif — warmth and character. Headings only.
- **Body/UI:** Outfit, geometric sans — clarity. All body text, labels, buttons.
- **Palette:** sage (primary green), ochre (accent — used in the logo "ME"), terracotta, cream/warm-white backgrounds, bark (dark text), stone (muted text). Exact hex tokens live in Appendix A — treat the tokens in the repo's Tailwind config / CSS variables as canonical and never hardcode new hex values in components.
- **Shape:** soft 16px radius cards, generous whitespace, Apple-level touch targets (min 44px), Airbnb-style card patterns "with agricultural soul."
- **Logo:** "Paddock" in dark + "ME" in ochre.
**Hard design rules:**
- **One colour language.** Status and quality are expressed within the Pastoral Zen palette. Red/amber/green rating bars are NOT approved — they introduce a second colour language and require James's explicit sign-off before appearing anywhere.
- **No new fonts, no new colours, no new radius values, no drop-shadow experiments.** If a component needs something the system doesn't have, flag it; don't improvise.
- **Mobile-first.** Rural users are on phones in paddocks with patchy reception. Every page is designed at 390px first, then scaled up.
- Copy is plain Australian English, farmer-respectful, no startup jargon. "Paddock", "agistment", "stock", "backload" — use the industry's own words.
---
## 4. Architecture rules (non-negotiable)
1. **Supabase is the backend. The Rails question is CLOSED.** Do not propose, scaffold, or reference Rails/Django alternatives.
2. **Single persistence layer: Supabase. Demo mode is retired.** Every business object (profiles, listings, requests, matches, agreements, messages, transport jobs, payments) lives in the production database. All reads/writes go through the repository/data-access layer — never call Supabase directly from components. Any remaining localStorage *business-data* paths are legacy: log them in `SPEC_DRIFT.md` and remove them when your task brief covers that area. (localStorage remains acceptable only for trivial UI state — e.g. a collapsed panel — never for business data.)
3. **No demo personas or fake seed data in production paths.** Test data belongs in test environments only. The app must behave correctly for a brand-new real user with an empty account.
4. **RLS is the privacy model.** Access control is enforced in the database, not just the UI. Key wall: **carriers must never see private agistment pricing.** Never weaken or bypass an RLS policy; if one blocks you, flag it.
5. **Core tables (do not rename, do not restructure without a migration brief):** `profiles`, `paddocks`, `agistment_requests`, `matches`, `agreements`, `agreement_sections`, `agreement_messages`, `transport_jobs`, `transport_status_events`, `transport_quotes`, plus artefact tables.
6. **Agreements always have exactly 6 sections:** stock type, duration, rate, start date, transport, special conditions.
7. **Transport status sequence is fixed:** `accepted → loading → in_transit → arrived → completed`, each change writing a `transport_status_events` row. In-transit progress is additionally tracked via **milestones** (see §6.12) — milestone passes are also events, never UI-only state.
8. **Terminology:** the action that creates a transport job is called an **RFT — Request for Transport** — in UI copy, code naming, and documentation. Use it consistently.
9. **Roles are stackable intent, not permanent account types.** A profile can be owner AND landowner. Never build logic that assumes one role per account.
10. **Payments are part of the core loop.** The agreement → payment flow must exist end to end. Stripe Connect is the confirmed provider but **the Stripe account is not yet set up** — build the full payment flow against Stripe test mode behind a single provider interface, so going live is a credentials/config change, not a rebuild. The UI never pretends money moved when it didn't: until live, the payment step shows a clear "payments launching soon — you'll settle directly for now" state.
11. Google Maps is the confirmed map/geocoding provider (Places Autocomplete, Static Maps). API keys come from environment variables only — never hardcode keys (a hardcoded demo key was previously found in `PaddockMap.tsx`; that class of mistake must not recur).
---
## 5. The core loop (the spine of the entire product)
Everything in PaddockME serves this ten-step loop, run by **real authenticated users on the production database**. Page specs in Section 6 are ordered to follow it.
1. A livestock owner creates an **agistment request**
2. A landowner creates a **paddock listing**
3. The owner views **matches** and selects a paddock
4. An **agreement** is created with its 6 sections
5. Both parties **resolve sections** in the agreement workspace (chat + section state toggles)
6. The owner pushes out an **RFT (Request for Transport)** from the workspace
7. The job appears on the **carrier job board**; a carrier accepts
8. The movement runs with **live transport tracking** visible to both farmers — milestone timeline always, live map position when signal allows (§6.12)
9. Statuses progress to **completed**, with a full event trail
10. **Final payment settles** (Stripe Connect flow; test mode until the account is live — §6.13)
**Loop integrity test (run mentally after every change):** can a brand-new real user, starting from an empty account, complete steps 1–10 without confusion, without dead ends, and without anyone explaining anything to them? The flow must feel **seamless, painless, and well guided** — every step ends by pointing clearly at the next one. If your change breaks or muddies any step, it is wrong regardless of what it improves locally.
---
## 6. Page-by-page specification (in flow order)
Each page below has: **Purpose** (one sentence — if a page can't state its purpose in one sentence, it's two pages), **Must**, **Must not**, and **Done when**.
### 6.1 Landing page (public, logged out)
**Purpose:** Make a visitor understand in five seconds that PaddockME matches stock with feed and handles the move — then route them into role-first signup.
**Must:**
- Hero stating the value in plain words (coordination, matches, transport — drawn from the DNA sentences)
- Visible **Log in** link at all times (this went missing once before; it is a spec requirement now)
- Primary CTA into onboarding
- Entry point to the public **Driver Map**
- Pastoral Zen aesthetic, mobile-first
**Must not:** feature lists longer than 3–4 items; the feed marketplace as anything but a waitlist mention; any signup form on this page itself.
**Done when:** a farmer on a phone understands what this is and where to tap within one screenful.
### 6.2 Onboarding (role-first)
**Purpose:** Let a new user self-identify before they see a form, so the form is short and relevant.
**Must:**
- Step 1: role selection cards — *I have animals* (livestock owner), *I have land* (landowner), *I move livestock* (transport provider). Plus a **disabled "I have feed to sell — coming soon" waitlist card.**
- Step 2: a tailored, minimal signup form for the chosen role. Only fields needed to create a useful profile — everything else is collected later, in context.
- Roles stored as stackable intent on the profile; user can add roles later from Profile.
- Supabase Auth via `@supabase/ssr` patterns.
**Must not:** one long universal form; account-first flow (form before role); more than ~5 fields per role at signup.
**Done when:** each role reaches a working dashboard in under a minute, and a profile row exists with the correct role intent.
### 6.3 Home / dashboard (per-role, logged in)
**Purpose:** Show the user their current position in the loop and the single next action.
**Must:**
- Greeting header; content tailored to active role
- The user's live items (requests / listings / jobs) with status, ordered by what needs attention
- One visually primary next-step CTA (e.g. an owner with no request → "Create a request"; an owner with an in-transit movement → "Track your stock"; a pending agreement → "Resolve agreement")
**Must not:** generic browse feeds that bury the user's own active loop items; duplicate navigation paths to the same place.
**Done when:** a returning user can see in one glance what's waiting on them.
### 6.4 Create agistment request (livestock owner)
**Purpose:** Capture a stock owner's need in the minimum fields required to produce good matches.
**Must:** stock type, head count, duration window, region/location (Google Places Autocomplete with automatic region derivation; coordinates stored via PostGIS), and any deal-breaker requirements. Clear submission confirmation that immediately routes to matches (or "we'll notify you" state if none).
**Must not:** optional nice-to-have fields at creation time; free-text-only location entry.
**Done when:** request persists in Supabase, and matching can run on it.
### 6.5 Create paddock listing (landowner)
**Purpose:** Let a landowner list grazing capacity quickly and accurately.
**Must:**
- Step-by-step wizard feel (details → location → capacity/water/yards → pricing → publish), short steps
- Google Places address with geocoding; real Static Maps thumbnail for geocoded listings, branded placeholder for demo/fake addresses
- Numeric fields free of the leading-zero default bug (Available Acres must start empty, not "0")
- Listing card preview matching exactly how it renders in search
**Must not:** the listing form and the rendered card disagreeing in fields or order.
**Done when:** the listing persists in Supabase, geocodes, shows a real map thumbnail, and appears in owners' matches.
### 6.6 Search / explore map
**Purpose:** Let users discover paddocks (and context) spatially without drowning in layers.
**Must:**
- Map view with price pins, filter chips, bottom-sheet listing peek card (Airbnb pattern)
- **Collapsed filter panel by default** — compact state, expand on demand
- Layer behaviour governed by the **Map Layers Reference & Governance doc** (separate document; 18 layers, 4 persona default sets). Governing rule: *"a map that shows everything shows nothing"* — persona defaults on, everything else opt-in
- Privacy: precise locations only where the governance doc allows; density as heatmap, individuals as pins only where permitted
**Must not:** new map layers without going through the governance doc's new-layer checklist; exposing carrier or stock locations to logged-out users.
**Done when:** each persona's default map is calm, legible, and answers their primary question.
### 6.7 Listing detail
**Purpose:** Give a stock owner everything needed to choose this paddock, ending in one action.
**Must:** hero image, price, verified badge (when earned), stats grid (acres / water / yards), description, landowner trust card (rating, response indicators — public profile mode), and a single primary CTA: **Request Agistment**.
**Must not:** contact details that let parties route around the platform pre-agreement; competing CTAs.
**Done when:** the page reads top-to-bottom as a decision funnel ending in the CTA.
### 6.8 Matches (livestock owner)
**Purpose:** Present ranked paddock matches for a request and convert the best one into an agreement.
**Must:** match cards consistent with listing cards; expandable paddock cards (inline expand on tap — approved UI pattern); selecting a paddock creates the agreement + its 6 sections and routes straight into the workspace.
**Must not:** a separate "compare" mode in MVP; match scores presented with false precision.
**Done when:** select → agreement with 6 sections exists in Supabase → user lands in the workspace.
### 6.9 Agreement workspace (owner + landowner) — ⚠️ DESIGN-LOCKED
**Purpose:** The platform's core product surface: two parties resolve the 6 agreement sections to a shared, recorded understanding.
**Status: the workspace redesign is parked pending a design discussion with James. Until that produces an approved design, agents make NO layout or interaction changes here. Functional/persistence fixes only.**
**Current contract (maintain, don't redesign):**
- 6 sections (stock type, duration, rate, start date, transport, special conditions), each with a resolution state toggle
- Section-level chat/messages, persisting across refresh (Supabase `agreement_messages`)
- Summary comments area with a **"Done" button** beneath the textarea (approved pattern)
- Caution dialogs deep-link to the exact flagged section
- When all sections resolve, the **Push RFT (Request for Transport)** action becomes primary
**Done when:** both parties' actions persist and mirror to the other party correctly; nothing visual has moved.
### 6.10 RFT — Request for Transport (from workspace)
**Purpose:** Convert a resolved agreement into a carrier-visible transport job with no re-entry of data. "RFT" is the product's name for this action — use it in UI copy and code naming.
**Must:** prefill pickup/dropoff from the agreement and listing/request locations; route visualiser (pickup → dropoff) with distance/time/deck stats; on submit, creates a `transport_jobs` row visible to carriers and shows the owner a clear "RFT sent — carriers are being notified" state with what happens next.
**Must not:** asking the owner anything the platform already knows; exposing the agistment rate to the future carrier (RLS wall).
**Done when:** one submission creates a complete, carrier-visible job, and the owner is never left wondering what happens next.
### 6.11 Carrier job board
**Purpose:** Show available livestock movements and let a carrier claim and run a job end to end.
**Must:**
- Available jobs list (route, distance, stock, timing — **no agistment pricing**)
- Accept action; then status progression UI strictly following `loading → in_transit → arrived → completed`, each step writing a `transport_status_events` row
- While `in_transit`, a dead-simple one-tap **milestone check-in** for the carrier ("Passed Goulburn ✓") — big touch targets, works one-handed in a truck cab, queues offline and syncs when signal returns
- Both ends of the agreement see status and milestone updates in real time (Supabase Realtime)
**Must not:** skipping or reordering statuses; carrier access to agreement chat or pricing.
**Done when:** a carrier can take a job from open to completed and the full event trail (statuses + milestones) exists in Supabase.
### 6.12 Transport tracking (owner + landowner view)
**Purpose:** Keep both farmers aware of exactly where the truck is, from loading to arrival — calmly, at a glance, even with patchy rural reception.
**Must:**
- **Milestone timeline is the primary view:** the route is broken into named milestones (e.g. Departed → ¼ way → Halfway → ¾ way → Arriving → Delivered, plus recognisable towns/landmarks where the route allows). Each milestone **lights up green** as the truck passes it; the current leg is visually active; remaining legs are muted. Pastoral Zen palette — the "green" is the system's sage/positive token, not a new colour.
- **Live map position as enhancement, not dependency:** when the carrier's device has signal, show the truck's position on the route map. When it doesn't, the milestone timeline alone must tell the full story — the page never looks broken because GPS dropped out.
- Milestones derive from the route at RFT acceptance and are stored as data (rows/events), not invented in the UI; each pass writes an event so the trail is auditable.
- ETA indication that degrades honestly (e.g. "passed Halfway 25 min ago" rather than a fake precise ETA when signal is stale).
- Both parties see the same tracking surface; accessible from dashboard and from the agreement workspace.
- Notifications (in-app at minimum) on key milestones: loaded, halfway, arriving, delivered.
**Must not:** a tracking page that is blank or spinner-locked without live GPS; precise truck location exposed to anyone outside the two agreement parties and the carrier; any second colour language.
**Done when:** a farmer can open the app at any moment of the movement and know, within five seconds, where their stock is and what happens next — regardless of mobile coverage on the route.
### 6.13 Payment & settlement
**Purpose:** Close the loop — the agreement's money side settles as smoothly as its logistics side.
**Status: Stripe Connect is the confirmed provider, but the Stripe account is NOT yet set up.** Build the complete flow against Stripe **test mode** behind one provider interface so go-live is configuration, not construction.
**Must:**
- Payment step triggered at the natural loop point: transport `completed` (and/or agreement start, per the agreed rate terms in section 3 of the agreement)
- A payment summary screen both parties can read in plain words: what's owed, to whom, for what, when — drawn from the agreement's rate section, never re-typed
- Until Stripe is live: an honest **"Online payments launching soon — settle directly for now"** state that still records the amount owed and lets parties mark it settled, so the record stays complete
- When Stripe is live: Stripe Connect charge → platform take-rate → payout, with receipts to both parties
- Payment state lives in the database with an event trail, like everything else
**Must not:** any UI implying money has moved when it hasn't; storing card details anywhere in our database; hardcoded fee percentages scattered through components (one config source).
**Done when:** the loop ends with both parties seeing a settled, recorded outcome — in test mode today, live mode after a config change.
### 6.14 Profile (owner mode vs public mode)
**Purpose:** One profile, two faces — full control for the owner, trust signals for everyone else.
**Must:**
- **Owner mode:** stats, verification status, role management (add/stack roles), menu to listings / agreements / transport / messages / payments
- **Public mode:** trust and verification badges, ratings, response behaviour — and nothing private
- The two modes are explicitly distinct render paths (approved UI pattern from the profile brief)
**Must not:** leaking owner-only data into public mode; quality bars in red/amber/green (see design rules).
**Done when:** viewing your own profile vs someone else's are obviously different experiences with zero private leakage.
### 6.15 Driver Map (public pillar)
**Purpose:** A public, logged-out recruitment surface making every qualified livestock and bee carrier in Australia discoverable.
**Must:** publicly accessible without auth; carriers shown per the map governance doc's privacy rules (no precise live locations — service regions/density); a clear "claim your profile / join PaddockME" recruitment path; works as a standalone shareable URL.
**Must not:** requiring login to view; showing user-generated private data.
**Done when:** a carrier who has never heard of PaddockME can find themselves represented (or their region underserved) and sign up in one flow.
---
## 7. Cross-cutting acceptance criteria (every session)
- [ ] Core loop (Section 5) completes end to end on the production (Supabase) data path, as a real authenticated user starting from empty
- [ ] `typecheck` passes, `build` passes
- [ ] No new hex values, fonts, or radius values in components
- [ ] No Supabase calls outside the repository layer
- [ ] No RLS policy weakened; pricing wall intact
- [ ] No new localStorage business-data paths; any legacy ones found are logged in `SPEC_DRIFT.md`
- [ ] No demo personas or fake seed data introduced
- [ ] No UI implies a payment occurred unless it did
- [ ] Mobile (390px) layout checked for every touched page
- [ ] Separate commit per concern, descriptive messages
- [ ] Any spec conflict logged in `SPEC_DRIFT.md`, not silently "fixed"
---
## 8. Open items (do not build without James's sign-off)
| Item | Status |
|---|---|
| Agreement workspace redesign | Parked — needs design discussion first |
| Red/amber/green quality bars | Rejected pending colour-language decision |
| Rain as shaded map areas; layer toggle behaviour | Excluded from current briefs |
| Feed commodities marketplace | Long-term vision; waitlist card only |
| Stripe Connect | **Build now in test mode** (§6.13). Account not yet set up — go-live is config only |
| Demo-mode removal | **Active directive** — strip localStorage business paths + demo personas as task briefs touch those areas |
| Dark mode variant | Idea only |
---
## 9. Related documents (subordinate to this spec)
- `PaddockME-Map-Layers-Reference.md` — map layer catalogue + governance (authoritative for map layers specifically)
- `BUGFIX_BRIEF_listing_and_maps.md` — tactical, may be complete; verify before re-running
- `UI_BRIEF_profile_cards_bars_filters.md` — tactical UI refinements
- White paper (19pp PDF) — vision/strategy; useful for tone and positioning, not a build doc
---
## Appendix A — Codebase ground truth (FILL ON FIRST RUN, THEN CANONICAL)
> Populated 2026-06-11 from commit `46b5e77` during DEMO-RETIRE-01 Phase 0. Keep current.
### A.1 Route map
| Route | Page (spec §) | Exists? | Notes |
|---|---|---|---|
| `/` | Landing (6.1) | Yes | `src/app/page.tsx` + `LandingMarketing.tsx`. Log in link present. Signed-in users redirect to `/agreements`. |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/update-password`, `/auth/callback` | Auth (6.2) | Yes | Supabase Auth via `@supabase/ssr`. |
| `/onboarding` | Onboarding (6.2) | Yes | Role-first flow (`OnboardingClient.tsx`). Writes a localStorage fallback (`paddockme.onboarding`) — removal target, see A.3. |
| `/agreements` | Home / dashboard (6.3) | Yes | Role-aware dashboard incl. "Your agreements" section. `/home` redirects here. |
| `/request/new` | Create agistment request (6.4) | Yes | No Places Autocomplete; region pills; request location stored as a fixed legacy coordinate (drift — see SPEC_DRIFT). |
| `/listings/new` | Create paddock listing (6.5) | Yes | Single form, not a step wizard; region→representative coordinate, no Places geocoding or Static Maps thumbnail (drift). |
| `/listings` | Browse paddocks | Yes | Not explicitly in spec; closest to 6.6/6.7 funnel entry. |
| `/listings/[id]` | Listing detail (6.7) | Yes | Primary CTA currently "Select paddock"/workspace-open, not "Request Agistment" (copy drift). |
| `/listings/[id]/edit`, `/listings/mine` | Landowner listing management | Yes | Not in spec; supports 6.5 lifecycle. |
| `/matches` | Matches (6.8) | Yes | Scores live Supabase paddocks; selection routes via listing detail to agreement. |
| `/workspace` | Workspace router | Yes | Redirects signed-in users to most recent agreement workspace. |
| `/workspace/[id]` | Agreement workspace (6.9) | Yes | DESIGN-LOCKED. Sections + chat persist in Supabase; live polling sync. Section keys differ from spec list (drift). |
| `/workspace/[id]/snapshot` | Workspace snapshot | Yes | Not in spec. |
| (action in workspace) | RFT (6.10) | Partial | "Request transport" button in workspace creates `transport_jobs` row prefilled from agreement. No dedicated route, no route visualiser, RFT naming not used in UI copy (drift). |
| `/transport/jobs` | Carrier job board (6.11) | Yes | Real board: available jobs (no agistment pricing) + accept + own jobs; route map. |
| `/transport/[id]` | Transport room (6.11 partial / 6.12 precursor) | Yes | Real 3-party room: status stepper (`accepted→loading→in_transit→arrived→completed` writing `transport_status_events`), status history, chat. Milestones (6.12) absent. |
| _tracking route_ | Transport tracking (6.12) | **Absent** | FUTURE brief. Today: status history + polling in `/transport/[id]`; no milestone timeline, no live truck position. |
| `/payments/transport/{success,cancel,sandbox}` + `/api/payments/transport/checkout` + `/api/webhooks/stripe` | Payment & settlement (6.13) | Partial | Stripe test-mode checkout scaffolding + payments ledger exist for transport; NOT triggered at loop completion; no agreement settlement summary. FUTURE brief. |
| `/profile` | Profile (6.14) | Partial | Owner view exists; no distinct public mode; legacy persona switcher present (removal target). |
| _driver map route_ | Driver Map public pillar (6.15) | **Absent** | No public carrier recruitment surface. Note: all `/map` & `/transport*` routes currently require login (middleware). |
| `/map` | Search/explore map (6.6, partial) | Yes | Live paddock pins + user's agreement/transport routes (`LiveMap`). No price pins/filter chips/bottom sheet/layer governance yet. |
| `/requests` | Landowner-side requests board | Yes | Not in spec; landowner discovery surface ("offer a paddock" → agreement). |
| `/messages` | Messages inbox | Yes | Not in spec; real inbox of agreement threads. |
| `/transport`, `/transport/available`, `/transport/calendar`, `/transport/earnings` | Transport ancillary | Yes | Not in spec. `available`/`calendar`/`earnings` are demo-era or placeholder surfaces (drift/debt). |
| `/runs` | Feed runs (demo) | Yes | Not in spec; demo-era surface (removal/parked — feed marketplace is parked vision). |
| `/landowner` | Demo showcase | Yes | Not in spec; demo-era persona showcase (removal target). |
| `/preview/[kind]` | Demo previews | Yes | Not in spec; demo-era "see how it works" showcases, linked from empty states (removal target per DEMO-RETIRE-01). |
| `/_marketing_disabled` | Disabled marketing variant | Dir exists | Not routable as named; dead weight. |
### A.2 Design tokens
| Token | Value | Source file |
|---|---|---|
| sage | `#5b8c5a` (sage-dark `#3d6b3c`, sage-deep `#2c5030`, sage-mist `#e7f0e6`, sage-glow `#d0e8cf`) | `src/app/globals.css` `@theme` |
| ochre | `#d4a853` (ochre-light `#f2e4c1`) | `src/app/globals.css` |
| terracotta | `#c47b5a` as `--color-terra` (terra-light `#f0ddd3`) | `src/app/globals.css` |
| cream | `#faf8f3` (warm-white `#fdfcf9`, wheat `#f5ecd7`) | `src/app/globals.css` |
| bark | `#3f3328` | `src/app/globals.css` |
| stone | `#6d6257` (mist `#d9d4c8`) | `src/app/globals.css` |
| radius | `--radius: 4px`, `--radius-lg: 6px`, `--radius-xl: 8px`, `--radius-2xl: 10px` — **spec expects 16px soft cards; drift logged** | `src/app/globals.css` |
| (status) | match `#2f7d47`/`#e6f5eb`, amber `#8a5a12`/`#f7ead0` | `src/app/globals.css` |
| (⚠ unapproved) | rating-low `#d6402c`, rating-mid `#f5c43c`, rating-high `#16a34a` — literal red/amber/green rating tokens exist and are used by paddock signal tiles; §3 says NOT approved. Drift logged. | `src/app/globals.css` |
### A.3 Repository layer
| Concern | File | Notes |
|---|---|---|
| Data access entry (browser) | `src/lib/data/repositories.ts` | "use client" repo: profiles, requests, paddocks, matches, agreements, sections, messages, transport jobs/status, live-state polling. Supabase-only for authenticated users; legacy demo fallbacks for signed-out (unreachable since auth gate). |
| Data access entry (server) | `src/lib/data/serverPaddocks.ts` | Server-component reads: listings, requests, agreement summaries/routes, transport board, profiles-by-id. |
| Legacy demo store (REMOVE) | `src/lib/prototypeStore.ts` | localStorage business data: `paddockme.prototype.*` (listings, requests, agreements, transport jobs, timeline). |
| Legacy demo persistence helper (REMOVE) | `src/lib/data/prototypePersistence.ts` | Demo-state plumbing. |
| Legacy seed data (REMOVE) | `src/lib/dummyData.ts` | Personas Dale/Brett/Wayne + seed agreements/requests/transport/messages + domain TYPES (types must be extracted before deletion). |
| localStorage business paths found (REMOVE) | `src/lib/prototypeStore.ts` (all demo business objects) · `WorkspaceClient.tsx` `paddockme.workspace.<id>` (demo branch: messages/sections/lifecycle/artefacts) · `TransportClient.tsx` `paddockme.transport.<id>` (demo branch: confirmations/quotes/messages/artefacts) · `OnboardingClient.tsx` + `request/new/page.tsx` `paddockme.onboarding` (profile snapshot fallback/prefill) · persona keys `paddockme.profile.persona`, `paddockme.agreements.persona` + cookie `paddockme_persona` (demo mode switch) in `AgreementsClient`, `ProfileClient`, `WorkspaceClient`, `RequestsClient`, `ListingsClient`, `RunsClient`, `TransportJobsClient`, `CapacityClient`, `WhatNeedsYou`, `ActivityFeed`, `SignOutButton` | |
| localStorage UI-state (PERMITTED, kept) | `src/lib/inbox.ts` + `HeaderInboxLink.tsx` (`paddockme.inbox.seen.v1` thread-seen counts) · `ComplianceReadinessPanel.tsx` (checklist ticks) | Judgement call logged in SPEC_DRIFT. |
### A.4 Known debt
- **Google Maps key: NOT resolved.** The previously hardcoded browser key is now centralised in `src/lib/googleMapsKey.ts` (one source, env-var first) but the **hardcoded fallback key string is still committed** and the key has **not been rotated**. Required (James): set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel + `.env.local`, rotate the key in Google Cloud Console (it is in git history — treat as public), then delete the fallback from `googleMapsKey.ts`. Flagged prominently per DEMO-RETIRE-01 A.4.
- Table-name drift: spec §4.5 lists `agreement_messages`; the live table is `messages` (shared by agreement + transport threads via xor constraint). Do not rename without a migration brief.
- Local `next build` cannot run in the agent sandbox (Windows-native SWC binaries); per-commit gate is `tsc --noEmit` locally + Vercel production build per push.
