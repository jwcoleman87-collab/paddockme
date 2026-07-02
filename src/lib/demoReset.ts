"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { demoWorkspace } from "@/lib/paddockmeDemoData";

export async function resetPaddockmeDemoState() {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("paddockme")) toRemove.push(key);
    }
    toRemove.forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.removeItem("pm-request-draft");
  } catch {
    // ignore blocked storage/private browsing
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      // Wipe the shared workspace chat thread (demo-scoped table only) so a
      // reset puts every open browser back to the seeded conversation -
      // Realtime delete events clear the other screens.
      await supabase
        .from("demo_chat_messages")
        .delete()
        .eq("workspace_id", demoWorkspace.id);
    } catch {
      // best-effort during a demo reset
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // sign-out is best-effort during a demo reset
    }
  }
}
