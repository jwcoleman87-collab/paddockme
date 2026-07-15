# Claude Code Handoff Script

Use this as the opening brief for Claude Code when picking up PaddockME.

---

You are working on the PaddockME repo:

https://github.com/jwcoleman87-collab/paddockme

Live app:

https://paddockme-oz51.vercel.app

Current branch target:

`main`

## What PaddockME Is

PaddockME is an Australian agistment marketplace connecting:

- Livestock owners who need paddocks/feed.
- Landowners with spare paddocks.
- Transport providers who move stock.

The product goal is not a generic marketplace. The core principle is:

> Reduce agricultural coordination friction.

The app should replace phone tag, Facebook posts, scattered documents, and unclear handshakes with one practical workflow that gets livestock matched with suitable feed, written terms, and transport coordination.

Before building anything, read:

- `README.md`
- `docs/PRINCIPLES.md`
- `docs/SCOPE.md`
- `docs/PERSONAS.md`
- `docs/BUILD_02.md`
- `docs/BUILD_03_TRANSPORT.md`
- `docs/DESIGN_INTELLIGENCE.md`

## Current Technical Stack

- Next.js 16 App Router.
- TypeScript.
- Tailwind CSS v4.
- Supabase for Auth, Postgres, RLS, and generated database types.
- Vercel production deploys from `main`.
- Supabase project ref: `aevzcvlzfvrdipgofczx`.

Important env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose secret values in logs, screenshots, commits, or responses.

## Where We Are Right Now

The app is live and deployable.

The latest completed fix was:

`Fix type-safe Supabase insert for agistment requests`

Commit:

`3deda84`

What changed:

- `src/app/(app)/request/new/page.tsx`
- `package.json`

The Vercel TypeScript failure on the `agistment_requests` insert has been fixed without `as any`.

The request page now imports:

```ts
import type { TablesInsert } from "@/lib/types/database";
```

And creates a typed insert payload:

```ts
const payload: TablesInsert<"agistment_requests"> = {
  requester_id: user.id,
  stock_type: stockType,
  breed,
  head_count: headCount,
  duration,
  preferred_regions: selectedRegions,
  status: "open",
};
```

The package script now includes:

```json
"db:types": "npx supabase gen types typescript --project-id aevzcvlzfvrdipgofczx > src/lib/types/database.ts"
```

`src/lib/types/database.ts` contains the expected generated Supabase helper structure, including:

- `DatabaseWithoutInternals`
- `DefaultSchema`
- `Tables`
- `TablesInsert`
- `TablesUpdate`
- `Enums`
- `CompositeTypes`
- `Constants`

Local build result:

`npm run build` passes.

Production deployment result:

Vercel production deployment is `Ready`.

Live smoke test result:

- Signed in as a temporary confirmed livestock-owner smoke user.
- Opened `/request/new`.
- Created a new agistment request.
- Confirmed redirect to `/matches?...`.
- Confirmed rows appeared in Supabase table `agistment_requests`.

## Important Known Issue

The live `/request/new` flow currently creates two `agistment_requests` rows for one submitted request.

Reason:

`src/app/(app)/request/new/page.tsx` calls both:

```ts
await createLivestockRequestRecord(...)
```

and then:

```ts
await persistRequest()
```

Both code paths can insert into `agistment_requests` when the user is signed in.

This was observed during the live smoke test. The smoke test created two rows with matching request data for the same requester.

Do not treat this as part of the previous TypeScript fix. The previous task was deploy/build only and intentionally did not change product flow.

## What Is Built

The app currently includes these major surfaces:

- Marketing/home entry page.
- Auth pages:
  - `/sign-up`
  - `/sign-in`
  - `/auth/callback`
  - `/onboarding`
- Authenticated app shell.
- New agistment request flow:
  - `/request/new`
  - Saves a local prototype request.
  - If signed in and Supabase is configured, writes to Supabase.
  - Redirects to `/matches?...`.
- Matches page:
  - `/matches`
  - Uses request query params and prototype data to show possible paddock matches.
- Listings:
  - `/listings`
  - `/listings/new`
  - `/listings/[id]`
- Requests browser:
  - `/requests`
  - Landowner-facing open livestock request surface.
- Agreement/workspace surfaces:
  - `/agreements`
  - `/workspace/[id]`
  - Agreement panel, chat panel, sections, lifecycle-style UI.
- Transport surfaces:
  - `/transport`
  - `/transport/[id]`
  - `/transport/available`
- Map surface:
  - `/map`
  - Uses coordinate helpers and prototype/Supabase-backed marketplace data.
- Profile:
  - `/profile`

