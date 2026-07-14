"use client";

import { useState } from "react";
import { MessageSquareText, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PmAvatar } from "@/components/paddockme/PmAvatar";
import { paddockmeImages } from "@/lib/paddockmeImages";
import {
  demoTransportRoomParticipants,
  transportRoomSeedMessages,
  type TransportRoomMessage,
} from "@/lib/paddockmeDemoData";
import {
  demoThreadTime,
  useDemoThread,
  type DemoThreadMessage,
} from "@/lib/demoThread";
import type { RequestDetails } from "@/lib/paddockmeWorkflow";

const THREAD_ID = "transport-room-1023";

const roleAvatar: Record<TransportRoomMessage["role"], string> = {
  owner: "bg-pm-green-900 text-white",
  landowner: "bg-pm-gold-500 text-pm-charcoal",
  transporter: "bg-pm-charcoal text-white",
};

const initials: Record<TransportRoomMessage["role"], string> = {
  owner: "JC",
  landowner: "GH",
  transporter: "WT",
};

const avatars: Record<TransportRoomMessage["role"], string> = {
  owner: paddockmeImages.avatarJames,
  landowner: paddockmeImages.avatarJohn,
  transporter: paddockmeImages.avatarWayne,
};

export type TransporterThread = ReturnType<typeof useTransporterThread>;

export function useTransporterThread(request: RequestDetails) {
  const thread = useDemoThread(THREAD_ID);
  const seeds = transportRoomSeedMessages(request);
  const messages: TransportRoomMessage[] = [
    ...seeds,
    ...thread.messages.map(toRoomMessage),
  ];

  function appendWayne(text: string) {
    thread.append({ sender: "Wayne Transport", role: "transporter", text });
  }

  function appendSharedUpdate(update: {
    sender: string;
    role: TransportRoomMessage["role"];
    text: string;
  }) {
    thread.append(update);
  }

  return {
    messages,
    hasHydrated: thread.hasHydrated,
    appendWayne,
    appendSharedUpdate,
  };
}

function toRoomMessage(message: DemoThreadMessage): TransportRoomMessage {
  return {
    sender: message.sender,
    role: message.role,
    time: demoThreadTime(message.sentAt),
    text: message.text,
  };
}

export function TransportDiscussionPanel({
  messages,
  onSend,
  title = "Shared discussion",
  description = "Wayne can clarify the movement openly with both farmers before quoting.",
  updatesLabel = "Shared updates",
  className,
}: {
  messages: TransportRoomMessage[];
  onSend: (text: string) => void;
  title?: string;
  description?: string;
  updatesLabel?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function send() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <section className={cn("min-w-0 rounded-2xl border border-pm-border bg-white shadow-sm", className)} aria-label={updatesLabel}>
      <div className="border-b border-pm-border bg-pm-cream-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pm-green-900 text-white">
            <MessageSquareText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-pm-charcoal">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-pm-muted">{description}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {demoTransportRoomParticipants.map((participant, index) => {
            const role = (["owner", "landowner", "transporter"] as const)[index];
            return (
              <div key={participant.name} className="flex min-w-0 items-center gap-2 rounded-xl border border-pm-border bg-white px-3 py-2">
                <PmAvatar
                  src={participant.avatar}
                  initials={participant.initials}
                  fallbackClassName={roleAvatar[role]}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-pm-charcoal">{participant.name}</span>
                  <span className="block text-xs text-pm-muted">{participant.role}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5" aria-live="polite">
        <h3 className="sr-only">{updatesLabel}</h3>
        {messages.map((message, index) => {
          const mine = message.role === "transporter";
          return (
            <article key={`${message.sender}-${message.time}-${index}`} className={cn("flex min-w-0 gap-2.5", mine && "flex-row-reverse")}>
              <PmAvatar
                src={avatars[message.role]}
                initials={initials[message.role]}
                fallbackClassName={roleAvatar[message.role]}
              />
              <div className={cn("min-w-0 max-w-[82%]", mine && "text-right")}>
                <p className={cn("flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-pm-muted", mine && "justify-end")}>
                  <span className="font-bold text-pm-charcoal">{message.sender}</span>
                  <span>{message.time}</span>
                </p>
                <p className={cn(
                  "mt-1 inline-block rounded-2xl border px-4 py-2.5 text-left text-sm leading-relaxed",
                  mine
                    ? "rounded-br-sm border-pm-green-900 bg-pm-green-900 text-white"
                    : "rounded-bl-sm border-pm-border bg-pm-cream-50 text-pm-charcoal",
                )}>
                  {message.text}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <form
        className="border-t border-pm-border bg-pm-cream-50 p-3 sm:p-4"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label htmlFor="transporter-message" className="mb-2 flex items-center gap-2 text-sm font-bold text-pm-charcoal">
          <Users className="h-4 w-4 text-pm-green-900" aria-hidden />
          Message James and John as Wayne
        </label>
        <div className="flex items-center gap-2">
          <input
            id="transporter-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about access, timing or handling…"
            className="min-h-11 min-w-0 flex-1 rounded-full border border-pm-border bg-white px-4 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white transition-colors hover:bg-pm-green-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>
    </section>
  );
}
