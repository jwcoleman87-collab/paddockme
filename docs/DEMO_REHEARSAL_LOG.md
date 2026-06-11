# Demo Rehearsal Log

Use this to avoid re-learning the same demo-path details during the three-day sprint.

## 2026-05-22

Environment:

- Local app: `http://127.0.0.1:3000`
- Production route smoke: `https://paddockme-oz51.vercel.app`

Commands run:

```bash
npm run build
npm run demo:smoke
```

Results:

- Build passed.
- Production route smoke passed.
- Landing CTA `Try the demo` opened `/agreements`.
- `/agreements` tile `Sections to confirm` opened `/workspace/agreement-glenbarra`.
- `/workspace/agreement-glenbarra` opened `/transport/transport-glenbarra` via `Open transport room`.
- `/workspace/agreement-glenbarra` opened `/workspace/agreement-glenbarra/snapshot` via `View snapshot`.
- Brett context on `/requests` showed `Offer a paddock`.
- `/profile` showed `Reset prototype state`.

Interaction rehearsal:

- Workspace `Terms` tab exposed a party `Tap to agree` control.
- Clicking `Tap to agree` kept the workspace usable and changed visible agreement state.
- Transport room `Rate` tab exposed `Accept rate`.
- Clicking `Accept rate` changed the visible state to `Rate accepted`.
- Chat showed a system message: Dale accepted the transport rate.

Demo notes:

- Do not open `/requests` cold when demonstrating Brett. Switch persona to Brett first and wait for the shell to show Brett.
- The current UI says `Accept rate`, not `Accept the quote`.
- The current agreement control says `Tap to agree`, not just `Agree`.

Live marketing/auth sweep:

- Checked `/`, `/sign-in`, `/sign-up`, and `/onboarding` on production at 375px, 768px, and 1280px.
- No horizontal overflow found.
- No clipped key text found across links, buttons, headings, paragraphs, labels, and form controls.
- No console errors observed during the sweep.

Production manual click rehearsal:

- `/agreements` tile `Sections to confirm` opened `/workspace/agreement-glenbarra`.
- Agreement `Terms` tab uses party-specific controls, e.g. `Farmer A: Tap to agree` and `Farmer B: Tap to agree`.
- Brett can agree the rate section after switching to `Farmer B (Brett) Landowner`.
- `Open transport room` opened `/transport/transport-glenbarra`.
- Transport role labels are `Farmer A Livestock owner (Dale)`, `Farmer B Landowner (Brett)`, and `Driver Transporter (Wayne)`.
- Transport rate state can already be accepted from stored prototype state; when accepted, `Rate accepted` is visible.
- `/requests` as Brett showed three `Offer a paddock` buttons.
- Clicking the first `Offer a paddock` opened the live picker labelled `Pick a paddock to offer`.
- No console errors observed during the manual click rehearsal.

## 2026-05-23

Environment:

- Production route and browser rehearsal: `https://paddockme-oz51.vercel.app`

Commands run:

```bash
npm run demo:click
npm run verify:pitch
```

Results:

- `npm run verify:pitch` passed.
- Markdown link check passed across the tracked repo docs.
- Production route smoke passed.
- Production browser click rehearsal passed.
- Landing CTA opened `/agreements`.
- `Sections to confirm` opened `/workspace/agreement-glenbarra`.
- Dale agreed the `Rate and terms` section.
- Brett agreed the same section after switching to `Farmer B (Brett) Landowner`.
- `Open transport room` opened `/transport/transport-glenbarra`.
- Driver view showed Wayne and farmer-created transport RFTs.
- Farmer A opened the `Rate` tab and saw `Rate accepted`.
- Brett opened the `Pick a paddock to offer` picker from `/requests`.
- Wayne's `/runs` pipeline was reachable.
- No console errors observed during the automated browser rehearsal.
