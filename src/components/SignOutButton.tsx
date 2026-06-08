"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    try {
      window.localStorage.removeItem("paddockme.agreements.persona");
      window.localStorage.removeItem("paddockme.profile.persona");
      document.cookie =
        "paddockme_persona=; Max-Age=0; path=/; SameSite=Lax";
    } catch {
      // Signing out should still work if storage is unavailable.
    }
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      aria-label="Sign out"
      title="Sign out"
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ochre/35 bg-ochre-light/80 text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <LogOut className="h-4 w-4" aria-hidden />
    </button>
  );
}
