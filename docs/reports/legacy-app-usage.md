# Legacy `(app)` Usage Report

Generated: 7 Jul 2026

Scope: read-only audit of route/support files under `src/app/(app)/**`. No legacy code was edited.

## Method

- Route/support inventory came from `rg --files "src/app/(app)"`, filtered to `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Outside-tree import scan:
  `rg -n "\(app\)|@/app|src/app/\(app\)" src --glob "!src/app/(app)/**"`
- Shared import scan:
  `rg -n "^import " "src/app/(app)"` and the same import grep across the guided tree (`src/app/requests`, `src/app/properties`, `src/app/workspaces`, `src/app/transport`, `src/app/account`, `src/app/register`, `src/app/login`, `src/app/page.tsx`, `src/app/PaddockHomepage.tsx`, `src/app/LandingMarketing.tsx`).
- For pages that import colocated clients, the local relative imports were followed so the route row includes the route's local client files.

## Outside-Tree Imports

No imports from outside `src/app/(app)/**` into the legacy tree were found.

The outside-tree grep returned one false positive comment only:

- `src/lib/supabase/middleware.ts:51` comments on "the old (app) dashboards"; it is not an import.

## Exact Shared Imports Found

Only exact `@/components/...` or `@/lib/...` module matches are listed here.

- `@/lib/utils`
  - Legacy evidence: `src/app/(app)/listings/ListingsClient.tsx:10`, `src/app/(app)/requests/RequestsClient.tsx:14`, `src/app/(app)/matches/page.tsx:12`, `src/app/(app)/workspace/[id]/WorkspaceClient.tsx:17`, `src/app/(app)/transport/[id]/RealTransportRoom.tsx:22`
  - Guided evidence: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7`, `src/app/register/RegisterCard.tsx:8`, `src/app/LandingMarketing.tsx:18`
- `@/components/paddockme/AnimalIcons`
  - Legacy evidence: `src/app/(app)/request/new/page.tsx:15`
  - Guided evidence: `src/app/requests/new/page.tsx:5`, `src/app/workspaces/[id]/live/page.tsx:20`, `src/app/workspaces/[id]/review/page.tsx:12`, `src/app/register/RegisterCard.tsx:7`, `src/app/PaddockHomepage.tsx:11`

## Route/Support File Inventory

| Legacy route/support file | Local route files included | Outside imports? | Shared guided imports |
| --- | --- | --- | --- |
| `src/app/(app)/agreements/page.tsx` | `AgreementsClient.tsx`, `page.tsx` | No | None |
| `src/app/(app)/error.tsx` | `error.tsx` | No | None |
| `src/app/(app)/home/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/layout.tsx` | `layout.tsx` | No | None |
| `src/app/(app)/listings/[id]/edit/page.tsx` | `EditListingClient.tsx`, `page.tsx` | No | None |
| `src/app/(app)/listings/[id]/page.tsx` | `ListingDetailClient.tsx`, `ListingPublishedFlash.tsx`, `page.tsx` | No | None |
| `src/app/(app)/listings/mine/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/listings/new/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/listings/page.tsx` | `ListingsClient.tsx`, `page.tsx` | No | `@/lib/utils` via `src/app/(app)/listings/ListingsClient.tsx:10`; guided examples: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7` |
| `src/app/(app)/loading.tsx` | `loading.tsx` | No | None |
| `src/app/(app)/map/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/matches/page.tsx` | `page.tsx` | No | `@/lib/utils` via `src/app/(app)/matches/page.tsx:12`; guided examples: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7` |
| `src/app/(app)/messages/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/not-found.tsx` | `not-found.tsx` | No | None |
| `src/app/(app)/profile/page.tsx` | `ProfileClient.tsx`, `page.tsx` | No | None |
| `src/app/(app)/request/new/page.tsx` | `page.tsx` | No | `@/components/paddockme/AnimalIcons` via `src/app/(app)/request/new/page.tsx:15`; guided examples: `src/app/requests/new/page.tsx:5`, `src/app/workspaces/[id]/review/page.tsx:12` |
| `src/app/(app)/request/new/requirements/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/requests/page.tsx` | `RequestsClient.tsx`, `page.tsx` | No | `@/lib/utils` via `src/app/(app)/requests/RequestsClient.tsx:14`; guided examples: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7` |
| `src/app/(app)/transport/[id]/page.tsx` | `RealTransportRoom.tsx`, `TransportRouteClient.tsx`, `page.tsx` | No | `@/lib/utils` via `src/app/(app)/transport/[id]/RealTransportRoom.tsx:22`; guided examples: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7` |
| `src/app/(app)/transport/available/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/transport/calendar/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/transport/earnings/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/transport/jobs/page.tsx` | `RealJobsBoard.tsx`, `page.tsx` | No | None |
| `src/app/(app)/transport/page.tsx` | `page.tsx` | No | None |
| `src/app/(app)/workspace/[id]/page.tsx` | `WorkspaceClient.tsx`, `WorkspaceRouteClient.tsx`, `page.tsx` | No | `@/lib/utils` via `src/app/(app)/workspace/[id]/WorkspaceClient.tsx:17`; guided examples: `src/app/workspaces/[id]/live/page.tsx:24`, `src/app/transport/rooms/[id]/page.tsx:7` |
| `src/app/(app)/workspace/page.tsx` | `page.tsx` | No | None |

## Notes

- Most legacy routes still use the older shared shell modules (`@/components/Button`, `@/components/Card`, `@/components/PageHeader`, `@/components/StatusBadge`, `@/lib/data/serverPaddocks`, `@/lib/data/repositories`, `@/lib/supabase/currentUser`). Those modules are not exact imports in the current guided tree.
- The only `paddockme` component import found in a legacy route file is `@/components/paddockme/AnimalIcons` on `src/app/(app)/request/new/page.tsx`.
