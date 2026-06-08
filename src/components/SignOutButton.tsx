"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted) setIsSignedIn(!!user);
    }

    void loadSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsSignedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  if (isSignedIn === null) return null;

  if (isSignedIn === false) {
    return (
      <Link
        href="/sign-in"
        aria-label="Sign in"
        title="Sign in"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage-deep/20 bg-sage-mist px-3 text-sm font-bold text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
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
