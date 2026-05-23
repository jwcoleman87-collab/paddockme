# AI Handoff Current

Use this when handing PaddockME to another AI assistant during the investor MVP sprint.

## Current Goal

Make PaddockME investor-ready by proving a tight, repeatable MVP story:

- Livestock owner needs feed.
- Landowner can offer paddocks.
- Driver coordinates transport.
- Agreement and movement stay in structured workspaces.
- Payments/settlement are the next commercial unlock, not a current implementation claim.

## Current Production App

Live app:

https://paddockme-oz51.vercel.app

Branch:

`main`

Before changing anything pitch-facing, run:

```bash
npm run verify:pitch
```

This currently runs:

- TypeScript check.
- Markdown link check.
- Production build.
- Production route smoke.
- Production browser click rehearsal.

## Current Verification State

Known green locally:

```bash
npm run verify:pitch
```

The command includes the canonical click path:

- Landing CTA opens `/agreements`.
- `Sections to confirm` opens `/workspace/agreement-glenbarra`.
- Dale and Brett can agree the rate section.
- `Open transport room` opens `/transport/transport-glenbarra`.
- Wayne's driver view shows transport/backload economics.
- Farmer A can see accepted rate state.
- Brett can open `Pick a paddock to offer`.
- Wayne's `/runs` pipeline is reachable.

## Ownership Guardrails

Avoid broad changes under:

- `src/app/(app)/**`
- `src/lib/dummyData.ts`
- `src/lib/prototypeStore.ts`
- `supabase/migrations/**`

Those are sensitive because Claude has been working the authenticated app/demo path and those files hold the prototype state model.

Safe sprint lane:

- Pitch docs.
- Demo verification scripts.
- Public README/operator docs.
- Marketing/auth surface only if explicitly needed and verified.

## Active Operating Docs

Read in this order:

1. `docs/DEMO_CHEATSHEET.md`
2. `docs/DEMO_SCRIPT.md`
3. `docs/CURRENT_PRODUCT_AUDIT.md`
4. `docs/INVESTOR_MVP_SPRINT.md`
5. `docs/INVESTOR_DILIGENCE_QA.md`
6. `docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md`
7. `docs/CUSTOMER_VALIDATION_GUIDE.md`

## Important Scripts

- `npm run verify:pitch`
- `npm run demo:smoke`
- `npm run demo:click`
- `npm run docs:check`
- `npm run db:types`

## Known Truths

Real today:

- Deployed Next.js app.
- Supabase auth wiring.
- Generated Supabase database types.
- Type-safe `agistment_requests` insert.
- Signed-in `/profile` summary loaded from Supabase `profiles`.
- Investor landing page.
- Demo route smoke test.
- Browser click rehearsal.

Prototype today:

- Many demo interactions use local prototype state.
- Agreement and transport state are intentionally resettable.
- Matching is not a full algorithm.
- Payments, escrow, settlement, GPS, and legal automation are not built.

## Current Risk Notes

- `npm audit` reports moderate advisories through Next's internal PostCSS dependency. Do not run `npm audit fix --force`; it suggests an inappropriate major downgrade path.
- The browser click script depends on live labels. If Claude changes demo labels, update `scripts/demo-click.mjs`, `docs/DEMO_SCRIPT.md`, and `docs/DEMO_CHEATSHEET.md` together.
- Keep claims honest: production surfaces are real, but the full marketplace is not database-native yet.

## Next Useful Work

Highest value:

- Keep `npm run verify:pitch` green.
- Rehearse the live pitch twice with a timer.
- If labels drift, update scripts/docs immediately.
- Use `docs/CUSTOMER_VALIDATION_GUIDE.md` for first real interviews.
- Do not build payments UI until the payment/settlement assumptions are validated.
