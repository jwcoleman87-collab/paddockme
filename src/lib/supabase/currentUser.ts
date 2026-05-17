import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Loaded current-user profile pulled from public.profiles + auth.users.
 * All optional - any missing or sparse field falls back to a sensible
 * placeholder at the consumer side.
 */
export type CurrentUserProfile = {
  id: string;
  fullName: string | null;
  email: string | null;
  accountTypes: string[];
  regions: string[];
  stockTypes: string[];
};

/**
 * Server-only helper for reading the signed-in user's profile.
 *
 * Returns null when:
 *   - Supabase env vars aren't set
 *   - No user is signed in
 *   - The Supabase call errors (e.g. RLS denial, network failure)
 *
 * The prototype keeps working when this returns null - the seed personas
 * still drive the home view.
 */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, account_types, regions, stock_types")
      .eq("id", user.id)
      .maybeSingle();
    return {
      id: user.id,
      fullName: profile?.full_name ?? null,
      email: user.email ?? null,
      accountTypes: profile?.account_types ?? [],
      regions: profile?.regions ?? [],
      stockTypes: profile?.stock_types ?? [],
    };
  } catch {
    return null;
  }
}
