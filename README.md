# PaddockME

> Reduce agricultural coordination friction.

**PaddockME is an Australian agistment marketplace** — connecting livestock owners who need pasture, landowners with spare paddocks, and transport drivers who move stock between them. Replaces the phone tag, Facebook posts, and saleyard hand-shakes with one workspace per match.

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
    (app)/                 # Authenticated app shell — bottom nav lives here
      home/
      request/new/
      matches/
      workspace/
      map/
      transport/
      profile/
      layout.tsx
    (auth)/                # Sign-in, sign-up, onboarding
      sign-in/
      sign-up/
      onboarding/
    auth/callback/         # OAuth + magic-link callback
    layout.tsx             # Root layout — fonts, metadata
    page.tsx               # Marketing landing
    globals.css            # Tailwind v4 @theme + base styles
  components/
    ui/                    # Reusable UI primitives
    paddock/               # PaddockCard, MatchScore, etc.
    workspace/             # AlignmentEngine, agreement components
    shared/                # Header, BottomNav, layout pieces
  lib/
    supabase/
      client.ts            # Browser client (Client Components)
      server.ts            # Server client (Server Components, Route Handlers)
      middleware.ts        # Session refresh + auth gate logic used by proxy
    types/
      database.ts          # Generated from Supabase schema
    utils.ts               # cn() helper (clsx + tailwind-merge)
  proxy.ts                 # Top-level Next proxy → calls lib/supabase/middleware
docs/
  PRINCIPLES.md            # Core platform DNA
  SCOPE.md                 # What NOT to build yet + day-one DoD
  PERSONAS.md              # Macca, Trev & Ros, Sam, Jen, Dale
```

## Deployment

- The `main` branch auto-deploys to Vercel.
- Pull-request branches get preview deploys.
- Migrations live in Supabase (apply via the Supabase dashboard or MCP).
- After a domain change, update Supabase → Authentication → URL Configuration with the new Site URL + Redirect URLs.

## Design system

- **Display font:** Fraunces (italic, 400/600/700/800) — used for `h1`, `h2`, `h3`, and any `.font-display`. All headings render in italic by default.
- **Body font:** Outfit (300–800).
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

Every screen and decision is tested against the four principles in [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md). If something you're building doesn't serve them, stop and flag it.

## Design intelligence

The repo includes the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill at `.uipro-skill/` — a design-intelligence database with 67 UI styles, 161 colour palettes, 161 industry-specific reasoning rules, and a Python search engine that generates recommended design systems from a product description.

Use it as a second opinion when designing new pages. Run from the repo root:

```bash
python3 .uipro-skill/scripts/search.py "<product description>" --design-system -p "<project name>"
```

Adoption notes (what we kept, what we deviated from, and why) live in [`docs/DESIGN_INTELLIGENCE.md`](./docs/DESIGN_INTELLIGENCE.md). The brief and `globals.css` remain the source of truth for palette and typography; the skill is authoritative on patterns, anti-patterns, and the pre-delivery checklist.