The app still has a strong prototype layer. Supabase is partially wired in, but not every screen is fully database-native yet.

## Supabase State

Generated types live in:

`src/lib/types/database.ts`

Migrations live in:

`supabase/migrations/`

Core tables include:

- `profiles`
- `paddocks`
- `agistment_requests`
- `matches`
- `agreements`
- `agreement_sections`
- `messages`
- `transport_jobs`
- `transport_status_events`
- `transport_capacities`
- `transport_quotes`

The codebase uses both:

- Local prototype state from `src/lib/prototypeStore.ts`
- Supabase repository functions from `src/lib/data/repositories.ts`

Be careful when changing repository behavior because several routes still rely on local prototype fallbacks.

## Where We Want To Be Next

Claude's latest direction for the second AI is narrower than the backend request-flow task below.

Second AI current scope:

- Rewrite `src/app/page.tsx`.
- Do a mobile sweep on marketing/auth surfaces.
- Leave `src/app/(app)/**` completely alone.

Claude's reference branch/file for the marketing page is:

https://github.com/jwcoleman87-collab/paddockme/blob/claude/paddockme-development-J85Os/src/app/page.tsx

At the time of this handoff, local `src/app/page.tsx` matches that Claude branch file.

Allowed files for this second-AI scope:

- `src/app/page.tsx`
- `src/app/(auth)/sign-in/page.tsx`
- `src/app/(auth)/sign-up/page.tsx`
- `src/app/(auth)/onboarding/page.tsx`
- `src/app/(auth)/onboarding/OnboardingClient.tsx`
- Shared marketing/auth-only components, only if truly required after inspection.

Do not edit:

- `src/app/(app)/**`
- `src/lib/data/repositories.ts`
- `src/lib/types/database.ts`
- Supabase migrations
- Auth callback logic
- Route names
- Request creation flow
- Agreement, listing, match, map, transport, or workspace screens

The purpose of this second-AI task is presentation and mobile usability for the public entry/auth experience only. It is not a backend, Supabase, or product-flow task.

Acceptance criteria for the second-AI task:

- `src/app/page.tsx` is rewritten as a stronger marketing entry page for PaddockME.
- Marketing/auth pages behave cleanly on mobile widths.
- Text does not overlap, overflow, or become unreadable on small screens.
- CTAs remain clear and route to existing destinations.
- No changes are made under `src/app/(app)/**`.
- `npm run build` passes.

If there is any conflict between this second-AI scope and the duplicate-insert task below, follow the second-AI scope and leave the duplicate-insert task untouched.

The next sensible product goal is:

Make the core livestock-owner request flow clean, single-write, and trustworthy from request creation through matching.

Recommended next task:

Fix the duplicate insert in `/request/new` without redesigning UI.

Acceptance criteria:

- Submitting `/request/new` creates exactly one `agistment_requests` row for a signed-in user.
- The user still redirects to `/matches?...`.
- The local prototype fallback still works when Supabase is not configured or no user is signed in.
- No UI redesign.
- No route rename.
- No auth flow change.
- No broad casts like `as any`.
- `npm run build` passes.
- Live smoke test confirms exactly one row appears for a newly submitted signed-in request.

Likely implementation direction:

1. Inspect `src/app/(app)/request/new/page.tsx`.
2. Inspect `createLivestockRequestRecord` in `src/lib/data/repositories.ts`.
3. Choose one Supabase write path.
4. Keep local prototype creation intact for demo/fallback behavior.
5. Avoid silently swallowing important insert errors if the user is signed in and Supabase should be writing.
6. Preserve the current request form UI and redirect behavior.

One possible direction is to make `createLivestockRequestRecord` the single source of persistence and remove the second Supabase insert from `persistRequest`, or replace `persistRequest` with a narrower success/flash concern. But inspect the existing code first before deciding.

## Guardrails

Do not redesign the UI.

Do not change:

- Routes.
- Auth flow.
- Supabase project.
- Environment variable names.
- Request form flow.
- Design system.
- Prototype fallback behavior unless directly required and verified.

Do not use:

- `as any`
- temporary type hacks
- broad casts that hide Supabase typing problems

Do run:

```bash
npm run build
```

If touching generated database types, run:

```bash
npm run db:types
```

If Supabase CLI login is required, stop and say so clearly.

## Reporting Format

At the end, report:

- Files changed.
- Whether `npm run build` passed.
- Whether live Vercel deploy passed, if pushed.
- Whether live `/request/new` smoke test passed.
- Exact row count created in `agistment_requests` for the smoke request.
- Any blockers involving Supabase auth, Vercel env, or missing service-role access.
