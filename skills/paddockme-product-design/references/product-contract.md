# PaddockME product contract

## Users and conditions

| User | Primary job | Typical condition | UX priority |
| --- | --- | --- | --- |
| Livestock owner | Find feed, agree terms, arrange and track movement | Phone, time pressure, uncertain supply | Show the next loop action and confidence state |
| Landowner | List capacity, assess requests, agree terms | Phone/desktop, operational interruptions | Low-entry forms and clear obligations |
| Transport provider | Find, accept and execute movements | Phone in truck cab, one-handed, patchy signal | Large targets, strict status order, offline honesty |

Roles are stackable intent. Never assume one permanent role per account.

## Core loop

1. Owner creates agistment request.
2. Landowner creates paddock listing.
3. Owner selects a match.
4. System creates an agreement with exactly six sections.
5. Both parties resolve agreement sections.
6. Owner pushes an RFT (Request for Transport).
7. Carrier accepts the job.
8. Movement is tracked by milestone timeline, enhanced by live location.
9. Transport reaches completed with an event trail.
10. Payment/settlement closes the record honestly.

Every screen must identify where the user is in this loop and what moves it forward.

## Fixed language and privacy

- Use **RFT — Request for Transport** consistently.
- Agreement sections: stock type, duration, rate, start date, transport, special conditions.
- Transport status order: accepted, loading, in transit, arrived, completed.
- Carriers must never see private agistment pricing or agreement chat.
- Precise transport location is limited to agreement parties and carrier.
- Until money really moves, say that online payments are launching soon and settlement is direct; never show a false paid state.

## Live design sources

- Theme: `src/app/globals.css`
- Fonts: `src/app/layout.tsx`
- Navigation: `src/components/appNav.ts`, `AppSidebar.tsx`, `BottomNav.tsx`
- Primitives: `Button.tsx`, `Card.tsx`, `StatusBadge.tsx`, `PageHeader.tsx`
- Workflow context: `FlowContextBar.tsx`, `RequestProgress.tsx`, `LifecycleStepper.tsx`
- Core work surfaces: `AgreementPanel.tsx`, `SplitWorkspace.tsx`, `TransportPanel.tsx`, `Timeline.tsx`, `ChatPanel.tsx`

The live theme currently uses compact radii (4/6/8/10 token scale, with 8px common in components). Older README/design prose describing 14/16/18/22 radii or earlier colour hexes is stale. Never reintroduce those values without approval.

## Existing navigation contract

Desktop sidebar exposes My work, Workspace, Paddocks, Requests, Transport, Messages and Map. Mobile bottom navigation exposes the first five. One navigation truth lives in `appNav.ts`; do not fork it.

## Design locks and exclusions

- Agreement workspace layout/interactions are locked pending James's design approval.
- Feed marketplace is waitlist-only.
- Dark mode is an idea, not an approved requirement.
- New map layers require governance approval.
- Red/amber/green quality bars are rejected; literal rating bars already present are not permission to create a second general status language.
