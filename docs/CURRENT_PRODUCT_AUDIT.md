# PaddockME Current Product Audit

Last updated: 2026-05-23

This is the working inventory of what is currently built in the repo and live product. Use it as the handoff map for sprint planning and AI collaboration.

Live app: https://paddockme-oz51.vercel.app

## Executive Summary

PaddockME is currently a deployed Next.js 16 App Router product with a polished investor landing page, Supabase auth wiring, a generated Supabase database type layer, and a strong clickable prototype layer for the agistment workflow.

The current MVP story is strongest around:

- Dale, a livestock owner, needing feed.
- Brett, a landowner, offering paddocks.
- Wayne, a driver, coordinating the transport leg.
- A shared agreement workspace.
- A separate three-party transport room.
- A production demo path that can be smoke-tested with `npm run verify:pitch`.

The app is not yet a fully database-native marketplace. Several demo surfaces intentionally use seed data plus local prototype state so the investor walkthrough remains reliable even without a signed-in Supabase user.

## Tech Stack

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Styling: Tailwind CSS v4 via `src/app/globals.css`.
- Fonts: Fraunces for display moments, Outfit for app/body UI.
- Icons: `lucide-react`.
- Backend/auth: Supabase client/server helpers in `src/lib/supabase`.
- Deployment: Vercel production deploys from `main`.
- Smoke verification: `scripts/demo-smoke.mjs`.
- Browser click rehearsal: `scripts/demo-click.mjs`.

## Public And Auth Surface

### `/`

Investor-facing landing page at `src/app/page.tsx`.

Built:

- One-scroll investor story.
- Hero headline: "Farmer A and Farmer B agree the terms. Then the driver joins."
- CTA to `/agreements` labelled "Start the agreement".
- Secondary CTA to `/sign-up`.
- Persona cards for Dale, Brett, and Wayne.
- Real demo screenshots from `public/demo/workspace.png`, `public/demo/transport.png`, and `public/demo/requests.png`.
- Roadmap line that names payments as next without claiming it is built.

### `/sign-in`

Supabase-backed sign-in page at `src/app/(auth)/sign-in/page.tsx`.

Built:

- Email/password sign-in.
- Magic-link sign-in.
- Redirect support via `next` query param.
- Link to account creation.
- Mobile-checked layout.

### `/sign-up`

Supabase-backed account creation page at `src/app/(auth)/sign-up/page.tsx`.

Built:

- Full name, email, password form.
- Supabase sign-up call.
- Email confirmation state.
- Redirect into onboarding when possible.
- Link back to sign-in.

### `/onboarding`

Client onboarding wizard at `src/app/(auth)/onboarding/OnboardingClient.tsx`.

Built:

- Four-step role-based onboarding flow.
- Roles: livestock owner, landowner, transport provider.
- Region selection.
- Role-specific details for stock, paddock capacity, or fleet size.
- Local persistence through `paddockme.onboarding`.
- Best-effort Supabase profile write when auth is configured and a user is signed in.

## Authenticated App Shell

The route group under `src/app/(app)` uses `src/components/AppShell.tsx`, `BottomNav.tsx`, header user context, persona switching, and route-aware navigation.

Built app routes:

- `/home`
- `/agreements`
- `/workspace`
- `/workspace/[id]`
- `/workspace/[id]/snapshot`
- `/request/new`
- `/requests`
- `/listings`
- `/listings/new`
- `/listings/[id]`
- `/matches`
- `/map`
- `/messages`
- `/profile`
- `/landowner`
- `/transport`
- `/transport/[id]`
- `/transport/available`
- `/transport/calendar`
- `/transport/earnings`
- `/transport/jobs`
- `/runs`

## Core Demo Workflow

### Agreements Queue: `/agreements`

Built:

- Persona-aware work queue.
- "What needs you" tiles.
- Activity feed.
- Direct path into the Glenbarra agreement workspace.
- Uses seed/prototype state so the demo can be reset and replayed.

### Agreement Workspace: `/workspace/agreement-glenbarra`

Built:

