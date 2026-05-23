"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Inbox, MessageSquare, Truck } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  INBOX_UPDATE_EVENT,
  getSeenCounts,
  unreadCountFor,
} from "@/lib/inbox";
import { cn } from "@/lib/utils";
import { featuredFarmers } from "@/lib/dummyData";
import type {
  Agreement,
  Farmer,
  Message,
  TransportJob,
} from "@/lib/dummyData";

type Thread = {
  kind: "agreement" | "transport";
  id: string;
  href: string;
  title: string;
  subtitle: string;
  otherParticipants: Farmer[];
  lastMessage?: Message;
  badge?: { label: string; tone: "success" | "warning" | "info" | "neutral" };
  unreadCount: number;
};

type Props = {
  activePersonaId?: string;
  agreements: Agreement[];
  transportJobs: TransportJob[];
  farmers: Farmer[];
  agreementMessages: Record<string, Message[]>;
  transportMessages: Record<string, Message[]>;
};

/**
 * Per-persona messaging inbox. Aggregates the latest message from every
 * agreement workspace and transport room the active persona is part of, so
 * Dale doesn't have to remember which room a reply landed in.
 *
 * Merges localStorage-stored messages over the seed list so the inbox reflects
 * anything the user has typed in the prototype since their last refresh.
 */
export function MessagesClient({
  activePersonaId: serverPersonaId,
  agreements,
  transportJobs,
  farmers,
  agreementMessages,
  transportMessages,
}: Props) {
  const farmerById = useMemo(() => {
    const map = new Map<string, Farmer>();
    for (const farmer of farmers) map.set(farmer.id, farmer);
    return map;
  }, [farmers]);

  const [activePersonaId, setActivePersonaId] = useState<string | undefined>(
    serverPersonaId
  );
  const [localMessages, setLocalMessages] = useState<{
    agreement: Record<string, Message[]>;
    transport: Record<string, Message[]>;
  }>({ agreement: {}, transport: {} });
  const [seenCounts, setSeenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    function readPersona() {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          undefined
        );
      } catch {
        return undefined;
      }
    }
    setActivePersonaId(readPersona() ?? serverPersonaId);

    const agreementMessagesById: Record<string, Message[]> = {};
    const transportMessagesById: Record<string, Message[]> = {};

    for (const agreement of agreements) {
      try {
        const raw = window.localStorage.getItem(
          `paddockme.workspace.${agreement.id}`
        );
        if (!raw) continue;
        const parsed = JSON.parse(raw) as { messages?: Message[] };
        if (parsed.messages) agreementMessagesById[agreement.id] = parsed.messages;
      } catch {
        // ignore
      }
    }
    for (const job of transportJobs) {
      try {
        const raw = window.localStorage.getItem(`paddockme.transport.${job.id}`);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as { messages?: Message[] };
        if (parsed.messages) transportMessagesById[job.id] = parsed.messages;
      } catch {
        // ignore
      }
    }
    setLocalMessages({
      agreement: agreementMessagesById,
      transport: transportMessagesById,
    });
    setSeenCounts(getSeenCounts());

    function onChange() {
      setActivePersonaId(readPersona() ?? serverPersonaId);
    }
    function onInboxUpdate() {
      setSeenCounts(getSeenCounts());
    }
    window.addEventListener("paddockme:persona-change", onChange);
    window.addEventListener(INBOX_UPDATE_EVENT, onInboxUpdate);
    return () => {
      window.removeEventListener("paddockme:persona-change", onChange);
      window.removeEventListener(INBOX_UPDATE_EVENT, onInboxUpdate);
    };
  }, [agreements, transportJobs, serverPersonaId]);

  // Fall back to the first featured persona (Dale today) when no persona is
  // active. Avoids landing on a non-featured farmer when /messages is hit
  // directly without first visiting /agreements.
  const personaId = activePersonaId ?? featuredFarmers[0]?.id ?? farmers[0]?.id;
  const persona = personaId ? farmerById.get(personaId) : undefined;

  const threads = useMemo<Thread[]>(() => {
    if (!personaId) return [];
    const list: Thread[] = [];

    for (const agreement of agreements) {
      const isParticipant =
        agreement.farmerAId === personaId || agreement.farmerBId === personaId;
      if (!isParticipant) continue;
      const farmerA = farmerById.get(agreement.farmerAId);
      const farmerB = farmerById.get(agreement.farmerBId);
      const others = [farmerA, farmerB].filter(
        (f): f is Farmer => !!f && f.id !== personaId
      );
      const messages =
        localMessages.agreement[agreement.id] ??
        agreementMessages[agreement.id] ??
        [];
      list.push({
        kind: "agreement",
        id: agreement.id,
        href: `/workspace/${agreement.id}`,
        title: others.map((f) => f.name.split(" ")[0]).join(" & ") || "Agreement",
        subtitle: `Agistment · ${agreement.livestock}`,
        otherParticipants: others,
        lastMessage: messages[messages.length - 1],
        badge: badgeForAgreementStatus(agreement.status),
        unreadCount: unreadCountFor(agreement.id, messages.length),
      });
    }

    for (const job of transportJobs) {
      const isParticipant =
        job.farmerAId === personaId ||
        job.farmerBId === personaId ||
        job.driverId === personaId;
      if (!isParticipant) continue;
      const others = [job.farmerAId, job.farmerBId, job.driverId]
        .map((id) => farmerById.get(id))
        .filter((f): f is Farmer => !!f && f.id !== personaId);
      const messages =
        localMessages.transport[job.id] ?? transportMessages[job.id] ?? [];
      list.push({
        kind: "transport",
        id: job.id,
        href: `/transport/${job.id}`,
        title:
          others.map((f) => f.name.split(" ")[0]).join(", ") ||
          "Transport room",
        subtitle: `Transport · ${job.routeSummary ?? job.pickup + " → " + job.destination}`,
        otherParticipants: others,
        lastMessage: messages[messages.length - 1],
        badge: badgeForTransportStatus(job.status),
        unreadCount: unreadCountFor(job.id, messages.length),
      });
    }

    return list.sort((a, b) => {
      const at = a.lastMessage?.time ?? "";
      const bt = b.lastMessage?.time ?? "";
      return bt.localeCompare(at);
    });
  }, [
    personaId,
    agreements,
    transportJobs,
    farmerById,
    agreementMessages,
    transportMessages,
    localMessages,
    seenCounts,
  ]);

  if (!persona) {
    return <EmptyState reason="no-persona" />;
  }

  if (threads.length === 0) {
    return <EmptyState reason="no-threads" personaName={persona.name} />;
  }

  return (
    <>
      <p className="mb-4 text-sm font-medium text-bark/75">
        Viewing as{" "}
        <span className="font-bold text-sage-deep">{persona.name.split(" ")[0]}</span>
        . Switch personas in the home view to see other inboxes.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {threads.map((thread) => (
          <ThreadCard key={`${thread.kind}-${thread.id}`} thread={thread} />
        ))}
      </div>
    </>
  );
}

