# Design Intelligence

This doc captures the output of the **ui-ux-pro-max** skill (installed at `.uipro-skill/`) when run against PaddockME's contexts, and notes which recommendations we adopt, which we deviate from, and why. The skill is a 73k-star design-intelligence database (67 UI styles, 161 color palettes, 161 industry-specific reasoning rules) that generates a recommended design system from a product description.

The brief is the source of truth for the visual direction. The skill is a second opinion — useful for marketplace patterns, anti-patterns, and the pre-delivery QA checklist; not authoritative on palette or typography (it doesn't know our brand intent).

---

## How to re-run the skill

From the repo root:

```bash
# Generate a design system for any context
python3 .uipro-skill/scripts/search.py "<product description>" --design-system -p "<project name>"

# Markdown output (rather than ASCII tables) for docs
python3 .uipro-skill/scripts/search.py "<...>" --design-system -p "<...>" -f markdown

# Domain-specific lookups
python3 .uipro-skill/scripts/search.py "earthy sage natural" --domain color
python3 .uipro-skill/scripts/search.py "elegant serif" --domain typography
python3 .uipro-skill/scripts/search.py "glassmorphism" --domain style

# Stack-specific guidance
python3 .uipro-skill/scripts/search.py "form validation" --stack react
python3 .uipro-skill/scripts/search.py "responsive layout" --stack html-tailwind
```

Python 3 is required. See `.uipro-skill/SKILL.md` for the full feature list and the upstream README.

---

## Recommendation 1 — Marketplace surfaces (landing page, /home, /matches)

Run: `python3 .uipro-skill/scripts/search.py "agistment marketplace livestock pasture farmers Australia agricultural" --design-system -p "PaddockME"`

| Field | Skill recommendation | Our decision |
| --- | --- | --- |
| **Pattern** | Marketplace / Directory — search-bar hero, categories, featured listings, trust/safety section, "become a host" CTA | **Adopt structurally.** The /home dashboard becomes a search-first surface for livestock owners. The /matches page becomes the "featured listings" equivalent. A "list your paddock" CTA goes prominently in the nav for landowners. |
| **Style** | Vibrant & Block-based (bold, energetic, playful, high contrast, duotone) | **Reject.** This skews toward generic startups/social/youth. Our brief mandates a warm, agricultural, professional feel. Sage + earthy + Fraunces-italic is the brand. |
| **Colors** | Primary `#7C3AED` purple + accent `#16A34A` green ("trust purple + transaction green") | **Reject.** Replaced by sage `#5B8C5A` + ochre `#D4A853` accent (already in `globals.css`). Purple has zero connection to Australian rural identity. |
| **Typography** | Inter / Inter | **Reject.** Fraunces (display, italic) + Outfit (body) is the brief. Inter is fine but generic — Fraunces gives the marketplace warmth that purple-and-Inter would erase. |
| **Effects** | Large 48px+ gaps, animated patterns, bold hover (colour shift), scroll-snap, 200–300ms transitions | **Adopt selectively.** 200–300ms transitions: yes. Colour-shift hovers: yes. Scroll-snap on the matches list: yes when we build it. Large gaps: yes on landing, no on dashboard surfaces. |
| **Avoid** | Low trust signals; confusing layout | **Adopt.** Trust signals (verifications, ratings, successful-match counts) are explicitly modelled in the `profiles` schema for this reason. |

## Recommendation 2 — Authenticated workspace (/workspace, /home, /matches)

Run: `python3 .uipro-skill/scripts/search.py "agistment workspace dashboard for livestock owners viewing matches managing agreements" --design-system -p "PaddockME Workspace" -f markdown`

| Field | Skill recommendation | Our decision |
| --- | --- | --- |
| **Pattern** | Real-Time / Operations Landing — hero with live preview, key metrics/indicators, how-it-works, CTA | **Adopt.** The /home authenticated dashboard becomes a live-state surface: how many active agreements, livestock currently agisted, weeks remaining, weather/condition updates. |
| **Style** | Data-Dense Dashboard (multiple charts/widgets, KPI cards, minimal padding, grid layout) | **Adopt structurally; soften visually.** Use grid + KPI cards for the agreement-active state, but keep the warm sage + cream palette and the rounded-corner radii (14/16/18/22) we've already set — not the cold `#020617` near-black the skill defaults to. |
| **Colors** | Dark `#020617` background + green positive indicators | **Reject the dark base.** Our agricultural palette stays. Use `match #3BA55D` and `amber #D49B3A` (already in tokens) for status indicators. |
| **Typography** | Fira Code / Fira Sans (technical, precise, monospace) | **Reject.** Fraunces + Outfit hold. Use Outfit for tabular data, Fraunces for the few italic display labels. We're not a coding tool; precision-mono fonts would be wrong here. |
| **Effects** | Hover tooltips, chart zoom on click, row highlighting on hover, smooth filter animations, data loading spinners | **Adopt all.** These are universal good-practice patterns. |
| **Avoid** | Ornate design; no filtering | **Adopt.** Especially "no filtering" — all list views (matches, paddocks, requests) need region / stock-type / urgency filters from the start. |

---

## Pre-delivery checklist (adopted verbatim)

Apply this before shipping any new screen. The skill returns this list for every recommendation; it's universally good QA.

- [ ] No emojis as icons — use SVG via lucide-react (`CheckCircle`, `AlertCircle`, `XCircle`, `Check`, `AlertTriangle`, `X`)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

The first item is already in our [PRINCIPLES.md](./PRINCIPLES.md) — restated here for emphasis.

## Anti-patterns to actively avoid

Synthesised across the skill's industry-specific outputs and our brief:

- **Generic SaaS purple-and-pink.** Common default for AI-era marketplaces. Wrong for rural Australia. We are sage and ochre.
- **Cold dashboard dark mode.** The skill defaults to `#020617` for dashboards. We keep the warm `#FDFCF9` warm-white as base.
- **Long text-input forms.** The brief is explicit: low typing, high selection. Sliders and chips, not text fields.
- **Emoji as state indicators.** Never. lucide-react icons only.
- **Free-text region/location fields.** Use a chip-style picker mapped to defined Australian regions (NSW Central West, VIC Gippsland, etc.).
- **Hidden CTAs.** A landowner needs the "list your paddock" CTA above-the-fold. A livestock owner needs "post a request" above-the-fold. Both flows need to be discoverable in 3 seconds.

---

## How to use this doc going forward

1. **When designing a new page**, re-run the skill with that page's specific context (e.g. `"agistment request creation form for cattle owners selecting region duration head count"`) and check what it suggests.
2. **For visual choices** (palette, fonts, radii), defer to `globals.css` — that's the brand. Don't let the skill override it.
3. **For structural choices** (sections, CTAs, KPIs, anti-patterns), the skill is a strong second opinion. Most of its recommendations are universally good UX.
4. **For the pre-delivery checklist**, treat it as a hard gate before merging any new page.

Re-running the skill costs nothing and keeps each new page honest against industry-standard patterns.
