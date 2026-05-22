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

