# Bug report: TypeScript build failure on Supabase insert

**Repo:** https://github.com/jwcoleman87-collab/paddockme
**Live URL:** https://paddockme-oz51.vercel.app
**Failing commit:** `35a52e10` — "Fix: wrap supabase insert in array literal so TS picks the right overload"
**Affected file:** `src/app/(app)/request/new/page.tsx`, line 149
**Date:** 2026-05-10

---

## TL;DR

`supabase-js` v2 is resolving the `agistment_requests` table row type to `never` at build time. When we call `supabase.from('agistment_requests').insert(...)`, TypeScript thinks the parameter type is `never` (or `never[]` depending on whether the value is wrapped in an array). Both forms fail the build.

The most likely root cause is that `src/lib/types/database.ts` was hand-copied from a Supabase-MCP-generated output and is missing the helper exports (`Tables<>`, `TablesInsert<>`, `TablesUpdate<>`, `Constants`) and the `DatabaseWithoutInternals` derivation that supabase-js v2 expects.

A secondary issue is that local builds aren't running on the developer side, so every iteration on type errors costs a Vercel deploy.

---

## The stack

- **Framework:** Next.js 16.2.6 (App Router, src directory layout, Turbopack)
- **Language:** TypeScript 5.x with strict mode (default)
- **Styling:** Tailwind CSS v4 (CSS-based `@theme` config in `globals.css`)
- **Database + auth:** Supabase (Postgres + Auth + RLS)
- **Supabase client packages:**
  - `@supabase/supabase-js` ^2.47.10
  - `@supabase/ssr` ^0.5.2
- **Supabase project ref:** `aevzcvlzfvrdipgofczx`
- **Auth keys in use:** Publishable key (format `sb_publishable_*`) — the new format that replaces legacy anon JWTs

---

## The build error

From the Vercel build log for commit `35a52e10` (build `bld_l89hdwd1m`):

```
✓ Compiled successfully in 9.3s
  Running TypeScript ...
Failed to type check.

./src/app/(app)/request/new/page.tsx:149:9
Type error: Type '{ requester_id: string; stock_type: string; head_count: number;
duration: string; preferred_regions: string[]; urgency: string;
required_pasture: string | null; required_water: boolean;
required_yards: boolean; required_ramp: boolean; required_shelter: boolean;
status: string; }' is not assignable to type 'never'.

  147 |       .from("agistment_requests")
  148 |       .insert([
> 149 |         {
      |         ^
  150 |           requester_id: user.id,
  151 |           stock_type: stockType!,
  152 |           head_count: headCount,

Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1
```

The previous attempt (commit `ebea803`, single-object form rather than array) failed with a different but related error:

```
Type error: Object literal may only specify known properties, and 'requester_id'
does not exist in type 'never[]'.
```

So the table row type is resolving to `never`, regardless of whether we pass a single object or wrap in an array.

---

## The relevant code

Schema (migration `001_initial_schema`, applied to project `aevzcvlzfvrdipgofczx`):

```sql
create table public.agistment_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  stock_type text not null, breed text, head_count int not null,
  duration text not null, preferred_regions text[] not null,
  urgency text default 'standard',
  required_pasture text,
  required_water boolean default false, required_yards boolean default false,
  required_ramp boolean default false, required_shelter boolean default false,
  status text default 'matching',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- RLS
alter table public.agistment_requests enable row level security;
create policy "Requests viewable by authenticated"
  on public.agistment_requests for select using (auth.role() = 'authenticated');
create policy "Requesters can manage own requests"
  on public.agistment_requests for all using (auth.uid() = requester_id);
```

Browser client setup (`src/lib/supabase/client.ts`):

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Failing call (`src/app/(app)/request/new/page.tsx`, around line 145):

```ts
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  setError("You need to be signed in to post a request.");
  return;
}

const { data, error: insertError } = await supabase
  .from("agistment_requests")
  .insert([
    {
      requester_id: user.id,
      stock_type: stockType!,
      head_count: headCount,
      duration: duration!,
      preferred_regions: regions,
      urgency,
      required_pasture: pasture === "no_preference" ? null : pasture,
      required_water: water,
      required_yards: yards,
      required_ramp: ramp,
      required_shelter: shelter,
      status: "matching",
    },
  ])
  .select("id")
  .single();
```

---

## The Database type (likely root cause)

`src/lib/types/database.ts` was generated by the Supabase MCP earlier and then hand-copied into the repo. It looks like this:

```ts
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agistment_requests: {
        Row: { /* full row shape */ }
        Insert: {
          requester_id: string
          stock_type: string
          head_count: number
          duration: string
          preferred_regions: string[]
          // ... all optional fields with `?:`
        }
        Update: { /* same shape, all optional */ }
        Relationships: [
          {
            foreignKeyName: "agistment_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... 4 other tables
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
```

**What's missing** compared to a freshly generated Supabase types file:

1. The `DatabaseWithoutInternals` type:
   ```ts
   type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
   ```
2. The `DefaultSchema` derivation:
   ```ts
   type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
   ```
