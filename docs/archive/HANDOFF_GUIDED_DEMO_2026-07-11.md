# Guided Demo build — handoff brief (11 July 2026)

Author: Claude (Fable 5), session ending mid-morning 11 Jul.
Scope delivered: the "PaddockME Guided Demo — Build Brief" (showroom model, not production).

## Outcome

The Guided Demo is complete, verified end-to-end, and live on a stable Vercel
**preview** URL (no production deployment, no production database change):

**https://paddockme-oz51-git-codex-pr-a26cc3-jwcoleman87-collabs-projects.vercel.app**

(Branch alias for `codex/private-beta-real-loop`; every push to the branch
redeploys the same URL. Deployment `dpl_GG6pZoGrogBdX3eNKFo5szqGdc3K`, target
= preview, state READY, built from `d6a8e87`.)

A signed-out visitor can walk the full story: request → matches → property →
landowner accept → workspace → negotiate price/dates/terms → review + RFT →
quotes → coordination room → book Wayne → Live Agreement → transport advances
Booked → Picked up → En route → **Delivered** → agistment active → inline
Reset Demo → clean slate.

## Commits this session (oldest first)

| Commit | What |
|---|---|
| `5ee930e` | Add venture audit report (docs/VENTURE_AUDIT_2026-07-10.md) |
| `5cc9b2e` | **Merge main** — reconciled the two reset systems: kept the branch's fuller `resetPaddockmeDemoState()`, gave it main's hard navigation, made `runDemoReset` an alias (main's legacy-tree DemoResetButton/DemoResetAction keep working, still env-gated). `.env.example` = union of both sides. Only conflicts: `.env.example`, `src/lib/demoReset.ts`. |
| `adabd43` | Transport journey through Delivered: `advanceTransport()` + shared `TRANSPORT_STEPS` in the workflow; transport room becomes the movement tracker after booking (scripted Wayne/John updates post into the thread); quotes + room pages honour workflow state (honest empty states on direct nav after reset — audit E6 fixed); Live Agreement delivered/active end state. |
| `eb18705` | One scenario everywhere + localStorage chat: seeds derive from the visitor's actual request (audit E7 fixed); distances made consistent (320/340 km vs 350 km radius); `useDemoThread` (`src/lib/demoThread.ts`) replaces Supabase in `PmChatPanel`; transporter joins chat only once booked; "3 online" → honest participant count. |
| `ca5854e` | GuidedDemoBadge (header + bottom nav + one hero line) and GuidedDemoResetAction — one reset path; account page's old workflow-only reset removed. |
| `ce28aeb` | E2E: full walkthrough spec; smoke expectations updated for the new empty states; **fixed the standalone test server** (see gotchas). |
| `d1632a0` | AM/PM case consistency in thread timestamps. |

After my push, a follow-on session added `bd3c360` (reset made local-only —
Supabase demo-chat wipe/sign-out removed from `demoReset.ts`) and `d6a8e87`
(guided landowner handoff: Request Sent now offers "Continue as John" →
landowner screen → Accept Discussion; walkthrough spec extended). Both are
pushed; the preview is built from `d6a8e87`.

## Verification evidence (all from this session)

- `npm run typecheck` ✅, `next build` ✅ (42 routes), Playwright **13/13 ✅**
  against the standalone production server (incl. the full walkthrough spec:
  delivery, refresh persistence mid-flow and post-completion, reset-after-
  completion, direct-nav-after-reset, restart-after-reset).
- Manual browser walkthrough (dev server): full flow driven by real clicks;
  seed derivation proven with non-default input (85 sheep / Orange NSW
  appeared verbatim in seeded chat); chat message persisted across reload
  with correct attribution; reset from `/account` and from the delivered end
  state both returned to a clean "/" with all `paddockme-*` threads wiped.
- Preview URL probed signed-out: `/`, `/requests/new`,
  `/transport/rooms/1023`, `/workspaces/1023/live` all 200; hydration
  confirmed in-browser (client-only empty state renders on Vercel).
- Mobile 390 px: no horizontal overflow on home, agreement, room (delivered),
  live. Console: zero errors through the whole walkthrough.
- Legacy lane intact: `/sign-in`, `/login`, `/register`, `/home` respond;
  `(app)` tree untouched apart from main's own merged commits.

## Where I stopped

Everything in the build brief is done. I stopped after verifying the preview
URL, without touching the **uncommitted transporter work Codex has in
flight** in the working tree (`src/app/transport/demo/`,
`src/components/paddockme/transporter/`, `tests/e2e/transporter-walkthrough.spec.ts`,
plus edits to `PaddockHomepage.tsx`/`PmCards.tsx`/`paddockmeDemoData.ts`/
`paddockmeWorkflow.tsx`). I did not build, test, commit, or review that work
— Codex ran out of tokens mid-implementation.

## Warnings for whoever picks up the transporter lane

1. **Middleware will auth-gate `/transport/demo`.** In
   `src/lib/supabase/middleware.ts`, `/transport` is in `APP_PREFIXES`
   (sign-in required) and only `/transport/quotes` + `/transport/rooms` are
   exempted via `GUIDED_MVP_PREFIXES`. Any new guided transporter route
   (e.g. `/transport/demo`) must be added to `GUIDED_MVP_PREFIXES` or a
   signed-out visitor is bounced to `/sign-in` — locally *and* on the preview.
2. **E2E must run via `npm run start:e2e`** (default in playwright.config).
   Next's standalone server serves no `.next/static`/`public` on its own;
   `scripts/standalone-serve.mjs` copies them in. The old `npm run start`
   target silently served SSR-only pages — text smoke passed while every
   hydrated surface was dead. Also: baseURL must be `localhost`, not
   `127.0.0.1` (hydration stalls on 127.0.0.1 on this machine).
3. **`vercel deploy` from the CLI fails here** (402 MB upload > 100 MB limit
   — repo carries heavy local artefacts). Deploy by pushing the branch; the
   GitHub integration builds the preview (it lagged ~10 min on the first
   push of the new branch).
4. Browser-pane screenshots time out on this machine; use
   read_page/get_page_text for verification.

## Suggested next steps

1. Let Codex (or a fresh session) finish the transporter walkthrough on top
   of `d6a8e87`; add its route to `GUIDED_MVP_PREFIXES`; keep Wayne's eight
   driver updates mapped onto the existing four owner-facing
   `TRANSPORT_STEPS` (that contract is already in the WIP).
2. Re-run `npm run typecheck && npm run build && npx playwright test` before
   any further push — the branch tip was green at `d1632a0`; the two later
   commits and the WIP have not been through my gate.
3. After the transporter lane lands, one fresh top-to-bottom walkthrough on
   the preview URL (all three doors from the homepage) before showing it.
4. Still parked deliberately (per brief): production merge, Supabase wiring,
   payments, key rotation, profiles RLS fix (audit §E9/E10) — Rod's
   architecture phase.

## Boundaries confirmation

- No merge into `main`; no production deployment (preview target only).
- No Supabase migration applied, no production data or credentials touched;
  demo chat is now localStorage-only, and the follow-on `bd3c360` removed
  even the demo-table delete from reset.
- No real multi-user architecture started.
