"use client";

/**
 * localStorage-backed message threads for the guided demo.
 *
 * Every chat surface in the demo (workspace chat, negotiation conversation,
 * transport coordination room) persists what the visitor types through this
 * hook, so a mid-demo refresh never loses the conversation. Storage keys are
 * `paddockme-*` namespaced, which means Reset Demo wipes every thread along
 * with the rest of the demo state for free.
 *
 * Deliberately not Supabase: the demo phase prefers a dependency-free chat
 * that can never fail mid-pitch over live cross-browser sync (see the build
 * brief — Rod owns the production messaging architecture).
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type DemoThreadRole = "owner" | "landowner" | "transporter";

export type DemoThreadMessage = {
  id: string;
  sender: string;
  role: DemoThreadRole;
  /** ISO datetime the message was sent. */
  sentAt: string;
  text: string;
  /** Optional inline photo, stored as a downscaled data URL. */
  imageDataUrl?: string;
  imageName?: string;
};

const KEY_PREFIX = "paddockme-demo-thread:";

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function isMessage(value: unknown): value is DemoThreadMessage {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.sender === "string" &&
    (m.role === "owner" || m.role === "landowner" || m.role === "transporter") &&
    typeof m.sentAt === "string" &&
    typeof m.text === "string"
  );
}

/** "10:15 AM" style display time for a stored message. */
export function demoThreadTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // en-AU emits lowercase "am/pm"; the seeded backstory uses "AM" — match it.
  return date
    .toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

/**
 * The messages added during this demo run for one thread, persisted across
 * refreshes. Seeded backstory messages stay in the calling component — only
 * what the visitor (or a scripted status update) adds is stored.
 */
export function useDemoThread(threadId: string) {
  const storageKey = KEY_PREFIX + threadId;
  const [messages, setMessages] = useState<DemoThreadMessage[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed.filter(isMessage));
      }
    } catch {
      // corrupt/blocked storage — start the thread empty
    }
    setHasHydrated(true);
  }, [storageKey]);

  const persist = useCallback((next: DemoThreadMessage[]) => {
    try {
      localStorage.setItem(storageKeyRef.current, JSON.stringify(next));
    } catch {
      // Quota pressure (usually photos) — keep the words, drop the images.
      try {
        localStorage.setItem(
          storageKeyRef.current,
          JSON.stringify(
            next.map(({ imageDataUrl: _dropped, ...rest }) => rest),
          ),
        );
      } catch {
        // private browsing / storage disabled — thread stays in-memory
      }
    }
  }, []);

  const append = useCallback(
    (message: Omit<DemoThreadMessage, "id" | "sentAt">): DemoThreadMessage => {
      const full: DemoThreadMessage = {
        id: randomId(),
        sentAt: new Date().toISOString(),
        ...message,
      };
      setMessages((current) => {
        const next = [...current, full];
        persist(next);
        return next;
      });
      return full;
    },
    [persist],
  );

  return { messages, append, hasHydrated };
}

/**
 * Read a picked photo into a small data URL (longest edge capped) so it can
 * live in localStorage without blowing the quota.
 */
export async function imageFileToDataUrl(
  file: File,
  maxDimension = 1000,
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = objectUrl;
    });
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
