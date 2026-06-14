# Current App Map

This map separates the guided PaddockME 2.0 MVP routes from the older app surfaces that still live in the repo.

## PaddockME 2.0 Guided Routes

- `/` - guided homepage and entry point.
- `/requests/new` - need feed: stock details.
- `/requests/new/requirements` - need feed: requirements.
- `/requests/matches` - find property: matching properties.
- `/properties/green-hills-farm` - property review before discussion.
- `/requests/sent` - discussion request sent.
- `/landowner/requests/1023` - landowner receives and accepts or declines the discussion request.
- `/workspaces/1023` - guided deal workspace overview.
- `/workspaces/1023/agreement` - discuss terms and build the agreement.
- `/workspaces/1023/review` - review agreement and send RFT.
- `/transport/quotes/1023` - receive transport quotes and accept a quote.
- `/transport/rooms/1023` - chat with the driver before booking transport.

## Auth Routes

- `/login`
- `/register`
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/update-password`
- `/onboarding`
- `/auth/callback`

## Legacy/Old App Routes

These are under the `(app)` route group and do not add URL prefixes.

- `/home`
- `/listings`
- `/listings/new`
- `/listings/mine`
- `/listings/[id]`
- `/listings/[id]/edit`
- `/matches`
- `/messages`
- `/profile`
- `/requests`
- `/request/new`
- `/request/new/requirements`
- `/map`
- `/agreements`

## Workspace/Agreement Routes

- Guided: `/workspaces/1023`, `/workspaces/1023/agreement`, `/workspaces/1023/review`
- Legacy: `/workspace`, `/workspace/[id]`, `/agreements`

## Transport/RFT Routes

- Guided: `/transport/quotes/1023`, `/transport/rooms/1023`
- Legacy: `/transport`, `/transport/[id]`, `/transport/available`, `/transport/calendar`, `/transport/earnings`, `/transport/jobs`
- Payments: `/payments/transport/sandbox`, `/payments/transport/success`, `/payments/transport/cancel`

## Demo-Only Routes

- `/properties/green-hills-farm`
- `/landowner/requests/1023`
- `/workspaces/1023`
- `/workspaces/1023/agreement`
- `/workspaces/1023/review`
- `/transport/quotes/1023`
- `/transport/rooms/1023`
- `/payments/transport/sandbox`

## Supabase-Backed Routes

- Auth/session: `/auth/callback`, `/sign-in`, `/sign-up`, `/forgot-password`, `/update-password`, `/onboarding`
- Legacy app data surfaces: `/map`, `/profile`, `/messages`, `/requests`, `/listings`, `/listings/[id]`, `/listings/[id]/edit`, `/workspace`, `/workspace/[id]`, `/agreements`, `/transport/jobs`, `/transport/calendar`
- API routes: `/api/locations/geocode`, `/api/payments/agistment-settlement`, `/api/payments/transport/checkout`, `/api/webhooks/stripe`
