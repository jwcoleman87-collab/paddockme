"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { demoThreadTime, useDemoThread } from "@/lib/demoThread";
import { lastUpdatedLabel, type Proposal } from "@/lib/paddockmeWorkflow";

/* ---------- ChatPanel (workspace conversation) ---------- */

export type ChatMessage = { sender: string; time: string; text: string };

export function ChatPanel({
  messages,
  currentUser,
  threadId,
  className,
}: {
  messages: ChatMessage[];
  currentUser: string;
  /** Persist what the visitor types under this demo-thread id. */
  threadId: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const thread = useDemoThread(threadId);

  function send() {
    const text = draft.trim();
    if (!text) return;
    thread.append({ sender: currentUser, role: "owner", text });
    setDraft("");
  }

  const all = [
    ...messages,
    ...thread.messages.map((m) => ({
      sender: m.sender,
      time: demoThreadTime(m.sentAt),
      text: m.text,
    })),
  ];

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
  /** ISO datetime of the last change, or null. */
  lastUpdated: string | null;
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
        Last updated {lastUpdatedLabel(lastUpdated)}
      </p>
    </div>
  );
}

/* ---------- NegotiationStep (one term of the deal) ---------- */

/**
 * A single agreement term (price, dates, payment terms). Shows the offer
 * currently on the table and lets the viewer accept it or send back a
 * counter. Once accepted it locks to a read-only "Agreed" row.
 */
export function NegotiationStep({
  label,
  pending,
  confirmed,
  confirmedValue,
  currentUser = "James",
  onAccept,
  onPropose,
  choices,
  placeholder,
}: {
  label: string;
  pending: Proposal | null;
  confirmed: boolean;
  confirmedValue: string | null;
  currentUser?: "James" | "John";
  onAccept: () => void;
  onPropose: (value: string) => void;
  choices?: string[];
  placeholder?: string;
}) {
  const [counter, setCounter] = useState("");

  if (confirmed) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-pm-success/30 bg-pm-success/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pm-success text-white">
            <Check className="h-3.5 w-3.5" aria-label="Agreed" />
          </span>
          <div>
            <p className="text-xs font-semibold text-pm-muted">{label}</p>
            <p className="text-sm font-bold text-pm-charcoal">
              {confirmedValue}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-pm-success/10 px-2.5 py-0.5 text-xs font-bold text-pm-success">
          Agreed
        </span>
      </div>
    );
  }

  const offeredByYou = pending?.from === currentUser;

  return (
    <div className="rounded-xl border border-pm-border bg-white px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-pm-charcoal">{label}</p>
        {pending && (
          <p className="text-xs text-pm-muted">
            {offeredByYou ? "You proposed" : `${pending.from} proposed`}
          </p>
        )}
      </div>

      {pending && (
        <p className="mt-1 text-lg font-extrabold text-pm-green-900">
          {pending.value}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-pm-green-900 px-4 text-sm font-semibold text-white hover:bg-pm-green-800"
        >
          <Check className="h-4 w-4" aria-hidden />
          Accept
        </button>

        {choices ? (
          <div className="flex flex-wrap gap-2">
            {choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => onPropose(choice)}
                className={cn(
                  "min-h-[40px] rounded-lg border px-3 text-sm font-medium transition-colors",
                  pending?.value === choice
                    ? "border-pm-green-900 text-pm-green-900"
                    : "border-pm-border text-pm-muted hover:border-pm-green-700",
                )}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const next = counter.trim();
              if (!next) return;
              onPropose(next);
              setCounter("");
            }}
          >
            <label htmlFor={`counter-${label}`} className="sr-only">
              Counter {label}
            </label>
            <input
              id={`counter-${label}`}
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              placeholder={placeholder ?? "Counter offer..."}
              className="min-h-[40px] w-full min-w-0 rounded-lg border border-pm-border bg-white px-3 text-sm focus:border-pm-green-700 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[40px] shrink-0 rounded-lg border border-pm-border px-3 text-sm font-semibold text-pm-charcoal hover:border-pm-green-900"
            >
              Counter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
