# Investor Freeze Checklist

Use this before an investor call or before declaring the sprint demo frozen.

## Hard Gate

Run:

```bash
npm run verify:pitch
```

Do not freeze if any part fails:

- TypeScript.
- Markdown links.
- Production build.
- Production route smoke.
- Production browser click rehearsal.

## Production Gate

Confirm latest Vercel production deployment is Ready:

```bash
vercel ls --scope jwcoleman87-collabs-projects
```

Confirm live alias:

https://paddockme-oz51.vercel.app

## Demo Path Gate

Open `docs/DEMO_CHEATSHEET.md` and walk the path once:

- `/`
- `/agreements`
- `/workspace/agreement-glenbarra`
- `/transport/transport-glenbarra`
- `/messages`
- `/workspace/agreement-glenbarra/snapshot`
- `/requests`
- `/runs`

If any label differs from the cheat sheet, update all three together:

- `docs/DEMO_CHEATSHEET.md`
- `docs/DEMO_SCRIPT.md`
- `scripts/demo-click.mjs`

## Claim Gate

Before the call, re-read:

- `docs/INVESTOR_PITCH_NOTES.md`
- `docs/INVESTOR_DILIGENCE_QA.md`
- `docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md`

Do not claim:

- Payments are built.
- Escrow is live.
- GPS is live.
- Legal contract generation is live.
- Matching is fully automated.
- The product is fully database-native.

Do claim:

- The coordination workflow is built enough to demonstrate.
- The app is deployed.
- Supabase auth/schema/types are wired.
- The demo path is automatically verified.
- Payments and settlement are the next commercial unlock.

## Change Freeze

After freeze:

- Only fix broken build, broken deploy, broken demo labels, or critical factual docs.
- Do not redesign the UI.
- Do not add new routes.
- Do not change auth flow.
- Do not change schema.
- Do not touch Claude's branch or PRs unless explicitly coordinated.

## Final Rehearsal Notes

After the last rehearsal, update:

- `docs/DEMO_REHEARSAL_LOG.md`

Record:

- Date.
- Production deployment URL.
- Commands run.
- Whether `npm run verify:pitch` passed.
- Any visible demo drift.
- Any investor-question prep notes.

