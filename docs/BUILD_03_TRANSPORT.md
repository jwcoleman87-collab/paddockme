# Foundation Build 03 — Transport, The Third Leg

This brief covers the third build phase. Foundation Build 01 delivered the skeleton; Foundation Build 02 ([BUILD_02.md](./BUILD_02.md)) made the 2-party agistment workspace and 3-party transport room feel like real coordination surfaces. Build 03 is about **lifting transport from a sidecar into a co-equal pillar**.

Three sides of the marketplace, three legs of the table:

1. **Livestock owners** — Dale (crisis-driven), Tash (continuous-use)
2. **Landowners** — Brett (active farmer with spare grass), Lyn (semi-retired)
3. **Transport** — Wayne (single-truck owner-operator), Sharon (multi-truck family business)

After Build 02, legs 1 and 2 have rich product surfaces — request flow, listings with chip filters, scored matches, the workspace, lifecycle, persona switcher on the home view. Leg 3 has a room (the 3-party transport surface) but no marketplace, no pricing, and no presence in the rest of the app beyond a footer link from the workspace.

Build 03 fixes that.

> Guiding principle for this build: **transport is co-equal, not a sidecar.** Anywhere the app surfaces the agistment relationship (workspace, matches, home view), it should also surface the transport relationship at the appropriate visibility.

## Build sequence

Six steps. The order matters — pricing and visibility have to land before the marketplace pieces, or the marketplace exposes commercial detail we'd rather keep walled.

### 1. Transport summary in the agreement workspace

A new **Transport** tab in `AgreementPanel`, between Lifecycle and Timeline. Livestock-owner-friendly card showing:

- Driver assigned (or "Not assigned yet")
- Movement status (Booked / Loading / In Transit / Arrived)
- Key dates — pickup confirmed at, ETA, arrival recorded
- Confirmations summary — `pickup ✓ / route ✓ / delivery pending`
- Transport rate (only visible to Farmer A — see step 2)
- "Open transport room" CTA into the full 3-party surface

The tab eliminates the "bounce out to the transport room to check status" friction. Farmer A stays in the workspace and sees what they need to see.

### 2. Transport pricing — the second privacy wall

Build 02 enforced the **driver-visibility wall**: drivers see logistics, never agistment pricing. Build 03 introduces the symmetric **landowner-visibility wall** on the transport side: the landowner sees pickup/arrival logistics, never the transport rate.

Data model: a new `transport_quotes` table sitting alongside `transport_jobs`. Each row is a price proposal — `basis` (`per_head` / `per_km` / `flat`), `amount`, `currency`, `payment_terms`, `status` (`pending` / `accepted` / `rejected` / `countered`), with `previous_quote_id` linking counter-offers into a chain.

RLS: rows visible only to the parent transport job's `livestock_owner_id` and `driver_id`. The landowner never appears in the SELECT policy. Two walls, mirror-image:

- **Driver-visibility wall** (Build 02): drivers excluded from `agreements` rows → drivers can't SELECT `rate_per_head_week`.
- **Landowner-visibility wall** (Build 03): landowners excluded from `transport_quotes` rows → landowners can't SELECT the haulage rate.

UI: a Rate sub-section inside the transport room, conditionally rendered. Driver proposes; Farmer A accepts or counters; system message in chat each time. Farmer B sees nothing about it.

### 3. Farmer-created RFTs first

Correction from product review: the driver map is not for truckies to post return legs as the main action. Farmer A and Farmer B raise the transport request from an agistment agreement; carriers then see those RFT routes and quote or accept the work.

Wayne and Sharon still care deeply about utilisation, but PaddockME should surface demand first: agreement-backed RFTs waiting for a carrier.

A new `transport_capacity` model lets a driver post:

