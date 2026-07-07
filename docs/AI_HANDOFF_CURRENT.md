# AI Handoff Current

Use this when handing PaddockME to another AI assistant during the guided-MVP rebuild.

## Current Product Direction

The guided MVP flow is now the canonical PaddockME product UX. Treat the current guided screens as the product becoming real by progressive backend wiring, not as a disposable demo path.

Backend direction:

- Auth first.
- Then a Supabase-backed workflow provider.
- Keep claims honest while that wiring lands: the UX is canonical, but not every workflow state is database-native yet.

## Source Of Truth

Read in this order before changing product behaviour:

1. `PADDOCKME_MASTER_SPEC.md` v1.2 - canonical build spec. Section 3 makes `pm-*` the canonical design system and retires "Pastoral Zen".
2. `SPEC_DRIFT.md` - known gaps between the live code and the master spec.
3. `docs/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md` - expected home for completed agreements and the live-agreement review loop.

The old demo run sheets are gone. Do not reference `docs/DEMO_CHEATSHEET.md`, `docs/DEMO_SCRIPT.md`, or `docs/DEMO_REHEARSAL_LOG.md` as active operating docs.

## Canonical UX Flow

The current guided route path is:

1. `/requests/new`
2. `/requests/matches`
3. `/properties/[slug]`
4. `/workspaces/1023`
5. `/workspaces/1023/agreement`
6. `/workspaces/1023/review`
7. `/transport/quotes/1023`
8. `/transport/rooms/1023`
9. `/workspaces/1023/live`

Use the flat guided routes under `src/app/**`, the `pm-*` components under `src/components/paddockme/**`, and the `usePaddockmeWorkflow` provider as the canonical implementation lane unless a task brief says otherwise.

## Legacy Tree Status

`src/app/(app)/**` is dormant reference code. It may still be useful for reading older data-access and interaction patterns, but it is not the canonical customer journey and should not be mass-deleted without a human-approved retirement brief.

The retired Dale/Brett/Wayne click path is no longer the product path. If those names appear in historical docs, treat them as historical context unless your brief explicitly asks for a docs scrub.

## Package Scripts

These script names are verified in `package.json` as of 7 Jul 2026:

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run docs:check`
- `npm run verify:pitch`
- `npm run demo:smoke`
- `npm run demo:click`
- `npm run payments:smoke`
- `npm run db:types`

Before writing down what any script proves, inspect the script and the files it runs. In particular, do not assume the demo smoke/click scripts cover the current guided route flow unless you have checked them for this sprint.

## Working Guardrails

- Do not change route behaviour from docs-only or housekeeping briefs.
- Do not edit load-bearing guided-flow files unless the current brief explicitly asks for it.
- Do not invent a new design language. `pm-*` is canonical.
- Do not revive deleted demo docs or retired persona-click instructions.
- Do not mass-delete the legacy `(app)` tree.

## Current Risk Notes

- The guided UX is ahead of the backend in places; backend wiring should move through auth and then Supabase-backed workflow state.
- Complete-state agreement handling should follow `docs/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md`.
- Keep claims plain: PaddockME is becoming database-native route by route, and any remaining local or seeded workflow state should be treated as migration work, not as a finished marketplace backend.
