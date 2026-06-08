"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Tiny client-only component for the AppShell header.
 *
 * Shows the signed-in Supabase user. Demo personas are intentionally hidden
 * from the real customer path.
 */
type SignedInUser = {
  name: string;
  email: string | null;
};

export function AppShellHeaderUser() {
  const [signedInUser, setSignedInUser] = useState<SignedInUser | null>(null);

  useEffect(() => {
    let mounted = true;
    // Generation token guards against overlapping loads: when a user signs
    // out and a different account signs in quickly, the two in-flight
    // loadSignedInUser calls can finish in reverse order and leave the
    // header showing the previous user's name. Each call bumps the gen, and
    // a stale call won't commit state.
    let gen = 0;
    const supabase = createClient();

    async function loadSignedInUser() {
      const myGen = ++gen;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || myGen !== gen) return;

      if (!user) {
        setSignedInUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted || myGen !== gen) return;

      const metaName =
        (user.user_metadata as { full_name?: string } | null)?.full_name ??
        null;
      const name = profile?.full_name ?? metaName ?? user.email ?? "Account";
      setSignedInUser({ name, email: user.email ?? null });
    }

    void loadSignedInUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSignedInUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (signedInUser) {
    const firstName = signedInUser.name.trim().split(/\s+/)[0] ?? "Account";
    const initials = initialsForName(signedInUser.name);
    return (
      <>
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ochre/40 bg-ochre-light text-xs font-bold text-sage-deep"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
          {firstName}
        </span>
      </>
    );
  }

  return (
    <>
      <User className="h-5 w-5" aria-hidden />
    </>
  );
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PM";
  const first = parts[0]?.[0] ?? "P";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}
