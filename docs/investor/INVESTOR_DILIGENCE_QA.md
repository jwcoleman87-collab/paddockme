# Investor Diligence Q&A

Use this as the blunt prep sheet for investor follow-up questions. It should stay honest: separate what is real today from what is prototype, and do not imply payments, GPS, settlement, legal automation, or matching intelligence are built before they are.

## What Is PaddockME?

PaddockME is an Australian agistment coordination platform. It connects three sides of the same job:

- Livestock owners who need feed or safer pasture.
- Landowners with spare paddock capacity.
- Stock transport operators who move animals between properties.

The wedge is not "another listings site." The wedge is coordination: one workspace for the agistment agreement and one transport room for the livestock movement.

## What Problem Are We Solving?

Agistment is still coordinated through phone calls, Facebook posts, spreadsheets, verbal terms, and separate transport ring-arounds.

That creates hidden costs:

- Livestock owners lose time when feed is urgent.
- Landowners hesitate because trust, biosecurity, rates, and terms are unclear.
- Transport operators lose margin on empty kilometres and duplicated paperwork.
- Everyone loses context because agreement terms, messages, documents, and transport status live in different places.

## Why Now?

The market is operationally ready for better coordination because:

- Climate volatility makes feed availability less predictable.
- Rural operators already use phones for operational work, but the workflow is fragmented.
- Biosecurity, traceability, and written records matter more than they used to.
- Transport capacity and backloads are expensive enough that coordination software can pay for itself.

## Who Is The First Customer?

The anchor user is Dale: a livestock owner who needs feed when his country runs out.

The first marketplace loop needs Brett and Wayne as well:

- Brett proves landowner supply can be activated safely.
- Wayne proves transport can become a co-equal workflow rather than a side call.

Tash, Lyn, and Sharon widen the market after the core loop feels right.

## What Is Built Today?

Built and deployed:

- Next.js app on Vercel.
- Supabase auth wiring.
- Supabase-generated TypeScript database types.
- Investor landing page.
- Sign-in, sign-up, and onboarding surfaces.
- Agreement queue.
- Two-party agreement workspace.
- Agreement snapshot.
- Three-party transport room.
- Messages surface.
- Landowner request browser.
- Driver pipeline.
- Profile and prototype reset surface.
- Production route smoke test.
- Production browser click rehearsal.

Canonical verification command:

```bash
npm run verify:pitch
```

## What Is Prototype Today?

Prototype by design:

- Several app surfaces use seed data and local prototype state.
- Agreement and transport interactions persist locally for the demo.
- Transport capacity has local prototype persistence plus best-effort Supabase dual-write.
- Request creation has a real Supabase insert path when authenticated, but matching remains MVP/prototype-level.

This is intentional for the investor sprint: the goal is to prove the coordination loop before broadening automation.

## What Is Not Built Yet?

Not built yet:

- Payments.
- Escrow.
- Settlement.
- Real e-signatures.
- Legal contract generation.
- GPS/telematics.
- Real verification services.
- Full matching algorithm.
- Admin tooling.
- Fully database-native state for every prototype interaction.

## Why Split Agreement And Transport?

The split is the product architecture:

- Agreement workspace: two-party contract surface between livestock owner and landowner.
- Transport room: three-party logistics surface between livestock owner, landowner, and driver.

This prevents the driver from seeing private agistment terms while still giving them the information they need to move livestock safely.

## What Is The Privacy Boundary?

Drivers should see logistics fields:

- Pickup and drop-off.
- Head count.
- Stock type.
- Welfare notes.
- Gate access.
- Timing.
- Driver-specific documents and transport status.

Drivers should not see:

- Agistment rate.
- Contract terms.
- Private agreement artefacts.
- Duration/commercial terms that belong only to the livestock owner and landowner.

The pitch claim is that this boundary is designed into the schema and RLS model, not merely hidden with UI.

## What Is The Business Model?

Near-term commercial path:

- Payment and settlement rails after agreement workflow is stable.
- Transaction fee or take-rate on settled agistment/transport jobs.
- Potential SaaS or operational tooling layer for larger transport operators later.

Do not claim revenue is live yet.

## What Is The Moat?

The moat is workflow depth and trust data, not a generic marketplace listing page.

Potential defensibility:

- Structured agreement data.
- Reusable participant profiles.
- Verification/readiness records.
- Transport capacity and backload context.
- Multi-sided operational history across livestock, land, and movement.
- A workflow that becomes more valuable when all three sides use it.

## What Are The Main Risks?

Product risks:

- The app must stay simpler than the phone-call workflow it replaces.
- The marketplace only works if both supply and demand show up in the same regions.
- Trust and biosecurity expectations may vary by livestock type and region.

Technical risks:

- Prototype state must be migrated into database-native flows without breaking demo reliability.
- RLS boundaries must remain strict as more data moves into Supabase.
- Matching should not be overbuilt before enough real transaction data exists.

Commercial risks:

- Payments and settlement must be designed carefully because rural trust, disputes, and refunds are sensitive.
- Transport operators need clear utilisation value, not another admin system.

## Current Security/Dependency Note

`npm audit` currently reports two moderate advisories through Next's internal PostCSS dependency. npm suggests a major downgrade path that is not appropriate for this app.

Current stance:

- Do not apply `npm audit fix --force`.
- Track Next.js patch releases.
- Re-run `npm audit` before the final investor-ready freeze.
- Treat this as a watch item unless a safe Next upgrade becomes available.

## What Should We Build Next?

In sprint order:

1. Keep `npm run verify:pitch` green.
2. Rehearse the live pitch twice with a timer.
3. Decide the payments/settlement story without building payment UI yet.
4. Convert the most important prototype interactions to database-native flows.
5. Add only the smallest amount of matching logic needed to support the demonstrated workflow.

## What Should We Avoid Saying?

Avoid:

- "Fully automated."
- "AI-powered."
- "Payments are done."
- "Uber for cattle."
- "Marketplace for everything farming."
- "Matching algorithm is complete."

Say instead:

PaddockME proves the coordination loop first. Payments and settlement are the next commercial unlock.

