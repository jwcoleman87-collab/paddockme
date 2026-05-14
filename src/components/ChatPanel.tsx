"use client";

import { MessageSquare, Send } from "lucide-react";
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
};

export function ChatPanel({
  title = "Conversation",
  messages,
  onlineCount = 2,
  sections,
  activeSectionId,
  onSelectSection,
}: ChatPanelProps) {
  const hasSections = !!sections && sections.length > 0;
  const activeSection = hasSections
    ? sections!.find((section) => section.id === activeSectionId)
    : undefined;

  return (
    <section className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)]">
      <div className="border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-sage-deep">Live Chat</h2>
            <p className="mt-0.5 text-sm font-semibold text-bark/70">
              {title}
            </p>
          </div>
          <span className="inline-flex min-h-8 shrink-0 items-center gap-2 rounded-full border border-match/20 bg-match-light px-3 text-xs font-bold text-match">
            <span className="h-2 w-2 rounded-full bg-match" aria-hidden />
            {onlineCount} online
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-bark/65">
          {hasSections
            ? activeSection
              ? `Anchored to "${activeSection.label}" - replies are tagged to this section.`
              : "Tap any section in the agreement to anchor the conversation."
            : "Dummy conversation for the clickable prototype."}
        </p>

        {hasSections && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <SectionChip
              active={!activeSectionId}
              onClick={() => onSelectSection?.(null)}
            >
              All sections
            </SectionChip>
            {sections!.map((section) => (
              <SectionChip
                key={section.id}
                active={activeSectionId === section.id}
                onClick={() => onSelectSection?.(section.id)}
              >
                {section.label}
              </SectionChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-warm-white px-5 py-5">
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

      <div className="border-t border-sage-deep/15 bg-cream/45 p-4">
        <div className="flex items-center gap-3">
          <div className="flex min-h-12 flex-1 items-center rounded-full border border-sage-deep/15 bg-warm-white px-4 text-sm text-stone shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <span className="truncate">
              {activeSection
                ? `Reply in "${activeSection.label}"`
                : "Message field placeholder"}
            </span>
          </div>
          <Button
            type="button"
            aria-label="Send placeholder message"
            className="h-12 min-h-12 w-12 shrink-0 rounded-full p-0"
          >
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
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
        tone === "farmer-b" && "border-sage-deep/12 bg-sage-mist/65",
        tone === "system" && "border-amber/25 bg-amber-light/70",
        tone === "default" && "border-mist bg-warm-white",
        dimmed && "opacity-55"
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-bark">{message.senderName}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone">
            {message.senderRole}
          </p>
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

function getMessageTone(message: Message): "farmer-b" | "system" | "default" {
  if (
    message.senderId === "system" ||
    message.senderRole.toLowerCase().includes("system")
  ) {
    return "system";
  }

  if (message.senderId === "farmer-b") {
    return "farmer-b";
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
