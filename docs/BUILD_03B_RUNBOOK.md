# Build 03B — Runbook for James

This is the playbook for the steps in the Build 03B brief that need a human at the Supabase / Vercel dashboards. Everything else (mode indicator, fixes after testing, RLS report write-up) is mine.

Branch with the mode indicator commit: `claude/relaxed-roentgen-70db4e`.
Commit: `feat: add demo/database mode indicator`.
Open it for merge: https://github.com/jwcoleman87-collab/paddockme/pull/new/claude/relaxed-roentgen-70db4e

---

## Step 1 — Rotate the leaked Supabase service-role token

1. Open https://supabase.com/dashboard/project/_/settings/api for the PaddockME project.
2. Under **Project API keys**, click **Reset** next to the `service_role` key. Confirm.
3. Copy the new key.
4. Update `.env.local` in your main checkout (NOT this worktree — there is no `.env.local` here):

   ```
   SUPABASE_SERVICE_ROLE_KEY=<new key>
   ```

   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` do not change — only the service-role key was leaked.

5. Update Vercel env vars. Either:
   - **Dashboard:** https://vercel.com/dashboard → paddockme project → Settings → Environment Variables → edit `SUPABASE_SERVICE_ROLE_KEY` → save. Re-deploy via the Deployments tab (or push a no-op commit).
   - **Or via the Vercel MCP:** I can do this once you paste the new key into chat (do NOT commit it).
6. Verify the old token is dead. With the OLD service-role key in `$OLD_KEY` and your project URL in `$SUPABASE_URL`:

   ```bash
   curl -i "$SUPABASE_URL/rest/v1/profiles?select=id&limit=1" \
     -H "apikey: $OLD_KEY" \
     -H "Authorization: Bearer $OLD_KEY"
   ```

   Expect `401 Unauthorized` or `Invalid API key`. If you get rows back, the rotation didn't take.

7. Verify the local dev server starts: in your main checkout, `npm run dev`, confirm no Supabase auth errors in the console.
8. Verify Vercel deploys green from the latest commit.

When done, paste back to me:
- "Rotation complete, Vercel green" — that's all I need. Don't paste the key.

---

## Step 3 — Create test users in Supabase

For each user, open https://supabase.com/dashboard/project/_/auth/users → **Add user** → **Create new user**.

| Email | Password | Persona |
|---|---|---|
| `dale@paddockme.test` | `TestPass123!` | Livestock owner |
| `brett@paddockme.test` | `TestPass123!` | Landowner |
| `wayne@paddockme.test` | `TestPass123!` | Transport |

Tick **Auto Confirm User** on each so the sign-in flow doesn't bounce on email confirmation.

The schema's `handle_new_user` trigger should auto-create a `profiles` row for each. Confirm in **Table Editor → profiles**. If a row is missing, insert it manually with `id = auth.users.id`.

Then update each profile via the SQL Editor (one query):

```sql
update public.profiles
set account_types = array['livestock_owner'],
    stock_types  = array['Cattle'],
    regions      = array['Southern NSW']
where id = (select id from auth.users where email = 'dale@paddockme.test');

update public.profiles
set account_types = array['landowner'],
    regions      = array['Gippsland']
where id = (select id from auth.users where email = 'brett@paddockme.test');

update public.profiles
set account_types = array['transport']
where id = (select id from auth.users where email = 'wayne@paddockme.test');
```

Grab the three UUIDs:

```sql
select email, id
from auth.users
where email in ('dale@paddockme.test','brett@paddockme.test','wayne@paddockme.test');
```

Paste those three rows back to me and I'll commit `docs/TEST_USERS.md` (UUIDs only, no passwords).

---

## Steps 4 & 5 — How we'll run the rest

Once you've confirmed steps 1 and 3, paste back to me:

```
Rotation: done
Users: dale=<uuid>  brett=<uuid>  wayne=<uuid>
```

Then I'll:

- **Step 4 (functional tests):** I can drive them via the claude-in-chrome MCP if you want me to run them autonomously — I'll need each user's password pasted into chat once (the same `TestPass123!` for all three, per this runbook). Otherwise, you run them in your browser and I'll write up `BUILD_03B_TEST_REPORT.md` from what you paste back.
- **Step 5 (RLS):** I'll run the curls myself once I have the anon key + URL. Paste both into chat (anon key is safe — it's already in client bundles). Scripts ready to run below.

---

## Step 5 — RLS curl scripts (ready to run)

These scripts use the test users' JWTs to verify the database itself denies unauthorised reads.

### Setup — set these env vars in your shell

```bash
export SUPABASE_URL="<your project ref url>"      # e.g. https://abc123.supabase.co
export SUPABASE_ANON_KEY="<anon key from Settings → API>"

