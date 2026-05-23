# PaddockME

> Reduce agricultural coordination friction.

**PaddockME is an Australian agistment marketplace** — connecting livestock owners who need pasture, landowners with spare paddocks, and transport drivers who move stock between them. Replaces the phone tag, Facebook posts, and saleyard hand-shakes with one workspace per match.

**Current sprint:** [Investor MVP Sprint](docs/INVESTOR_MVP_SPRINT.md) - a three-day push toward a tight, pitch-ready demo.

**Live demo:** https://paddockme-oz51.vercel.app

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 (CSS-based theme config)
- **Database + auth:** Supabase (Postgres + Auth + RLS)
- **UI primitives:** lucide-react icons + hand-rolled Tailwind components
- **Deployment:** Vercel (auto-deploys on push to `main`)

## Local development

Prerequisites: Node 20+ and npm.

```bash
git clone https://github.com/<your-account>/paddockme.git
cd paddockme

# Copy the env template and paste in the Supabase values from your dashboard
cp .env.example .env.local

# Install dependencies and start the dev server
npm install
npm run dev
```

The app boots at `http://localhost:3000`.

### Useful scripts

```bash
npm run dev          # Local development server
npm run verify:pitch # Typecheck, build, production smoke, and browser click rehearsal
npm run build        # Production build check
npm run demo:smoke   # Production demo route/content smoke test
npm run demo:click   # Production browser click rehearsal for the pitch path
npm run db:types     # Regenerate Supabase database types
```

## Investor demo workflow

Use these docs as the single source of truth for the current pitch path:

- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) - five-minute narrated product demo
- [`docs/DEMO_CHEATSHEET.md`](docs/DEMO_CHEATSHEET.md) - one-page run sheet for the live demo
- [`docs/DEMO_REHEARSAL_LOG.md`](docs/DEMO_REHEARSAL_LOG.md) - latest local/live rehearsal notes
- [`docs/CURRENT_PRODUCT_AUDIT.md`](docs/CURRENT_PRODUCT_AUDIT.md) - current inventory of built routes, data, and demo limits
- [`docs/INVESTOR_MVP_SPRINT.md`](docs/INVESTOR_MVP_SPRINT.md) - Day 1/2/3 readiness tracker
- [`docs/INVESTOR_PITCH_NOTES.md`](docs/INVESTOR_PITCH_NOTES.md) - founder talk track and close
- [`docs/INVESTOR_DILIGENCE_QA.md`](docs/INVESTOR_DILIGENCE_QA.md) - honest Q&A for investor follow-up
- [`docs/CUSTOMER_VALIDATION_GUIDE.md`](docs/CUSTOMER_VALIDATION_GUIDE.md) - interview guide for Dale/Brett/Wayne validation
- [`docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md`](docs/PAYMENTS_SETTLEMENT_BLUEPRINT.md) - next commercial unlock without claiming it is built

Before pushing pitch-facing changes:

```bash
npm run verify:pitch
```

### Required environment variables

Set these in `.env.local` for local dev, and in the Vercel project settings for deploys.

| Key | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API → `service_role` key (server-only, never expose) |

## Folder structure

