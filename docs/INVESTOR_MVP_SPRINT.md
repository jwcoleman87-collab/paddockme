# Investor MVP Sprint

Three-day sprint goal: make PaddockME credible enough for an investor pitch by showing a tight story, a stable demo path, and a clear next commercial unlock.

Live app:

https://paddockme-oz51.vercel.app

Current built-product inventory:

[`docs/CURRENT_PRODUCT_AUDIT.md`](./CURRENT_PRODUCT_AUDIT.md)

Investor follow-up Q&A:

[`docs/INVESTOR_DILIGENCE_QA.md`](./INVESTOR_DILIGENCE_QA.md)

Customer validation guide:

[`docs/CUSTOMER_VALIDATION_GUIDE.md`](./CUSTOMER_VALIDATION_GUIDE.md)

Payments/settlement blueprint:

[`docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md`](./PAYMENTS_SETTLEMENT_BLUEPRINT.md)

Live demo cheat sheet:

[`docs/DEMO_CHEATSHEET.md`](./DEMO_CHEATSHEET.md)

Current AI handoff:

[`docs/AI_HANDOFF_CURRENT.md`](./AI_HANDOFF_CURRENT.md)

## Working Rule

Do not blur ownership.

- Marketing/demo/mobile lane: public landing, auth/onboarding polish, demo docs, pitch readiness.
- Claude lane: authenticated app surfaces and the canonical demo workflow.

No one should casually edit another lane during the sprint.

## Day 1 - Story And Demo Surface

Goal: make the product understandable in one scan and make the demo script safe to rehearse.

Done:

- Landing page tells the investor story in one scroll.
- Primary CTA routes to `/agreements`.
- Personas are visible: Dale, Brett, Wayne.
- Product screenshots from the live demo path are on the landing page.
- Demo script exists at `docs/DEMO_SCRIPT.md`.
- Investor talk track exists at `docs/INVESTOR_PITCH_NOTES.md`.
- Marketing/auth pages pass the 375px, 768px, and 1280px sweep.
- Production metadata describes the investor MVP cleanly.
- The five-minute script has been rehearsed against the current product labels.
- Named demo controls match the current UI: `Sections to confirm`, `Tap to agree`, `Open transport room`, `Accept rate`, and `Offer a paddock`.
- Brett's `/requests` step is documented with the required persona switch before testing `Offer a paddock`.
- Product audit, diligence Q&A, customer validation guide, and payments/settlement blueprint exist as sprint operating docs.

Helpful command:

```bash
npm run verify:pitch
```

This runs TypeScript, the production build, route smoke checks, and the browser click rehearsal for the canonical pitch path.
Manual rehearsal notes live in `docs/DEMO_REHEARSAL_LOG.md`.

## Day 2 - Demo Reliability

Goal: make the five-minute walkthrough boringly repeatable.

Acceptance criteria:

- `/agreements` opens directly into the intended Dale state. Automated in `npm run demo:click`.
- The "Sections to confirm" path lands in the correct workspace. Automated in `npm run demo:click`.
- Agreement section agreement works for Dale and Brett via the party
  "Tap to agree" controls.
- Transport tab opens the correct transport room. Automated in `npm run demo:click`.
- Driver view shows a credible quote/backload moment. Automated in `npm run demo:click`.
- Farmer A can open the Rate tab and accept the driver's rate. Automated in `npm run demo:click`.
- Inbox and snapshot are reachable without dead ends.
- Brett can offer a paddock against an open request. Automated in `npm run demo:click`.
- Wayne can show the transport pipeline. Automated in `npm run demo:click`.
- Resetting prototype state restores the canonical demo.
- Automated browser click rehearsal covers the canonical pitch path via `npm run demo:click`.

Nice to have:

- One visible "demo ready" pathway from the landing page to the first authenticated screen.
- No console errors during the demo path.
- No obvious mobile clipping on the canonical demo screens.

## Day 3 - Investor Polish

Goal: make the pitch feel intentional rather than assembled.

Acceptance criteria:

- Replace the three screenshot placeholders on `/` with final captured product images. Day 1 rough captures are already live; replace only if Claude changes the demo path visuals.
- Confirm the landing page, demo script, and actual app labels match.
- Run production smoke test on `/`, `/agreements`, `/workspace/agreement-glenbarra`, `/transport/transport-glenbarra`, `/messages`, and `/requests`.
- Rehearse the pitch twice against production with a timer.
- Freeze changes before the investor call except for critical fixes.

## Pitch Through-Line

One sentence:

PaddockME turns agistment from phone tag into one coordinated workspace for livestock, land and transport.

Proof points to show:

- Dale's problem is urgent: stock need feed now.
- Brett's supply is trust-constrained: spare country is only valuable if the incoming stock and terms are safe.
- Wayne's economics are utilisation-driven: empty kilometres delete profit.
- PaddockME coordinates the agreement and the transport room without leaking private commercial details.

Roadmap line:

Payments and settlement are next after the agreement workflow is stable.

## Do Not Drift

Avoid these during the sprint unless they directly protect the demo:

- New map ideas.
- New dashboards.
- New payments UI.
- New onboarding strategy.
- Schema changes.
- Broad UI redesigns.
- Anything that touches Claude's branch or PR unless explicitly coordinated.