function ThreadCard({ thread }: { thread: Thread }) {
  const Icon = thread.kind === "transport" ? Truck : MessageSquare;
  return (
    <Link
      href={thread.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white rounded-2xl"
    >
      <Card className="flex h-full flex-col gap-3 transition hover:border-sage/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex -space-x-2">
              {thread.otherParticipants.slice(0, 3).map((farmer) => (
                <Avatar
                  key={farmer.id}
                  name={farmer.name}
                  src={farmer.avatarUrl}
                  size="md"
                  className="ring-2 ring-warm-white"
                />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
                <Icon className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                {thread.subtitle}
              </p>
              <h2 className="mt-0.5 truncate text-lg font-bold text-sage-deep">
                {thread.title}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {thread.unreadCount > 0 && (
              <span
                aria-label={`${thread.unreadCount} unread ${thread.unreadCount === 1 ? "message" : "messages"}`}
                className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-sage-deep px-2 text-[0.7rem] font-bold text-cream"
              >
                {thread.unreadCount}
              </span>
            )}
            {thread.badge && (
              <StatusBadge tone={thread.badge.tone}>{thread.badge.label}</StatusBadge>
            )}
          </div>
        </div>

        {thread.lastMessage ? (
          <div className="rounded-xl border border-mist bg-warm-white px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone">
              {thread.lastMessage.senderName} · {thread.lastMessage.time}
            </p>
            <p
              className={cn(
                "mt-1 text-sm leading-snug text-bark/85",
                "line-clamp-2"
              )}
            >
              {thread.lastMessage.body}
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-mist bg-cream/55 px-3 py-2.5 text-sm font-medium text-bark/65">
            No messages yet. Open the room to start the conversation.
          </p>
        )}

        <div className="mt-auto flex items-center justify-end text-sm font-semibold text-sage-deep">
          Open
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
        </div>
      </Card>
    </Link>
  );
}

function EmptyState({
  reason,
  personaName,
}: {
  reason: "no-persona" | "no-threads";
  personaName?: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        <Inbox className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-sage-deep">
        {reason === "no-persona"
          ? "Pick a persona to see their inbox."
          : `${personaName?.split(" ")[0] ?? "You"} have no conversations yet.`}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        {reason === "no-persona"
          ? "Head back to the home view and switch to Dale, Brett, or Wayne."
          : "Workspace and transport-room threads land here once they get going."}
      </p>
    </Card>
  );
}

function badgeForAgreementStatus(status: Agreement["status"]): Thread["badge"] {
  switch (status) {
    case "Active":
      return { label: "Active", tone: "success" };
    case "Negotiating":
      return { label: "Negotiating", tone: "warning" };
    case "Ready to finalise":
      return { label: "Ready to finalise", tone: "info" };
    case "Completed":
      return { label: "Completed", tone: "info" };
    case "Cancelled":
      return { label: "Cancelled", tone: "neutral" };
    default:
      return { label: status, tone: "neutral" };
  }
}

function badgeForTransportStatus(
  status: TransportJob["status"]
): Thread["badge"] {
  switch (status) {
    case "completed":
      return { label: "Completed", tone: "success" };
    case "arrived":
      return { label: "Arrived", tone: "success" };
    case "in_transit":
      return { label: "In transit", tone: "info" };
    case "loading":
      return { label: "Loading", tone: "info" };
    case "accepted":
      return { label: "Accepted", tone: "info" };
    case "available":
      return { label: "Open", tone: "warning" };
    case "cancelled":
      return { label: "Cancelled", tone: "neutral" };
    default:
      return undefined;
  }
}
