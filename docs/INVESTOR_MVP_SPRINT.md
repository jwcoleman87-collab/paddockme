# Investor MVP Sprint

Three-day sprint goal: make PaddockME credible enough for an investor pitch by showing a tight story, a stable demo path, and a clear next commercial unlock.

Live app:

https://paddockme-oz51.vercel.app

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
- Screenshot slots are placeholders until the authenticated demo path settles.
- Demo script exists at `docs/DEMO_SCRIPT.md`.
- Marketing/auth pages pass the 375px, 768px, and 1280px sweep.
- Production metadata describes the investor MVP cleanly.

Remaining Day 1 checks:

- Rehearse the full five-minute script once on production.
- Confirm every named button in `docs/DEMO_SCRIPT.md` still exists after Claude's authenticated-app changes.
- Capture rough screenshots only after the demo path is stable.

Helpful command:

```bash
npm run demo:smoke
```

This checks the production demo route spine and prints the manual click checks that still need a browser rehearsal.

## Day 2 - Demo Reliability

Goal: make the five-minute walkthrough boringly repeatable.

Acceptance criteria:

- `/agreements` opens directly into the intended Dale state.
- The "Sections to confirm" path lands in the correct workspace.
- Agreement section agreement works for Dale and Brett.
- Transport tab opens the correct transport room.
- Driver view shows a credible quote/backload moment.
- Inbox and snapshot are reachable without dead ends.
- Brett can offer a paddock against an open request.
- Wayne can show the transport pipeline.
- Resetting prototype state restores the canonical demo.

Nice to have:

- One visible "demo ready" pathway from the landing page to the first authenticated screen.
- No console errors during the demo path.
- No obvious mobile clipping on the canonical demo screens.

## Day 3 - Investor Polish

Goal: make the pitch feel intentional rather than assembled.

Acceptance criteria:

- Replace the three screenshot placeholders on `/` with final captured product images.
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
