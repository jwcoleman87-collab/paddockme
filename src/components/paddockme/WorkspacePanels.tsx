"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/paddockmeWorkflow";

/* ---------- ChatPanel (workspace conversation) ---------- */

export type ChatMessage = { sender: string; time: string; text: string };

export function ChatPanel({
  messages,
  currentUser,
  className,
}: {
  messages: ChatMessage[];
  currentUser: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<ChatMessage[]>([]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [
      ...prev,
      {
        sender: currentUser,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        text,
      },
    ]);
    setDraft("");
  }

  const all = [...messages, ...extra];

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-pm-muted">
        Conversation
      </h3>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {all.map((m, i) => {
          const mine = m.sender === currentUser;
          return (
            <div
              key={i}
              className={cn("flex flex-col", mine ? "items-end" : "items-start")}
            >
              <span className="mb-0.5 text-[11px] text-pm-muted">
                {m.sender} · {m.time}
              </span>
              <span
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                  mine
                    ? "rounded-br-sm bg-pm-green-900 text-white"
                    : "rounded-bl-sm bg-pm-cream-100 text-pm-charcoal",
                )}
              >
                {m.text}
              </span>
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="pm-chat-input" className="sr-only">
          Type a message
        </label>
        <input
          id="pm-chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[44px] w-full rounded-full border border-pm-border bg-white px-4 text-sm focus:border-pm-green-700 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white hover:bg-pm-green-800"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

/* ---------- LiveAgreementPanel ---------- */

export function LiveAgreementPanel({
  fields,
  lastUpdated,
  className,
}: {
  fields: { label: string; value: string; pending?: boolean }[];
  lastUpdated: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-pm-muted">
        Live Agreement
      </h3>
      <dl className="space-y-3">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-baseline justify-between gap-3 border-b border-pm-border pb-2"
          >
            <dt className="text-xs text-pm-muted">{f.label}</dt>
            <dd
              className={cn(
                "text-right text-sm font-semibold",
                f.pending ? "text-pm-gold-600" : "text-pm-charcoal",
              )}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[11px] text-pm-muted">
        Last u