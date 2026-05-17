"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { farmers } from "@/lib/dummyData";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Tiny client-only component for the AppShell header.
 *
 * Renders the avatar + name for whichever persona the prototype is currently
 * "signed in as" (per the persona switcher on /agreements and /profile).
 * Falls back to the generic User icon when no persona is selected yet.
 *
 * If Supabase is configured + signed in, the user's real name overrides the
 * persona label.
 */
export function AppShellHeaderUser() {
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [supabaseLabel, setSupabaseLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem("paddockme.agreements.persona") ??
        window.localStorage.getItem("paddockme.profile.persona");
      if (stored) setActivePersonaId(stored);
    } catch {
      // ignore
    }

    function onStorage(event: StorageEvent) {
      if (
        event.key === "paddockme.agreements.persona" ||
        event.key === "paddockme.profile.persona"
      ) {
        setActivePersonaId(event.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
          setSupabaseLabel(metaName ?? user.email ?? null);
        })
        .catch(() => {
          // ignore
        });
    } catch {
      // ignore
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const persona = activePersonaId
    ? farmers.find((f) => f.id === activePersonaId)
    : undefined;

  if (persona) {
    return (
      <>
        <Avatar
          name={persona.name}
          src={persona.avatarUrl}
          size="sm"
          className="shrink-0"
        />
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
          {supabaseLabel ?? persona.name.split(" ")[0]}
        </span>
      </>
    );
  }

  return (
    <>
      <User className="h-5 w-5" aria-hidden />
      {supabaseLabel && (
        <span className="hidden max-w-[8rem] truncate text-xs font-semibold sm:inline">
          {supabaseLabel}
        </span>
      )}
    </>
  );
}