```
src/
  app/
    (app)/                 # Foundation skeleton app shell
      home/
      request/new/
      listings/
      listings/new/
      listings/[id]/
      matches/
      workspace/
      workspace/[id]/
      map/
      transport/
      transport/[id]/
      agreements/
      profile/
      layout.tsx
    (auth)/                # Sign-in, sign-up, onboarding
      sign-in/
      sign-up/
      onboarding/
    auth/callback/         # OAuth + magic-link callback
    layout.tsx             # Root layout — fonts, metadata
    page.tsx               # Homepage / onboarding entry
    globals.css            # Tailwind v4 @theme + base styles
  components/
    AppShell.tsx
    BottomNav.tsx
    PageHeader.tsx
    Button.tsx
    Card.tsx
    StatusBadge.tsx
    SelectablePill.tsx
    SplitWorkspace.tsx
    AgreementPanel.tsx
    ChatPanel.tsx
    Timeline.tsx
    ListingCard.tsx
    DummyMap.tsx
  lib/
    dummyData.ts           # Clickable prototype data
    supabase/
      client.ts            # Browser client (Client Components)
      server.ts            # Server client (Server Components, Route Handlers)
      middleware.ts        # Session refresh used by proxy
    types/
      database.ts          # Generated from Supabase schema
    utils.ts               # cn() helper (clsx + tailwind-merge)
  proxy.ts                 # Top-level Next proxy → calls lib/supabase/middleware
docs/
  PRINCIPLES.md            # Core platform DNA
  SCOPE.md                 # What NOT to build yet + day-one DoD
  PERSONAS.md              # Dale, Tash, Brett, Lyn, Wayne, Sharon
  DESIGN_INTELLIGENCE.md   # ui-ux-pro-max recommendations + brand deviations
  BUILD_02.md              # Foundation Build 02 — workspace and agreement flow polish
  CURRENT_PRODUCT_AUDIT.md # Current built-product inventory
  DEMO_SCRIPT.md           # Investor demo path
  DEMO_CHEATSHEET.md       # One-page live demo run sheet
  DEMO_REHEARSAL_LOG.md    # Latest smoke/rehearsal results
  INVESTOR_MVP_SPRINT.md   # Three-day MVP tracker
  INVESTOR_PITCH_NOTES.md  # Pitch talk track
  INVESTOR_DILIGENCE_QA.md # Investor follow-up Q&A
  CUSTOMER_VALIDATION_GUIDE.md # Customer interview guide
  PAYMENTS_SETTLEMENT_BLUEPRINT.md # Payments/settlement product blueprint
scripts/
  demo-smoke.mjs           # Production smoke test for the demo route set
  demo-click.mjs           # Production browser click rehearsal for the demo path
```

## Deployment

- The `main` branch auto-deploys to Vercel.
- Pull-request branches get preview deploys.
- Migrations live in Supabase (apply via the Supabase dashboard or MCP).
- After a domain change, update Supabase → Authentication → URL Configuration with the new Site URL + Redirect URLs.

## Design system

- **Display font:** Fraunces (italic, 400/600/700/800) - opt-in via `.font-display` for brand and hero moments only.
- **App/body font:** Outfit (300-800) - used for operational headings, forms, labels, cards, and workflow screens.
- **Palette:**
  - Sage — `#5B8C5A` (default) / `#3D6B3C` (dark) / `#2C5030` (deep) / `#E7F0E6` (mist) / `#D0E8CF` (glow)
  - Ochre — `#D4A853` / `#F2E4C1` (light)
  - Terra — `#C47B5A` / `#F0DDD3` (light)
  - Wheat `#F5ECD7`, Cream `#FAF8F3`, Warm-white `#FDFCF9`
  - Bark `#5C4033`, Stone `#8C8478`, Mist `#E8E5DF`
  - Match `#3BA55D` / `#E6F5EB`, Amber `#D49B3A` / `#FDF3E0`
- **Border radii:** 14 / 16 / 18 / 22 (default / lg / xl / 2xl).

### No emoji for state

Status indicators always use [lucide-react](https://lucide.dev) icons: `CheckCircle`, `AlertCircle`, `XCircle`, `Check`, `AlertTriangle`, `X`. No emoji characters anywhere — code, markdown, comments, or commits.

## Core platform DNA

Every screen and decision is tested against the five principles in [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md). If something you're building doesn't serve them, stop and flag it.

## Design intelligence

The repo includes the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill at `.uipro-skill/` — a design-intelligence database with 67 UI styles, 161 colour palettes, 161 industry-specific reasoning rules, and a Python search engine that generates recommended design systems from a product description.

Use it as a second opinion when designing new pages. Run from the repo root:

```bash
python3 .uipro-skill/scripts/search.py "<product description>" --design-system -p "<project name>"
```

Adoption notes (what we kept, what we deviated from, and why) live in [`docs/DESIGN_INTELLIGENCE.md`](./docs/DESIGN_INTELLIGENCE.md). The brief and `globals.css` remain the source of truth for palette and typography; the skill is authoritative on patterns, anti-patterns, and the pre-delivery checklist.
