"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import type { ArtefactDraft } from "@/components/ArtefactUploadDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { useFlash } from "@/components/FlashProvider";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import {
  TransportPanel,
  TransportPaymentCallout,
  type TransportQuoteDraft,
} from "@/components/TransportPanel";
import { markThreadSeen } from "@/lib/inbox";
import { cn } from "@/lib/utils";
import {
  type Message,
  type TransportArtefact,
  type TransportJob,
  type TransportQuote,
  type TransportRole,
  type TransportTimelineEntry,
} from "@/lib/dummyData";
import {
  formatTransportStatus,
} from "@/lib/prototypeStore";
import {
  createTransportMessage,
  listTransportJobs,
  updateTransportJobStatus,
} from "@/lib/data/repositories";
import type { TransportJobStatus } from "@/lib/dummyData";

const roles: { id: TransportRole; label: string; helper: string }[] = [
  {
    id: "farmerA",
    label: "Livestock owner",
    helper: "Livestock owner",
  },
  {
    id: "farmerB",
    label: "Landowner",
    helper: "Landowner",
  },
  {
    id: "driver",
    label: "Driver",
    helper: "Transport provider",
  },
];

const senderProfile: Record<
  TransportRole,
  { id: string; name: string; role: string; avatarUrl: string }
> = {
  farmerA: { id: "farmer-a", name: "Livestock owner", role: "Livestock owner", avatarUrl: "/avatars/dale.jpg" },
  farmerB: { id: "farmer-b", name: "Landowner", role: "Landowner", avatarUrl: "/avatars/brett.jpg" },
  driver: { id: "driver-1", name: "Transport provider", role: "Driver", avatarUrl: "/avatars/wayne.jpg" },
};