- Origin region → destination region
- Date window (earliest / latest)
- Head capacity (and stock types they'll carry)
- Indicative rate (rate basis + amount, optional)

Profile-carries-the-difference: Wayne posts one capacity row at a time; Sharon's dispatch publishes capacity per truck across her fleet. Same form, same table — the volume difference lives in the operator's profile, not in separate surfaces.

### 4. Transport RFT browsing surface

`/transport/jobs` is the primary carrier surface: drivers browse farmer-created RFTs and accepted runs. `/transport/available` remains secondary carrier-capacity context, not the main path.

Symmetry: today a farmer can browse paddocks but not trucks. After this step, they can browse both.

### 5. RFT visibility for drivers

A driver confirmed on a job needs to see the farmer-created RFTs near that movement, without seeing private agistment terms.

UI: inside a confirmed transport room, an "Open RFTs" panel listing transport requests that:

- Come from an agreement between Farmer A and Farmer B
- Expose pickup, delivery, stock, route, and timing
- Hide agistment rate and private paddock terms from the driver

For Wayne this means one clear route board. For Sharon it means a list across the fleet's operating regions. Single dial that turns transport from phone-tag opportunism into systematic route quoting.

### 6. Settlement readiness — modelled, not wired

Stripe and money movement remain explicitly out of scope (carry-forward from Build 01's "what NOT to build yet"). But by the end of Build 03 the schema knows about quotes, accepted rates, and the parties to each rate — so wiring settlement later is a thin layer rather than a redesign.

What's modelled now:

- `transport_quotes.accepted_at` timestamp
- Sub-contractor flag on transport_profiles (Sharon's drivers vs Wayne flying solo)
- Payment terms text per quote (placeholder: free-text "net 14")

## Data model deltas

Three new tables and one extension to existing types.

### `transport_quotes`

```
id                   uuid pk
transport_job_id     uuid fk -> transport_jobs(id)
proposed_by          uuid fk -> profiles(id)
basis                text   -- 'per_head' | 'per_km' | 'flat'
amount               numeric
currency             text   default 'AUD'
payment_terms        text
status               text   -- 'pending' | 'accepted' | 'rejected' | 'countered'
previous_quote_id    uuid nullable fk -> transport_quotes(id)
accepted_at          timestamptz nullable
created_at           timestamptz
updated_at           timestamptz
```

RLS: read + write gated on `auth.uid() in (livestock_owner_id, driver_id)` via a join to `transport_jobs`. The landowner is *not* on the read policy.

### `transport_capacity`

```
id                   uuid pk
driver_id            uuid fk -> profiles(id)
truck_label          text nullable  -- Sharon: "SM B-D 04", Wayne: null or "B-double"
origin_region        text
destination_region   text
earliest_date        date
latest_date          date
head_capacity        integer
stock_types          text[]
rate_basis           text nullable
rate_amount          numeric nullable
status               text  -- 'published' | 'booked' | 'withdrawn'
created_at           timestamptz
updated_at           timestamptz
```

RLS: public SELECT (marketplace discovery, same as `paddocks`). Driver-only INSERT / UPDATE / DELETE.

### `transport_jobs` extensions

Add `accepted_quote_id uuid nullable fk -> transport_quotes(id)` so the "this is the active commercial deal" pointer is explicit. The job's coordination state stays in `coordination_state` JSONB; the rate state lives in the linked quote.

## Privacy walls — two, not one

The driver-visibility rule was load-bearing for Build 02 and stays. Build 03 introduces the symmetric rule on the other axis.

| Wall | Excludes | Excluded from |
| --- | --- | --- |
| Driver-visibility (Build 02) | Driver | `agreements` rows → can't read `rate_per_head_week` |
| Landowner-visibility (Build 03) | Landowner | `transport_quotes` rows → can't read transport rate |
| All-party logistics | Nobody on the job | `transport_jobs` row → all three parties can read pickup, route, delivery |

Each row of the table reads as "X is excluded from Y." The third row is the shared surface — what everyone needs to coordinate the actual movement.

Both walls enforced at the data layer via RLS, not just the UI. Same standard as Build 02.

## What's IN scope

- Transport tab in `AgreementPanel` with role-aware rendering (Farmer A sees rate; Farmer B doesn't)
- `transport_quotes` table with RLS enforcing the landowner-visibility wall
- Rate negotiation UI in the transport room (propose / accept / counter / reject)
- Farmer-created RFTs exposed through `/transport/jobs`
- `/transport/available` retained as secondary carrier-capacity context
- Driver-side quote/accept flow from the RFT board
- Open RFT panel inside a confirmed transport room
- Profile-carries-the-difference applied to the carrier view (Wayne single-truck, Sharon multi-truck later)
- System messages in transport chat for every quote / acceptance / counter
- Audit history of quote chains
- Migration files in `supabase/migrations/` keeping schema as code

## What's still NOT in scope

Carry forward from Build 01 and Build 02:

- Real money movement / Stripe / payments — quotes are numbers on screen; nothing transfers
- Real GPS / telematics — fake animated dot is fine
- AI route optimisation — chips and filters, not algorithms
- Real e-signatures on quote acceptance — a mutual click is enough
- Reviews and ratings of drivers
- Driver fatigue / hours-of-service automation (NHVAS) — placeholder data only
- Multi-truck dispatch board for Sharon — capacity publishing is per-truck, but a full fleet console is a later build
- Insurance verification — placeholders match the existing profile pattern

## Definition of done

When Build 03 finishes, the user must be able to:

| Item | Status |
| --- | --- |
| Open an agreement workspace and see a Transport tab with live status alongside the existing tabs | pending |
| Switch to Farmer B in the workspace and see no transport rate anywhere | pending |
| Open the transport room as Wayne and see the rate; switch to Farmer A and see the rate; switch to Farmer B and see no rate field | pending |
| Confirm via SQL that the landowner cannot SELECT `transport_quotes.amount` for any row tied to their agreement | pending |
| Raise a transport RFT from the agreement workspace and see it appear on `/transport/jobs` | pending |
| Tap an RFT as Wayne and land in the transport room for quote/acceptance | pending |
| As a confirmed driver, see an Open RFTs panel listing farmer-created routes | pending |
| Move a quote through propose → counter → accept and see system messages in chat for each step | pending |
| Push a change to `main` and watch the QA checklist still pass | ongoing |

## Acceptance principles

Every screen and migration in this build must honour:

- The five DNA principles in [PRINCIPLES.md](./PRINCIPLES.md)
- **Transport as co-equal pillar** (this build's guiding principle)
- The **two-shape rule** from [PERSONAS.md](./PERSONAS.md) — 2-party agistment workspace + 3-party transport room. Build 03 does not blur this.
- **Both privacy walls** — driver-visibility and landowner-visibility — enforced at the data layer
- **Profile-carries-the-difference** — Wayne and Sharon use the same surfaces; their fleet/driver count lives in the profile, not the UI
- Tap, don't type. Chip filters on `/transport/available` mirror chip filters on `/listings`
- No emoji as state indicators — lucide-react icons only
- Cognitive easing — the livestock owner never has to leave the workspace to know "where are my cattle"

## Open questions

Capture, don't block:

- **Quote chain depth.** How many counter-offers before the system nudges parties to a call? Recommend no limit but render the chain compactly once it passes 3 entries.
- **Capacity expiry.** Should a posted capacity row auto-withdraw after `latest_date` passes? Recommend yes — automatic `status = 'expired'` via a scheduled function.
- **Backload geographic radius.** What counts as "near" the destination for backload matching? Recommend 100 km initially as a tunable, surfaced in the driver's profile.
- **Sharon's dispatch surface.** A single Sharon-the-business may dispatch dozens of capacity rows per week. Build 03 keeps the same per-truck form Wayne uses; a fleet dispatch console with bulk actions waits for Build 04 if the volume justifies it.
- **Cross-leg referral counts.** When a transport job lands successfully, does the agistment match score for the involved paddock get bumped? Defer; revisit when the match engine moves beyond chip filters.

Resolve as they come up. None of them block starting Build 03.