3. The exported helper types:
   ```ts
   export type Tables<T extends ...> = ...
   export type TablesInsert<T extends ...> = ...
   export type TablesUpdate<T extends ...> = ...
   export type Enums<T extends ...> = ...
   export type CompositeTypes<T extends ...> = ...
   ```
4. The `Constants` export.

**Why it matters:** newer versions of `@supabase/supabase-js` use the `__InternalSupabase` field and the `DatabaseWithoutInternals` derivation to dispatch internal type lookups. When the file only has the bare `Database` type without the supporting types, supabase-js's internal `GetTables<T>` lookup either:

- Finds nothing and resolves to `never`, or
- Hits a structural mismatch with what the new key-format publishable client expects.

Either way, `Database['public']['Tables']['agistment_requests']` ends up resolving to `never` inside the supabase-js internals, which propagates to `Row` / `Insert` / `Update` types and ultimately makes `.insert(value)` reject any value that isn't `never`.

---

## What's been tried

| # | Attempt | Result |
|---|---------|--------|
| 1 | `.insert({ ...payload })` (single object) | `Object literal may only specify known properties, and 'requester_id' does not exist in type 'never[]'` |
| 2 | `.insert([{ ...payload }])` (wrapped in array) | `Type '{...}' is not assignable to type 'never'` |
| 3 | `.insert(payload as any)` | **Pending push** — should compile (just shipped to disk) |

The third attempt (`as any`) is a workaround, not a fix. It silences the type checker but loses all type safety on this insert call.

---

## Recommended permanent fix

1. **Re-generate `src/lib/types/database.ts` from the live schema.** Best path: use the Supabase MCP's `generate_typescript_types` tool against project `aevzcvlzfvrdipgofczx`, or run the Supabase CLI:

   ```bash
   npx supabase gen types typescript --project-id aevzcvlzfvrdipgofczx > src/lib/types/database.ts
   ```

   This produces the full file including the helper types and the `DatabaseWithoutInternals` derivation.

2. **Use the `TablesInsert<>` helper at the call site** for type-safe payloads:

   ```ts
   import type { TablesInsert } from "@/lib/types/database";

   const payload: TablesInsert<"agistment_requests"> = {
     requester_id: user.id,
     stock_type: stockType!,
     head_count: headCount,
     // ...
   };

   await supabase
     .from("agistment_requests")
     .insert(payload)
     .select("id")
     .single();
   ```

3. **Remove the `as any` workaround** once the types regen.

4. **(Optional) Add a script to keep types fresh:**
   ```json
   // package.json
   "scripts": {
     "db:types": "npx supabase gen types typescript --project-id aevzcvlzfvrdipgofczx > src/lib/types/database.ts"
   }
   ```
   Run after every schema change.

---

## Secondary issue: no local build loop

The original developer was working in a remote sandbox where `npm install` consistently failed mid-execution due to a Windows SMB mount layer corrupting `node_modules` (specific files would end up unwritable, with `Operation not permitted` even from inside the sandbox). As a result, **`next build` was never running locally** — every type error was caught only by Vercel after a push, costing 1–2 minutes per iteration plus the friction of re-pushing.

For a colleague picking this up:

- Clone fresh on a normal Linux/macOS machine where `npm install` actually succeeds
- Run `npm run build` locally before pushing
- If you want to mirror the build loop cleanly, set up a GitHub Action that runs `next build` on every PR — that catches TS regressions in CI before they hit production deploys

---

## How to reproduce

```bash
git clone https://github.com/jwcoleman87-collab/paddockme.git
cd paddockme
git checkout 35a52e1   # the failing commit
cp .env.example .env.local   # populate with Supabase URL + publishable key
npm install
npm run build   # will fail with the type error above
```

Then apply fix #1 + #2 above, run `npm run build` again, and confirm green.

---

## Schema reference (5 tables)

The full migration is in commit `64f7005` foundation commit. Tables and their purpose:

- **`profiles`** — user profile (extends `auth.users`); includes `account_types` array (livestock_owner / landowner / transport), regions, verification flags
- **`paddocks`** — landowner listings: region, acres, capacity, rate, pasture type, water, fencing
- **`agistment_requests`** — *the failing insert target*: livestock owner's request for paddock space
- **`matches`** — paddock × request join with score and reasons
- **`agreements`** — the locked-in deal between two parties + transport flag

All five tables have RLS enabled. Foreign keys cascade on user deletion. There's also an `auth.users` trigger that auto-creates a profiles row on signup.

---

## Contact and context

If the colleague needs anything else — original kickoff brief, design system docs, deployment history, or details on the build pipeline — point them to `docs/` in the repo:

- `docs/PRINCIPLES.md` — core platform DNA
- `docs/SCOPE.md` — what's in/out of day-one
- `docs/PERSONAS.md` — target users
- `docs/DESIGN_INTELLIGENCE.md` — the embedded ui-ux-pro-max skill and how to use it
- `README.md` — stack, env vars, folder structure

The repo is currently shipping production deploys on `main` via Vercel auto-deploy. This bug is blocking the `/request/new` page from going live; everything else (marketing landing, sign-in/sign-up, authenticated layout, route-group fixes) is shipped and working at https://paddockme-oz51.vercel.app.
