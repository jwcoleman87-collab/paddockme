"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Tiny client-only component for the AppShell header.
 *
 * Reads the current Supabase session (if configured) and renders the user's
 * full_name / email next to the User icon. Renders nothing when:
 *   - Supabase env vars aren't set
 *   - the call errors
 *   - no user is signed in
 *
 * Kept as a client component so the server-rendered AppShell doesn't have to
 * wait on a network round-trip to display the page shell.
 */
export function AppShellHeaderUser() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    try {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (cancelled || !user) return;
          const metaName = (user.user_metadata as { full_name?: string } | null)
            ?.full_name;
          setLabel(metaName ?? user.email ?? null);
        })
        .catch(() => {
          // ignore - keep the generic icon-only header
        });
    } catch {
      // ignore - createClient can throw if env vars vanish at runtime
    }
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) return null;
  return (
    <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
      {label}
    </span>
  );
}