# Get a JWT for each user (password sign-in via GoTrue):
get_jwt() {
  curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" \
  | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])"
}

export DALE_JWT="$(get_jwt dale@paddockme.test TestPass123!)"
export BRETT_JWT="$(get_jwt brett@paddockme.test TestPass123!)"
export WAYNE_JWT="$(get_jwt wayne@paddockme.test TestPass123!)"
```

If you're on PowerShell, ping me and I'll write the PowerShell variant.

### Test 5.1 — Wayne CANNOT read agreements

```bash
curl -s "$SUPABASE_URL/rest/v1/agreements?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $WAYNE_JWT"
```

**Expected:** `[]` (empty array). PASS if empty, FAIL if any agreement IDs come back.

### Test 5.2 — Wayne CANNOT read agreement_messages

```bash
curl -s "$SUPABASE_URL/rest/v1/messages?select=id&agreement_id=not.is.null" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $WAYNE_JWT"
```

**Expected:** `[]`. (Note: `messages` is the actual table — the brief says `agreement_messages` but the schema uses `messages` with an `agreement_id` FK. See [src/lib/types/database.ts] and [src/lib/data/repositories.ts:244].)

### Test 5.3 — Wayne CAN read assigned/available transport_jobs

```bash
curl -s "$SUPABASE_URL/rest/v1/transport_jobs?select=id,status,driver_id" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $WAYNE_JWT"
```

**Expected:** rows where `status='available'` OR `driver_id=<wayne_uuid>`. PASS if Wayne sees something, FAIL if Wayne sees jobs assigned to other drivers.

### Test 5.4 — Dale CANNOT read Brett's draft/paused paddocks

First create a draft paddock as Brett (one-time setup):

```bash
curl -s -X POST "$SUPABASE_URL/rest/v1/paddocks" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $BRETT_JWT" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"title":"RLS test draft","region":"Gippsland","state":"VIC","acres":50,"status":"draft"}'
```

Then probe as Dale:

```bash
curl -s "$SUPABASE_URL/rest/v1/paddocks?select=id,title,status&status=eq.draft" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $DALE_JWT"
```

**Expected:** `[]` if RLS hides draft paddocks from non-owners. FAIL if the draft shows up.

### Test 5.5 — Unauthenticated reads return nothing

```bash
curl -s "$SUPABASE_URL/rest/v1/agreements?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY"

curl -s "$SUPABASE_URL/rest/v1/messages?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY"

curl -s "$SUPABASE_URL/rest/v1/profiles?select=id" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

**Expected:** all three return `[]` (or 401). Any rows = RLS hole = P0 issue.

---

## Pre-test finding (worth knowing before we run anything)

While reading the migrations I spotted what looks like a P0 gap that will break the closed loop in Database mode and fail test 5.3:

- [supabase/migrations/20260516120200_transport_and_messages.sql:113](supabase/migrations/20260516120200_transport_and_messages.sql) — the only SELECT policy on `transport_jobs` requires `auth.uid()` to match `livestock_owner_id`, `landowner_id`, or `driver_id`.
- [supabase/migrations/20260519170000_mvp_build_03_loop_wiring.sql:26](supabase/migrations/20260519170000_mvp_build_03_loop_wiring.sql) — adds an UPDATE policy so drivers can claim available jobs, but **no matching SELECT policy** for unassigned available jobs.

Net effect: an unassigned driver (Wayne, before he's accepted anything) **can't list available jobs**. The UPDATE policy lets him claim a job by id, but he has no way to discover the id. In Database mode, Wayne's job board will be empty.

The expected fix is one extra SELECT policy on `transport_jobs` — something like `status = 'available' and driver_id is null and exists(auth.uid())`. I'll write the migration as part of step 6 once you confirm test 5.3 fails as predicted. Not fixing now per the brief's "one issue, one commit" rule and your "don't improvise" rule.

---

## My current status

- ✅ Step 2 — mode indicator built, committed, pushed (branch `claude/relaxed-roentgen-70db4e`).
- ⏸ Step 1 — waiting on you.
- ⏸ Step 3 — waiting on you.
- ⏸ Steps 4–6 — waiting on 1 and 3.

When you ping me with the data above, I'll resume.
