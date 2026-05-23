# Demo Cheat Sheet

Use this when rehearsing or presenting. The full script is `docs/DEMO_SCRIPT.md`; this is the quick on-screen run sheet.

## Before You Start

Run:

```bash
npm run verify:pitch
```

Open:

https://paddockme-oz51.vercel.app

Optional reset:

- Go to `/profile`.
- Click `Reset workspace state`.

## One-Liner

PaddockME turns agistment from phone tag into one coordinated workspace for livestock, land, and transport.

## Five-Minute Path

1. `/`
   - Say: "This is a three-sided workflow: livestock, land, transport."
   - Confirm the bottom bar shows `Need agistment`, `Have agistment`, and `Need transport`.

2. `/agreements`
   - Show Dale's work queue.
   - Click `Sections to confirm`.

3. `/workspace/agreement-glenbarra`
   - Open `Terms`.
   - Select `Rate and terms`.
   - Click `Farmer A: Tap to agree`.
   - Switch to `Farmer B (Brett) Landowner`.
   - Click `Farmer B: Tap to agree`.
   - Say: "Both sides create the record together."

4. Transport from workspace
   - Click `Open transport room`.

5. `/transport/transport-glenbarra`
   - Switch to `Driver Transporter (Wayne)`.
   - Show driver/backload economics.
   - Switch to `Farmer A Livestock owner (Dale)`.
   - Open `Rate`.
   - Show `Rate accepted`.

6. `/messages`
   - Show that work creates conversation context.

7. `/workspace/agreement-glenbarra/snapshot`
   - Show the read-only record.

8. `/agreements`
   - Confirm shell is Brett or switch to Brett.
   - Open requests.

9. `/requests`
   - Click `Offer a paddock`.
   - Show `Pick a paddock to offer`.

10. `/runs`
   - Switch persona to Wayne first if needed.
   - Show pipeline/backload story.

## Say This About What Is Real

- The app is deployed.
- Auth and Supabase schema are wired.
- The demo path is a real product surface.
- The route smoke and browser click rehearsal pass.
- Prototype state is used deliberately for reliable investor walkthroughs.

## Say This About What Is Next

Payments and settlement are next after the agreement workflow is stable: quote, agree, move stock, settle.

## Do Not Say

- Payments are built.
- Escrow is live.
- GPS is live.
- Matching is fully automated.
- It is "Uber for cattle."

## Recovery

If anything looks strange:

1. Go to `/profile`.
2. Click `Reset workspace state`.
3. Reopen `/`.
4. Run the path again.
