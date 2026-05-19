"use client";

import { Database, FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "database" | "demo" | "loading";

export function ModeIndicator() {
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMode("demo");
      return;
    }

    const supabase = createClient();
    let active = true;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setMode(user ? "database" : "demo");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setMode(session?.user ? "database" : "demo");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (mode === "loading") return null;

  const isDb = mode === "database";
  const Icon = isDb ? Database : FlaskConical;

  return (
    <span
      role="status"
      aria-live="polite"
      title={
        isDb
          ? "Signed in — writes go to Supabase."
          : "Signed out — writes stay in the localStorage demo loop."
      }
      className={
        "pointer-events-none fixed right-3 top-20 z-20 inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold shadow-sm backdrop-blur " +
        (isDb
          ? "border-sage-deep/25 bg-sage-mist/80 text-sage-deep"
          : "border-amber/30 bg-amber-light/80 text-amber")
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {isDb ? "Database" : "Demo"}
    </span>
  );
}