export function TransportClient({
  job,
  messages: initialMessages,
}: {
  job: TransportJob;
  messages: Message[];
}) {
  const flash = useFlash();
  const [jobState, setJobState] = useState(job);
  const [allTransportJobs, setAllTransportJobs] = useState<TransportJob[]>([
    job,
  ]);
  const [role, setRoleState] = useState<TransportRole>("farmerA");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Inbox unread tracker - mark the transport room as seen up to the current
  // count whenever it changes while the room is open.
  useEffect(() => {
    markThreadSeen(job.id, messages.length);
  }, [job.id, messages.length]);

  const [confirmations, setConfirmations] = useState(() =>
    Object.fromEntries(
      job.sections.map((section) => [section.id, { ...section.confirmations }])
    )
  );
  const [artefacts, setArtefacts] = useState<TransportArtefact[]>(job.artefacts);
  const [quotes, setQuotes] = useState<TransportQuote[]>(job.quotes ?? []);
  const [acceptedQuoteId, setAcceptedQuoteId] = useState<string | undefined>(
    job.acceptedQuoteId
  );
  const openRfts = useMemo(
    () =>
      allTransportJobs.filter(
        (item) => item.id !== jobState.id && item.status === "available"
      ),
    [allTransportJobs, jobState.id]
  );

  const hydratedRef = useRef(false);
  const storageKey = `paddockme.transport.${job.id}`;

  useEffect(() => {
    void listTransportJobs().then((jobs) => setAllTransportJobs(jobs));
  }, [job.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        void listTransportJobs().then((jobs) => {
          setAllTransportJobs(jobs);
          const localJob = jobs.find((item) => item.id === job.id);
          if (localJob) setJobState(localJob);
        });
        if (parsed.confirmations) setConfirmations(parsed.confirmations);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.artefacts) setArtefacts(parsed.artefacts);
        if (parsed.quotes) setQuotes(parsed.quotes);
        if (parsed.acceptedQuoteId !== undefined)
          setAcceptedQuoteId(parsed.acceptedQuoteId);
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          confirmations,
          messages,
          artefacts,
          quotes,
          acceptedQuoteId,
        })
      );
    } catch {
      // ignore
    }
  }, [storageKey, confirmations, messages, artefacts, quotes, acceptedQuoteId]);

  function setRole(next: TransportRole) {
    if (next === role) return;
    setRoleState(next);
    flash(`Role view changed to ${senderProfile[next].name} (${senderProfile[next].role}).`, "info");
  }

  const derivedTimeline: TransportTimelineEntry[] = useMemo(() => {
    const sectionFullyConfirmed = (sectionId: string) => {
      const state = confirmations[sectionId];
      if (!state) return false;
      return state.farmerA && state.farmerB && state.driver;
    };
    return job.timeline.map((entry, index) => {
      // Map each timeline entry to a derived complete state based on
      // which section confirmations gate it. The first entry ("Job booked")
      // is always complete - the room exists.
      let complete: boolean;
      switch (index) {
        case 0:
          complete = true;
          break;
        case 1:
          complete = sectionFullyConfirmed("pickup");
          break;
        case 2:
          complete = sectionFullyConfirmed("route");
          break;
        case 3:
          complete = sectionFullyConfirmed("delivery");
          break;
        case 4:
          complete = sectionFullyConfirmed("return");
          break;
        default:
          complete = entry.complete;
      }
      return { ...entry, complete };
    });
  }, [confirmations, job.timeline]);

  function toggleConfirmation(sectionId: string) {
    setConfirmations((current) => {
      const previous = current[sectionId] ?? { farmerA: false, farmerB: false, driver: false };
      const next = { ...previous, [role]: !previous[role] };
      const wasAllConfirmed = previous.farmerA && previous.farmerB && previous.driver;
      const nowAllConfirmed = next.farmerA && next.farmerB && next.driver;
      const section = job.sections.find((s) => s.id === sectionId);
      if (section && next[role] && !previous[role]) {
        appendSystemMessage(
          `${senderProfile[role].name} confirmed "${section.label}".`,
          sectionId
        );
      }
      if (section && nowAllConfirmed && !wasAllConfirmed) {
        flash(`All three parties confirmed ${section.label}.`, "success");
        appendSystemMessage(
          `All three parties have confirmed "${section.label}". Step locked in.`,
          sectionId
        );
      }
      return { ...current, [sectionId]: next };
    });
  }

  function addArtefact(draft: ArtefactDraft) {
    const newArtefact: TransportArtefact = {
      id: `local-art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: draft.label,
      kind: draft.kind,
      description: draft.description,
      uploadedBy: role,
      sectionId: draft.sectionId,
    };
    setArtefacts((current) => [...current, newArtefact]);
    flash(`Artefact "${draft.label}" added.`, "success");
    appendSystemMessage(
      `${senderProfile[role].name} added artefact "${draft.label}".`,
      draft.sectionId
    );
  }

  function proposeQuote(draft: TransportQuoteDraft) {
    if (role === "farmerB") return; // landowner-visibility wall
    const proposer: "farmerA" | "driver" = role === "driver" ? "driver" : "farmerA";
    const newQuote: TransportQuote = {
      id: `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      transportJobId: job.id,
      proposedBy: proposer,
      basis: draft.basis,
      amount: draft.amount,
      currency: draft.currency,
      paymentTerms: draft.paymentTerms,
      status: "pending",
      previousQuoteId: draft.previousQuoteId,
      at: nowLabel(),
      note: draft.note,
    };
    setQuotes((current) => {
      // If countering, mark the previous quote as countered.
      if (draft.previousQuoteId) {
        return [
          ...current.map((q) =>
            q.id === draft.previousQuoteId && q.status === "pending"
              ? { ...q, status: "countered" as const }
              : q
          ),
          newQuote,
        ];
      }
      return [...current, newQuote];
    });
    const basisLabel =
      draft.basis === "per_head"
        ? "per head"
        : draft.basis === "per_km"
          ? "per km"
          : "flat";
    const headline = `$${draft.amount.toFixed(2)} ${draft.currency} ${basisLabel}`;
    flash(
      draft.previousQuoteId ? `Counter sent: ${headline}.` : `Quote sent: ${headline}.`,
      "success"
    );
    appendSystemMessage(
      `${senderProfile[role].name} ${draft.previousQuoteId ? "countered" : "proposed"} a transport rate of ${headline}.`
    );
  }

  function acceptQuote(quoteId: string) {
    if (role === "farmerB") return;
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote || quote.status !== "pending") return;
    if (quote.proposedBy === role) return; // can't accept your own
    const at = nowLabel();
    setQuotes((current) =>
      current.map((q) =>
        q.id === quoteId ? { ...q, status: "accepted" as const, acceptedAt: at } : q
      )
    );
    setAcceptedQuoteId(quoteId);
    flash("Transport rate accepted.", "success");
    appendSystemMessage(
      `${senderProfile[role].name} accepted the transport rate of $${quote.amount.toFixed(2)} ${quote.currency}.`
    );
    appendSystemMessage(
      "Transport payable opened. Payment rails are not connected yet."
    );
  }

  function rejectQuote(quoteId: string) {
    if (role === "farmerB") return;
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote || quote.status !== "pending") return;
    if (quote.proposedBy === role) return;
    setQuotes((current) =>
      current.map((q) =>
        q.id === quoteId ? { ...q, status: "rejected" as const } : q
      )
    );
    flash("Quote rejected.", "warning");
    appendSystemMessage(
      `${senderProfile[role].name} rejected the proposed rate of $${quote.amount.toFixed(2)} ${quote.currency}.`
    );
  }

  function appendSystemMessage(body: string, sectionId?: string) {
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        threadId: job.id,
        senderId: "system",
        senderName: "PaddockME",
        senderRole: "System",
        body,
        time: shortTime(),
        sectionId,
      },
    ]);
  }

  const sectionsForChat = job.sections.map((section) => ({
    id: section.id,
    label: section.label,
  }));

  function sendMessage(body: string) {
    const sender = senderProfile[role];
    void createTransportMessage({
      transportJobId: jobState.id,
      body,
      sectionId: activeSectionId ?? undefined,
    });
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        threadId: job.id,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        senderAvatarUrl: sender.avatarUrl,
        body,
        time: shortTime(),
        sectionId: activeSectionId ?? undefined,
      },
    ]);
  }

  const composerSenderLabel = `${senderProfile[role].name} (${senderProfile[role].role})`;

  async function setStatus(status: TransportJobStatus) {
    const { job: updated } = await updateTransportJobStatus(jobState.id, status);
    if (!updated) {
      flash("Couldn't update the status. Please try again.", "warning");
      return;
    }
    setJobState(updated);
    flash(`Status updated: ${formatTransportStatus(status)}.`, "success");
    appendSystemMessage(`${senderProfile[role].name} updated transport status to ${formatTransportStatus(status)}.`);
  }

  const acceptedQuote = acceptedQuoteId
    ? quotes.find((quote) => quote.id === acceptedQuoteId)
    : undefined;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Job status
            </p>
            <h2 className="mt-1 text-xl font-bold text-sage-deep">
              {formatTransportStatus(jobState.status)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["accepted", "loading", "in_transit", "arrived", "completed"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatus(status)}
                disabled={role !== "driver" || jobState.status === status}
                className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-mist bg-warm-white px-3 py-1 text-xs font-bold text-bark transition hover:border-sage/40 hover:bg-sage-mist disabled:cursor-not-allowed disabled:opacity-50"
              >
                {formatTransportStatus(status)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {role === "farmerA" && acceptedQuote && (
        <TransportPaymentCallout job={jobState} quote={acceptedQuote} />
      )}

      <section
        aria-label="Transport role switcher"
        className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Role view
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Participant view
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose your role for this transport room"
          className="grid gap-2 sm:grid-cols-3"
        >
          {roles.map((option) => {
            const active = option.id === role;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRole(option.id)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl border px-4 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                )}
              >
                <Avatar
                  name={senderProfile[option.id].name}
                  src={senderProfile[option.id].avatarUrl}
                  size="md"
                  ring={active}
                  className="shrink-0"
                />
                <div>
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span
                    className={cn(
                      "block text-xs",
                      active ? "text-sage-glow" : "text-bark/60"
                    )}
                  >
                    {option.helper}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <SplitWorkspace
        leftLabel="Transport"
        rightLabel="Group chat"
        left={
          <TransportPanel
            job={jobState}
            role={role}
            activeSectionId={activeSectionId}
            onSelectSection={(id) => setActiveSectionId(id)}
            confirmations={confirmations}
            onToggleConfirmation={toggleConfirmation}
            timeline={derivedTimeline}
            artefacts={artefacts}
            onAddArtefact={addArtefact}
            quotes={quotes}
            acceptedQuoteId={acceptedQuoteId}
            onProposeQuote={proposeQuote}
            onAcceptQuote={acceptQuote}
            onRejectQuote={rejectQuote}
            openRfts={openRfts}
          />
        }
        right={
          <ChatPanel
            title="Livestock owner, Landowner and Driver"
            messages={messages}
            onlineCount={3}
            sections={sectionsForChat}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onSend={sendMessage}
            composerSenderLabel={composerSenderLabel}
          />
        }
      />
    </div>
  );
}

function shortTime(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function nowLabel(): string {
  return new Date().toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
