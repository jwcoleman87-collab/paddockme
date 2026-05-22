# Investor Pitch Notes

Use this as the spoken spine for the investor demo. Keep it short; the product should do most of the work.

## One-Liner

PaddockME turns agistment from phone tag into one coordinated workspace for livestock, land and transport.

## The Problem

Australian agistment is operationally important but still coordinated through calls, texts, Facebook posts, spreadsheets and handshake terms.

That creates three expensive failures:

- Livestock owners waste time finding feed when the season turns.
- Landowners hesitate to take outside stock because trust, terms and biosecurity feel messy.
- Transport operators lose money on empty kilometres and duplicated paperwork.

## The Demo Story

Dale needs feed.

Brett has spare country.

Wayne can move the cattle.

PaddockME gives them a shared agreement workspace and a separate transport room so the deal and the movement can progress without losing context.

## What To Show

1. Landing page: three-sided marketplace, one workflow.
2. `/agreements`: Dale's work queue.
3. `/workspace/agreement-glenbarra`: sections, agreement state, chat context.
4. `/transport/transport-glenbarra`: three-party logistics room, rate visibility boundary.
5. `/messages`: proof that work creates conversation threads.
6. `/requests`: Brett can proactively offer a paddock against open demand.

## What Is Real Today

- Next.js app deployed on Vercel.
- Supabase auth and Postgres schema.
- RLS-backed privacy boundaries for agreements, transport jobs and transport quotes.
- Prototype state for the investor walkthrough.
- Real product surfaces, not Figma screens.

## What Is Not Yet Real

- Payments.
- Escrow or settlement.
- GPS/telematics integration.
- Real verification services.
- A full matching algorithm.

Say this plainly. It builds trust.

## Roadmap Line

Once the agreement workflow is stable, the commercial unlock is payment and settlement rails: quote, agree, move stock, settle.

## Phrases To Avoid

- "Marketplace for everything farming."
- "AI-powered agistment."
- "Uber for cattle."
- "Fully automated."
- "Payments are done."

## Strong Close

Three personas, three sides of the deal, one coordinated workflow. The MVP proves the coordination loop; payments turn it into the transaction layer.

