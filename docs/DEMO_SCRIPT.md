# PaddockME Demo Script

Five-minute canonical walkthrough for investor pitches and product demos.
Locked at the start of the 3-day investor-ready sprint. If you change a
surface that this script touches, update the script.

## Setup before the demo

- Open the app fresh in an incognito window so localStorage starts clean.
- Visit `/profile` once and tap **Reset prototype state** if you want
  the demo to start from the canonical seed (no leftover quote chains,
  read receipts, etc.).
- Pick your stage URL:
  - Production: `https://paddockme-oz51.vercel.app`
  - Branch preview: linked from the open PR on GitHub.

## The story arc, in one breath

> Dale's stock needs feed. Brett has a paddock. Wayne moves the cattle.
> Today this runs on phone tag, Facebook posts, and broken handshakes.
> PaddockME is the one workspace where all three coordinate without
> dropping the ball.

## The walkthrough (5 minutes)

### 0. Land (0:00 - 0:20)

- Open `/` (marketing landing).
- Say: "The Australian agistment market moves billions of dollars of
  stock a year and it's coordinated on group chat. We replace the
  group chat with one room per movement."
- Click **Try the demo** -> lands at `/agreements`.

### 1. Dale's home (0:20 - 0:50)

- Already viewing as Dale.
- Point at **What needs you** tiles: "Three things wanting your
  attention today. Sections to confirm, a transport quote, unread
  messages."
- Tap **Sections to confirm** -> `/workspace/agreement-glenbarra`.

### 2. The agreement workspace (0:50 - 2:00)

- Header reads "Glenbarra River Paddocks. Dale Morgan & Brett Donnelly.
  100 cattle for 3 months."
- Point at the section list: Parties, Stock, Paddock, Dates and duration,
  Rate and terms, Transport.
- Tap **Rate and terms** or another section that isn't yet mutually agreed.
- Chat panel on the right anchors to that section.
- Tap Dale's **Farmer A: Tap to agree** control on a section -> check turns sage
  on Dale's side.
- Switch party to Brett at the top -> tap Brett's **Farmer B: Tap to agree**
  control on the same section
  -> flash "Both parties agree on X" plus a system message in chat.
- Say: "Once both sides agree every section, this becomes the binding
  record."

### 3. Transport tab inside the agreement (2:00 - 2:30)

- Click the **Transport** tab in the workspace.
- Point at the live status row + section confirmations.
- Note: "Brett, as the landowner, doesn't see the transport rate.
  That's enforced at the database with row-level security, not just the
  UI."
  Verification note: migrations `20260516120200_transport_and_messages.sql`
  and `20260517120000_transport_quotes.sql` enforce this with separate
  transport-job and quote policies.
- Tap **Open transport room** -> `/transport/transport-glenbarra`.

### 4. The three-party transport room (2:30 - 3:30)

- Header reads "Central West NSW to Southern NSW. 100 cattle..."
- Point at the role switcher (Farmer A / Farmer B / Driver).
- Switch to Driver (Wayne) - point at the pending quote and the
  Possible Backloads panel: "Wayne sees a return-leg job ready to
  chain. Empty kilometres are profit deleted - this is the single
  biggest dial for transport business utilisation."
- Switch to Farmer A (Dale), open the **Rate** tab, then tap
  **Accept rate** -> system message fires in chat, status flips.

### 5. Inbox and snapshot (3:30 - 4:00)

- Tap the inbox icon top-right -> `/messages`.
- Show three threads with the other parties' avatars, last-message
  preview, unread badges that cleared when Dale opened the rooms.
- Back out, in the workspace persona switcher tap **View snapshot** ->
  `/workspace/agreement-glenbarra/snapshot`.
- Say: "Read-only record. Print this for your vet, accountant, or
  bank."

### 6. Switch personas (4:00 - 5:00)

- Back to `/agreements`, switch persona to **Brett**.
- Wait until the app shell shows **Brett** before opening `/requests`;
  otherwise the request browser will not know which paddocks he can offer.
- Same home view, re-framed. "Open livestock requests" tile.
- Tap -> `/requests`. Brett sees Dale's open request, Tash's horse
  request. Filter chips.
- Tap **Offer a paddock** on Tash's horse request -> `Pick a paddock to offer`
  picker shows
  Brett's paddocks -> pick one -> lands in a new workspace with Tash
  as Farmer A. Say: "The marketplace works both directions. Brett can
  offer his paddock against an open request, not just wait to be
  found."
- Switch persona to **Wayne** -> tap **Transport** in the bottom nav
  -> the persona-aware view points to `/runs`. Show the pipeline
  buckets (In motion / Open offers / Delivered) and posted capacity.

### Close (5:00)

- Recap in one sentence: "Three personas, three sides of the deal, one
  coordinated workspace. Stripe and GPS are explicitly next.
  Everything you're seeing runs on Next.js, Postgres, and Supabase
  auth - not a Figma prototype."

## What the demo deliberately does NOT show

Don't go here in the headline pitch. They're roadmap, not MVP:

- `/transport/earnings` - "Coming soon" placeholder by design.
- `/profile` reset button - useful before the demo, not during.
- Onboarding flow - sign-up to wizard, gated on real Supabase auth.
- Map driver mode - secondary surface; show on request only.

## If something breaks mid-demo

- Hit **Reset prototype state** in `/profile` and walk it again.
- The data layer is feature-flagged: if Supabase is down, the prototype
  state in localStorage carries the demo without missing a beat.
