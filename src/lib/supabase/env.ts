/**
 * Lightweight helpers around the Supabase env setup.
 *
 * The Supabase clients in client.ts / server.ts use non-null assertions on the
 * env vars - safe at TypeScript time, but at runtime an undefined value would
 * get passed straight to createBrowserClient / createServerClient and throw.
 *
 * isSupabaseConfigured() gives a no-throw way to gate code paths so the
 * prototype keeps working when env vars aren't set (local dev without a
 * Supabase project), and only attempts Supabase when both vars are present.
 */

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