- Two-party agistment workspace for Dale and Brett.
- Role switcher between Farmer A and Farmer B.
- Terms, readiness, transport context, artifacts, chat, lifecycle, and timeline surfaces.
- "Tap to agree" controls that update local prototype state.
- "Open transport room" path into the linked transport workflow.
- "View snapshot" path into a shareable read-only style snapshot.

### Agreement Snapshot: `/workspace/agreement-glenbarra/snapshot`

Built:

- Snapshot view for the agreement state.
- Printable/shareable style surface.
- Part of the pitch route spine.

### Transport Room: `/transport/transport-glenbarra`

Built:

- Three-party transport room for Dale, Brett, and Wayne.
- Role switcher for Farmer A, Farmer B, and Driver.
- Logistics sections with per-role confirmation.
- Quote/rate workflow.
- Farmer B visibility wall for commercial rate details.
- Driver status updates.
- Artefact and chat surfaces.
- Local prototype persistence for room state.

### Messages: `/messages`

Built:

- Persona-aware inbox.
- Agreement and transport conversations.
- Reads local prototype messages so demo interactions appear in the inbox after use.

### Requests: `/requests`

Built:

- Landowner-facing request browser.
- Persona-sensitive "Offer a paddock" flow.
- Paddock picker filtered to the active landowner's listings.
- Demo caveat: switch persona to Brett before showing this route.

### Driver Pipeline: `/runs`

Built:

- Transport-provider view for Wayne/Sharon.
- Pipeline-style transport work surface.
- Points the investor story at driver utilisation and available work.

### Profile: `/profile`

Built:

- Signed-in Supabase profile summary when an authenticated user has a `profiles` row.
- Persona browser.
- Verification/readiness profile surfaces.
- Workspace reset control.
- Shared profile schema across livestock owner, landowner, and transport provider personas.

Current limitation:

- The Supabase profile summary is read-only. The participant records below it still use the current workflow state.

## Request Creation

Route: `src/app/(app)/request/new/page.tsx`.

Built:

- Client-side request form flow.
- Reads onboarding defaults from local storage.
- Requires Supabase user for database insert.
- Creates/updates a profile row as needed.
- Inserts into `agistment_requests` with generated `TablesInsert<"agistment_requests">` typing.
- No broad `as any` workaround in the insert path.

Current limitation:

- This is an MVP insert path, not a full matching engine.

## Transport Capacity

Route: `/transport/available`.

Built:

- Driver capacity posting flow.
- Local prototype persistence.
- Best-effort Supabase dual-write to `transport_capacity` when authenticated/configured.

Current limitation:

- Prototype local state remains the dependable demo source of truth.

## Data Layer

### Supabase Types

Generated type file: `src/lib/types/database.ts`.

Contains:

- `Database`
- `DatabaseWithoutInternals`
- `DefaultSchema`
- `Tables`
- `TablesInsert`
- `TablesUpdate`
- `Enums`
- `CompositeTypes`
- `Constants`

Tables currently represented in generated types:

- `agistment_requests`
- `agreement_artefacts`
- `agreement_status_events`
- `agreements`
- `matches`
- `messages`
- `paddocks`
- `profiles`
- `transport_artefacts`
- `transport_capacity`
- `transport_jobs`
- `transport_quotes`
- `transport_status_events`

### Supabase Helpers

Built:

- Browser client in `src/lib/supabase/client.ts`.
- Server client in `src/lib/supabase/server.ts`.
- Session middleware in `src/lib/supabase/middleware.ts`.
- Auth callback route in `src/app/auth/callback/route.ts`.
- Env detection in `src/lib/supabase/env.ts` so prototype routes can keep working in local/dev fallback states.

### Prototype Seed Layer

Seed data: `src/lib/dummyData.ts`.

Current seed counts:

- Farmers/personas: 6.
- Paddock listings: 3.
- Livestock requests: 3.
- Agreements: 1 top-level seeded agreement, with nested sections, artefacts, messages, and lifecycle entries.
- Transport jobs: 1 top-level seeded transport job, with nested sections, quotes, artefacts, and timeline entries.
- Transport capacity posts: 4.

