# CLAUDE.md — repo orientation for AI coding sessions

PaddockME is an Australian agistment marketplace: livestock owners who need
pasture, landowners with spare paddocks, and transport carriers who move stock
between them. One workspace per match, structured agreements, three-party
transport coordination. The owner (James Coleman) is a non-developer — explain
changes in plain language, be explicit about how to test things in a browser,
and never assume he can read diffs or run typecheck commands himself.

## Read these before changing product behaviour

1. `PADDOCKME_MASTER_SPEC.md` (root) — canonical build spec, v1.2. Section 3
   makes the `pm-*` design system canonical.
2. `SPEC_DRIFT.md` (root) — known gaps between the live code and the spec.
3. `docs/README.md` — index of every other doc, grouped by topic and status.

## Stack and commands

Next.js 16 (App Router, `src/` layout, Turbopack) · TypeScript strict ·
Tailwind CSS v4 (CSS `@theme` in `globals.css`) · Supabase (Postgres, Auth,
RLS) · Stripe (sandbox) · Playwright e2e · Vercel.

```bash
npm run dev          # dev server on :3000
npm run typecheck    # tsc --noEmit (this is also `npm run lint`)
npm run build        # production build — run before pushing
npm run test:e2e     # Playwright specs in tests/e2e/
npm run docs:check   # markdown link check — run after touching any .md
npm run db:types     # regenerate src/lib/types/database.ts from Supabase
```

Local dev without Supabase env vars still boots: `isSupabaseConfigured()`
gates every Supabase call and the middleware skips auth. Auth flows are only
testable with real `NEXT_PUBLIC_SUPABASE_*` values in `.env.local`.

## Route map — two lanes in one app

- **Guided flat routes** (`src/app/requests/…`, `/properties`, `/workspaces`,
  `/transport/…`, `/account`) — the guided-MVP customer journey, walkable
  end-to-end with demo data and no auth. Canonical UX lane; built from `pm-*`
  components in `src/components/paddockme/`.
- **Legacy `(app)` tree** (`src/app/(app)/…` — dashboards behind sign-in) —
  dormant reference code. Real signed-in accounts land here (`/agreements`).
  Do not mass-delete it without an approved retirement brief.
- **`(auth)` tree** — the real Supabase auth: `/sign-in`, `/sign-up`,
  `/forgot-password`, `/onboarding`, plus `/auth/callback` for magic links.
  `/login` and `/register` are legacy URLs that redirect here.

## Auth flow (real accounts)

`src/proxy.ts` runs `updateSession()` from `src/lib/supabase/middleware.ts` on
every request: signed-out users hitting an app route are bounced to
`/sign-in?next=…`; signed-in users on `/sign-in` are bounced to `/agreements`;
accounts with no `profiles.account_types` are sent to `/onboarding`. The
route prefix lists at the top of that middleware file decide which lane a URL
belongs to — check them first when a redirect surprises you.

Demo mode: `isDemoMode()` in `src/lib/demoMode.ts` is true when
`NEXT_PUBLIC_DEMO_MODE=true` **or** the hostname is `paddockme.vercel.app`
(the investor demo host). In demo mode the sign-in/sign-up forms skip Supabase
entirely and route into the guided flow.

## Deployment (verified 14 Jul 2026 — re-check in Vercel before relying on it)

Two Vercel projects build from this one repo:

| Vercel project | URL | What it serves |
| --- | --- | --- |
| `paddockme` | paddockme.vercel.app | Investor demo host (treated as demo mode). Production deploys have been coming from the `codex/private-beta-real-loop` branch. |
| `paddockme-oz51` | paddockme-oz51.vercel.app | Original live site; production tracks `main`. |

Because of this split, **a fix merged to `main` does not necessarily reach
both sites**, and branch deploys can run ahead of `main`. Check which branch a
project's production deployment came from before declaring anything fixed.

## Working guardrails

- `pm-*` is the canonical design language; do not invent a new one.
- No emoji for state — status indicators use lucide-react icons.
- Docs-only or housekeeping briefs must not change route behaviour.
- Stage specific files (`git add -- <paths>`), never `git add -A` — Windows
  mounts have historically flipped line endings across the repo.
- Dated session records (handovers, handoff briefs) go in `docs/archive/`;
  point-in-time audits and bug scans go in `docs/reports/`.
- Run `npm run docs:check` after adding, moving, or editing markdown.
