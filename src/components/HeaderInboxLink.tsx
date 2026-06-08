"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  agreements,
  getMessages,
  getTransportMessages,
  transportJobs,
  type Message,
} from "@/lib/dummyData";
import { INBOX_UPDATE_EVENT, getSeenCounts } from "@/lib/inbox";

/**
 * Header link to /messages with a sage dot when any thread has unread.
 *
 * Counts unread by comparing the current message count per thread to the
 * "seen" count stored in localStorage (written when the user opens a room).
 * Listens to paddockme:inbox-update so the dot clears the moment the user
 * marks a thread as read in another tab or via in-app navigation.
 */
export function HeaderInboxLink() {
  const [hasUnread, setHasUnread] = useState(false);
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
      if (!user) {
        setHasUnread(false);
        return;
      }
      const seen = getSeenCounts();
      const counts = currentCounts();
      const unread = Object.entries(counts).some(
        ([threadId, count]) => count > (seen[threadId] ?? 0)
      );
      setHasUnread(unread);
    }

    void compute();
    function onInbox() {
      void compute();
    }
    function onStorage(event: StorageEvent) {
      if (event.key && event.key.startsWith("paddockme.")) void compute();
    }
    window.addEventListener(INBOX_UPDATE_EVENT, onInbox);
    window.addEventListener("storage", onStorage);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void compute();
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(INBOX_UPDATE_EVENT, onInbox);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!isSignedIn) return null;

  return (
    <Link
      href="/messages"
      aria-label={hasUnread ? "Open inbox - unread messages" : "Open inbox"}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-mist bg-cream text-sage-deep shadow-sm transition hover:border-sage-glow hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <Inbox className="h-5 w-5" aria-hidden />
      {hasUnread && (
        <span
          aria-hidden
          className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-cream bg-sage-deep"
        />
      )}
    </Link>
  );
}

function currentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  if (typeof window === "undefined") return counts;
  for (const agreement of agreements) {
    counts[agreement.id] = mergedCount(
      agreement.id,
      `paddockme.workspace.${agreement.id}`,
      getMessages(agreement.id)
    );
  }
  for (const job of transportJobs) {
    counts[job.id] = mergedCount(
      job.id,
      `paddockme.transport.${job.id}`,
      getTransportMessages(job.id)
    );
  }
  return counts;
}

function mergedCount(
  _threadId: string,
  storageKey: string,
  seed: Message[]
): number {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as { messages?: Message[] };
      if (parsed.messages) return parsed.messages.length;
    }
  } catch {
    // ignore
  }
  return seed.length;
}