Prototype store: `src/lib/prototypeStore.ts`.

Built:

- Local state key: `paddockme.prototype.state.v1`.
- Persona state syncing through localStorage and cookie.
- Resettable local demo state.
- Agreement, transport, message, request, and capacity state helpers.

## Verification And Demo Operations

Primary command:

```bash
npm run verify:pitch
```

This runs:

- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `npm run demo:smoke`
- `npm run demo:click`

Smoke script currently checks:

- `/`
- `/sign-in`
- `/sign-up`
- `/onboarding`
- `/agreements`
- `/workspace/agreement-glenbarra`
- `/transport/transport-glenbarra`
- `/messages`
- `/workspace/agreement-glenbarra/snapshot`
- `/requests`
- `/runs`
- `/profile`

Browser click rehearsal currently checks:

- Landing CTA opens `/agreements`.
- `Sections to confirm` opens `/workspace/agreement-glenbarra`.
- Dale can agree the rate section.
- Brett can agree the same section.
- `Open transport room` opens `/transport/transport-glenbarra`.
- Wayne's driver view shows the transport/backload economics.
- Farmer A can open the rate state and see `Rate accepted`.
- Brett can open the `Pick a paddock to offer` picker.
- Wayne's `/runs` pipeline is reachable.

Latest known local status:

- `npm run verify:pitch` passes.
- `npm run demo:click` passes against production.
- Live marketing/auth browser sweep passed at 375px, 768px, and 1280px.
- Latest rehearsal notes are in `docs/DEMO_REHEARSAL_LOG.md`.

## Assets

Built:

- Persona avatars:
  - `public/avatars/dale.jpg`
  - `public/avatars/brett.jpg`
  - `public/avatars/wayne.jpg`
- Demo screenshots:
  - `public/demo/workspace.png`
  - `public/demo/transport.png`
  - `public/demo/requests.png`
- Static map images:
  - `public/location-maps/cowra.png`
  - `public/location-maps/gippsland.png`
  - `public/location-maps/gundagai.png`
- `public/robots.txt`

## Current Sprint Docs

Use these as the active operating set:

- `docs/INVESTOR_MVP_SPRINT.md`
- `docs/DEMO_SCRIPT.md`
- `docs/DEMO_CHEATSHEET.md`
- `docs/DEMO_REHEARSAL_LOG.md`
- `docs/AI_HANDOFF_CURRENT.md`
- `docs/INVESTOR_PITCH_NOTES.md`
- `docs/INVESTOR_DILIGENCE_QA.md`
- `docs/CUSTOMER_VALIDATION_GUIDE.md`
- `docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md`
- `docs/INVESTOR_FREEZE_CHECKLIST.md`
- `docs/CURRENT_PRODUCT_AUDIT.md`

Historical/foundation docs still useful for context:

- `docs/PRINCIPLES.md`
- `docs/PERSONAS.md`
- `docs/SCOPE.md`
- `docs/BUILD_02.md`
- `docs/BUILD_03_TRANSPORT.md`
- `docs/DESIGN_INTELLIGENCE.md`

## What Is Not Built Yet

Not currently built as production-grade functionality:

- Payments.
- Escrow.
- Settlement.
- Real e-signatures.
- Legal contract generation.
- Real GPS/telematics.
- Real maps as the primary operational map engine.
- Automated dispute mediation.
- Reviews/ratings.
- Admin tooling.
- A full matching algorithm.
- Fully database-native state for every prototype interaction.
- Broader automated browser coverage beyond the canonical pitch path.

## Highest-Leverage Next Moves

For the three-day investor sprint, the next useful moves are:

- Keep the canonical pitch path stable and avoid broad app changes.
- Keep `scripts/demo-click.mjs` aligned with any live label changes.
- Rehearse production twice with a timer and update `docs/DEMO_REHEARSAL_LOG.md`.
- Replace demo screenshots only if Claude changes the authenticated app visuals.
- Decide the Day 2/Day 3 commercial story for payments and settlement without building payment UI yet.
