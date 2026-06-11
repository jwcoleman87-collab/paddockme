"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Header link to /messages for signed-in users.
 *
 * The unread dot previously computed counts from demo seed threads and
 * Demo unread state is retired. A real unread indicator
 * needs message counts from Supabase (logged in SPEC_DRIFT.md as a future
 * wiring task); until then the link carries no false signal.
 */
export function HeaderInboxLink() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    const supabase = createClient();

    async function compute() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsSignedIn(!!user);
    }

    void compute();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void compute();
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isSignedIn) return null;

  return (
    <Link
      href="/messages"
      aria-label="Open inbox"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist bg-cream text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <Inbox className="h-5 w-5" aria-hidden />
    </Link>
  );
}
