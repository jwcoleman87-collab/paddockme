---
name: paddockme-product-design
description: Design, critique, implement, or visually verify PaddockME web UI and UX. Use for PaddockME screens, workflows, components, responsive behaviour, accessibility, visual polish, or product copy. Applies the repository's real Next.js/Tailwind design system, rural mobile-use constraints, core-loop rules, locked-surface rules, and verification gates.
---

# PaddockME Product Design

Improve the real product, not an imagined redesign. Optimise for a farmer using a phone one-handed, outdoors, under time pressure, and sometimes with poor reception.

## Start here

1. Read `PADDOCKME_MASTER_SPEC.md`, especially sections 4–8 and the page being changed.
2. Read `docs/product/PRINCIPLES.md`, `src/app/globals.css`, and the affected route/components.
3. Read [references/product-contract.md](references/product-contract.md).
4. For multi-screen, navigation, agreement, transport, payment, identity, or data-sharing work, read [references/ux-workflow.md](references/ux-workflow.md).
5. Treat live code as visual ground truth when subordinate docs contain stale token values. Treat the master spec as product-behaviour authority.

## Decide the task level

- **Small:** copy, spacing, component or single-state correction. Inspect locally, implement, verify.
- **Medium:** new screen or substantial single-screen redesign. Define user goal, hierarchy, states, responsive behaviour and accessibility before implementation.
- **High:** multi-screen/core-loop/navigation/trust-sensitive change. Produce the UX contract and stop for James's approval before implementation.

Ask only when ambiguity materially changes product behaviour. Do not ask for aesthetic preferences already answered by the repository.

## Non-negotiable sequence

1. State the user, current loop position, single next action and recovery action.
2. Inventory existing components and tokens before proposing new ones.
3. Model relevant loading, empty, ready, error, offline, disabled and completed states. Every non-success state needs a visible recovery.
4. Preserve one dominant next action per screen mode. Explicit two-way decisions may have peer actions.
5. Implement with existing components and Tailwind theme tokens.
6. Verify at 390px first, then 768px, 1024px and 1440px where relevant.
7. Render and inspect changed UI when the environment permits. Text-only review is insufficient for visual changes.

## Product judgement

- Remove coordination steps; do not add explanatory machinery to compensate for unclear flow.
- Optimise for successful livestock-to-feed matches, not marketplace engagement metrics.
- Prefer taps, chips, cards, sliders and sensible defaults over typing.
- Each completed step must clearly hand the user to the next core-loop step.
- Use plain Australian rural language. Standard actions use standard labels.
- Do not fabricate users, prices, telemetry, livestock data or completed payments to make screens look populated.
- Poor connectivity must degrade honestly. Preserve useful local/last-known state and explain what will sync when supported.

## Visual direction

Call the established direction **Pastoral Operational**: warm Australian agricultural surfaces with restrained editorial brand moments and highly legible operational UI.

- Use Outfit for application UI. Use italic Fraunces only for the wordmark and selected marketing/hero moments.
- Use only named colours and radii from `src/app/globals.css`; do not copy stale hex or radius values from prose docs.
- Sage is the action/brand language; ochre adds warmth and emphasis. Status always includes text/icon, never colour alone.
- Prefer calm borders, restrained shadows and compact 8px-style radii already used in live components.
- Use Lucide icons only. No emoji or Unicode glyph substitutes.
- Imagery must explain property, stock, route or context; it must not push the primary task below the fold.
- Reject generic SaaS purple, cold dark dashboards, excessive glass, decorative gradients, oversized marketing headings on task screens, and random card/shadow values.

## Reuse before creation

Search `src/components` before adding a primitive. Prefer `AppShell`, `PageHeader`, `Button`/`ButtonLink`, `Card`, `StatusBadge`, `SelectablePill`, `SearchablePicker`, `FlashProvider`, `Timeline`, `ListingCard`, `SplitWorkspace`, and the existing map/transport/agreement components.

Do not create a second button, card, badge, navigation or flash-message language to solve a local screen.

## Accessibility and mobile contract

- Keep primary controls at least 44 CSS px high; preserve adequate spacing between adjacent targets.
- Keep P0 title/status/instruction/action visible or immediately reachable on compact screens.
- Never rely on hover, colour, motion or icons alone.
- Preserve semantic labels, logical heading order, keyboard focus, focus restoration and screen-reader announcements for meaningful state changes.
- Support text wrapping and zoom; do not hide critical content behind truncation.
- Respect safe-area insets and `prefers-reduced-motion`.
- Avoid nested scrolling and horizontal workflow layouts on compact screens.

## Stop conditions

Stop and ask James before implementation when:

- the change redesigns the agreement workspace; it is design-locked;
- navigation or the core ten-step loop changes;
- a new system primitive or unapproved token is required;
- two primary actions compete and product context does not resolve them;
- the UI would imply unavailable functionality, money movement or live tracking;
- accessibility requires changing the interaction model;
- a new state appears that the approved model does not cover.

Functional and persistence fixes may touch a locked surface only when layout and interaction remain unchanged.

## Verification

Run commands that fit the change, culminating in:

```bash
npm run typecheck
npm run build
```

For pitch/demo-facing changes run:

```bash
npm run verify:pitch
```

Check for raw visual values and accessibility regressions with targeted `rg` searches. Capture before/after screenshots for UI changes when possible. Report visual QA as unavailable when it cannot be performed; never silently claim it passed.

## Output discipline

For a small task, give the decision, implementation and verification briefly. For medium/high design work, provide only the task-relevant user goal, hierarchy, state model, interaction contract, responsive rules, component/token reuse, accessibility requirements and approval gate. Avoid mechanical template filling.
