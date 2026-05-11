"use client";

import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import type { AgreementSection, Message } from "@/lib/dummyData";

type ChatPanelProps = {
  title?: string;
  messages: Message[];
  /** When provided, renders a section chip row that anchors the conversation. */
  sections?: AgreementSection[];
  /** The section currently anchoring the chat. `null` means "no anchor - show all." */
  activeSectionId?: string | null;
  onSelectSection?: (sectionId: string | null) => void;
};

export function ChatPanel({
  title = "Conversation",
  messages,
  sections,
  activeSectionId,
  onSelectSection,
}: ChatPanelProps) {
  const hasSections = !!sections && sections.length > 0;
  const activeSection = hasSections
    ? sections!.find((section) => section.id === activeSectionId)
    : undefined;

  return (
    <section className="flex min-h-[560px] flex-col rounded-xl border border-mist bg-cream">
      <div className="border-b border-mist px-5 py-4">
        <h2 className="text-lg font-bold text-sage-deep">{title}</h2>
        <p className="text-sm text-bark/65">
          {hasSections
            ? activeSection
              ? `Anchored to "${activeSection.label}" - replies are tagged to this section.`
              : "Tap any section in the agreement to anchor the conversation."
            : "Dummy conversation for the clickable prototype."}
        </p>

        {hasSections && (
          <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
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

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
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
            <article
              key={message.id}
              className={cn(
                "rounded-xl bg-warm-white p-4 transition",
                !matchesActive && "opacity-55"
              )}
            >
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-semibold text-bark">{message.senderName}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone">
                    {message.senderRole}
                  </p>
                </div>
                <span className="text-xs text-stone">{message.time}</span>
              </div>
              <p className="leading-relaxed text-bark/78">{message.body}</p>
              {sectionLabel && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage-mist px-3 py-1 text-xs font-semibold text-sage-deep">
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  {sectionLabel}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="border-t border-mist p-4">
        <div className="flex min-h-12 items-center justify-between gap-3 rounded-full border border-mist bg-warm-white px-4 py-2 text-sm text-stone">
          <span className="truncate">
            {activeSection
              ? `Reply in "${activeSection.label}"`
              : "Message field placeholder"}
          </span>
          <Button
            type="button"
            aria-label="Send placeholder message"
            className="h-11 min-h-11 px-4"
          >
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
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
