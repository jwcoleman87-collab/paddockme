"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/dummyData";

type ChatSectionRef = {
  id: string;
  label: string;
};

type ChatPanelProps = {
  title?: string;
  messages: Message[];
  onlineCount?: number;
  /** When provided, renders a section chip row that anchors the conversation. */
  sections?: ChatSectionRef[];
  /** The section currently anchoring the chat. `null` means "no anchor - show all." */
  activeSectionId?: string | null;
  onSelectSection?: (sectionId: string | null) => void;
  /** When provided, the composer becomes a functional input that calls this on send. */
  onSend?: (body: string) => void;
  /** Display name for whoever is composing (used as the placeholder hint). */
  composerSenderLabel?: string;
};

export function ChatPanel({
  title = "Conversation",
  messages,
  onlineCount = 2,
  sections,
  activeSectionId,
  onSelectSection,
  onSend,
  composerSenderLabel,
}: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  // Whether the viewer is reading the latest message. New messages only
  // auto-scroll while this holds, so scrolling back through history is
  // never yanked away mid-read.
  const stickToBottomRef = useRef(true);
  const hasSections = !!sections && sections.length > 0;
  const activeSection = hasSections
    ? sections!.find((section) => section.id === activeSectionId)
    : undefined;

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distanceFromBottom < 48;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    // Also re-pin when the list changes size - covers first paint and the
    // mobile Agreement/Chat tab switch, where the panel mounts hidden and
    // only gains a height once its tab is shown.
    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const composerEnabled = !!onSend;
  const composerPlaceholder = activeSection
    ? `Reply in "${activeSection.label}"${composerSenderLabel ? ` as ${composerSenderLabel}` : ""}`
    : composerSenderLabel
      ? `Message as ${composerSenderLabel}`
      : "Write a message";

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || !onSend) return;
    onSend(trimmed);
    setDraft("");
  }

  return (
    <section className="flex max-h-[70dvh] min-h-[480px] min-w-0 flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)] md:sticky md:top-24 md:h-[calc(100dvh-13rem)] md:max-h-none lg:top-6 lg:h-[calc(100dvh-3rem)]">
      <div className="border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-sage-deep">Live Chat</h2>
          </div>
          <span className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-match/20 bg-match-light px-3 text-xs font-bold text-match">
            <span className="h-2 w-2 rounded-full bg-match" aria-hidden />
            {onlineCount} online
          </span>
        </div>

        {/* The section chip strip used to render here ("All sections",
            "Pick up", "Stock manifest", ...). Removed - anchoring happens by
            tapping a section in the agreement panel; tapping it again
            un-anchors. The chips just duplicated that and crowded the chat. */}
      </div>

      <div
        ref={messagesRef}
        className="flex-1 space-y-4 overflow-y-auto bg-warm-white px-5 py-5"
      >
        {messages.length === 0 && (
          <p className="text-sm text-bark/60">No messages yet.</p>
        )}
        {messages.map((message) => {
          const matchesActive =
            !activeSectionId || message.sectionId === activeSectionId;
          const sectionLabel = hasSections
            ? sections!.find((section) => section.id === message.sectionId)
                ?.label
            : undefined;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              sectionLabel={sectionLabel}
              dimmed={!matchesActive}
            />
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-sage-deep/15 bg-cream/45 p-4"
      >
        <div className="flex items-center gap-3">
          {composerEnabled ? (
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={composerPlaceholder}
              aria-label={composerPlaceholder}
              className="min-h-12 flex-1 rounded-full border border-sage-deep/15 bg-warm-white px-4 text-sm text-bark shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-glow"
            />
          ) : (
            <div className="flex min-h-12 flex-1 items-center rounded-full border border-sage-deep/15 bg-warm-white px-4 text-sm text-stone shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
              <span className="truncate">{composerPlaceholder}</span>
            </div>
          )}
          <Button
            type="submit"
            disabled={composerEnabled && draft.trim().length === 0}
            aria-label={composerEnabled ? "Send message" : "Send placeholder message"}
            className="h-12 min-h-12 w-12 shrink-0 rounded-full p-0"
          >
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  sectionLabel,
  dimmed,
}: {
  message: Message;
  sectionLabel?: string;
  dimmed: boolean;
}) {
  const tone = getMessageTone(message);

  return (
    <article
      className={cn(
        "rounded-2xl border px-4 py-3.5 shadow-[0_8px_22px_rgba(34,84,52,0.04)] transition",
        tone === "system" && "border-amber/25 bg-amber-light/70",
        tone === "default" && "border-mist bg-warm-white",
        dimmed && "opacity-55"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {tone !== "system" && (
            <Avatar
              name={message.senderName}
              src={message.senderAvatarUrl}
              size="sm"
              className="shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-bark">{message.senderName}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone">
              {message.senderRole}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-stone">
          {message.time}
        </span>
      </div>
      <p className="leading-relaxed text-bark/78">{message.body}</p>
      {sectionLabel && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warm-white/75 px-3 py-1 text-xs font-semibold text-sage-deep">
          <MessageSquare className="h-3 w-3" aria-hidden />
          {sectionLabel}
        </div>
      )}
    </article>
  );
}

function getMessageTone(message: Message): "system" | "default" {
  if (
    message.senderId === "system" ||
    message.senderRole.toLowerCase().includes("system")
  ) {
    return "system";
  }


  return "default";
}

function SectionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        active
          ? "border-sage-deep bg-sage-deep text-cream"
          : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/50"
      )}
    >
      {children}
    </button>
  );
}
