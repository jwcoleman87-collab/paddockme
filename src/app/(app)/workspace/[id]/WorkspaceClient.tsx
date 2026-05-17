"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  AgreementPanel,
  type SectionAgreementState,
  type WorkspaceParty,
} from "@/components/AgreementPanel";
import type { ArtefactDraft } from "@/components/ArtefactUploadDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { useFlash } from "@/components/FlashProvider";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { cn } from "@/lib/utils";
import { getTransportJobForAgreement } from "@/lib/dummyData";
import type {
  Agreement,
  AgreementArtefact,
  AgreementLifecycleEvent,
  AgreementLifecycleState,
  Message,
} from "@/lib/dummyData";

const partyProfile: Record<
  WorkspaceParty,
  { id: string; name: string; role: string; label: string; avatarUrl: string }
> = {
  A: {
    id: "farmer-a",
    name: "Dale",
    role: "Livestock owner",
    label: "Farmer A (Dale)",
    avatarUrl: "/avatars/dale.jpg",
  },
  B: {
    id: "farmer-b",
    name: "Brett",
    role: "Landowner",
    label: "Farmer B (Brett)",
    avatarUrl: "/avatars/brett.jpg",
  },
};

/**
 * Client wrapper for the workspace page.
 *
 * Owns three pieces of UI-only state shared between AgreementPanel and ChatPanel:
 *   1. `activeSectionId`     - which agreement section is anchoring the chat
 *   2. `sectionState`        - per-section, per-party "agree" toggles
 *   3. `lifecycleState`      - the current lifecycle state + audit history
 *
 * None of this is persisted. Persistence + RLS lands in Build 02 Step 4 (needs Supabase).
 */
export function WorkspaceClient({
  agreement,
  messages: initialMessages,
}: {
  agreement: Agreement;
  messages: Message[];
}) {
  const flash = useFlash();
  const [viewerParty, setViewerPartyState] = useState<WorkspaceParty>("A");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const linkedTransport = getTransportJobForAgreement(agreement.id);
  const transportHref = linkedTransport
    ? `/transport/${linkedTransport.id}`
    : undefined;

  // Read-through of the transport room's live state from localStorage so the
  // Transport tab in the workspace reflects whatever Farmer A / Driver have
  // confirmed and negotiated in the room. One-way: the workspace doesn't
  // write transport state, the transport room does.
  const [transportConfirmations, setTransportConfirmations] = useState<
    Record<string, { farmerA: boolean; farmerB: boolean; driver: boolean }>
  >(() =>
    linkedTransport
      ? Object.fromEntries(
          linkedTransport.sections.map((section) => [
            section.id,
            { ...section.confirmations },
          ])
        )
      : {}
  );
  const [transportQuotes, setTransportQuotes] = useState(
    linkedTransport?.quotes ?? []
  );
  const [acceptedTransportQuoteId, setAcceptedTransportQuoteId] = useState<
    string | undefined
  >(linkedTransport?.acceptedQuoteId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!linkedTransport) return;
    try {
      const raw = window.localStorage.getItem(
        `paddockme.transport.${linkedTransport.id}`
      );
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        confirmations?: Record<
          string,
          { farmerA: boolean; farmerB: boolean; driver: boolean }
        >;
        quotes?: typeof transportQuotes;
        acceptedQuoteId?: string;
      };
      if (parsed.confirmations) setTransportConfirmations(parsed.confirmations);
      if (parsed.quotes) setTransportQuotes(parsed.quotes);
      if (parsed.acceptedQuoteId !== undefined)
        setAcceptedTransportQuoteId(parsed.acceptedQuoteId);
    } catch {
      // ignore - localStorage may be unavailable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedTransport?.id]);

  function setViewerParty(next: WorkspaceParty) {
    if (next === viewerParty) return;
    setViewerPartyState(next);
    flash(`Viewing as ${partyProfile[next].label}.`, "info");
  }

  function sendMessage(body: string) {
    const sender = partyProfile[viewerParty];
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        threadId: agreement.id,
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

  function appendSystemMessage(body: string, sectionId?: string) {
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        threadId: agreement.id,
        senderId: "system",
        senderName: "PaddockME",
        senderRole: "System",
        body,
        time: shortTime(),
        sectionId,
      },
    ]);
  }

  const seedSectionState = useMemo(
    () =>
      Object.fromEntries(
        agreement.sections.map((section) => [
          section.id,
          { agreedByA: section.agreedByA, agreedByB: section.agreedByB },
        ])
      ),
    [agreement.sections]
  );
  const [sectionState, setSectionState] = useState<
    Record<string, SectionAgreementState>
  >(seedSectionState);
  const [lifecycleState, setLifecycleState] = useState<AgreementLifecycleState>(
    agreement.status
  );
  const [lifecycleHistory, setLifecycleHistory] = useState<
    AgreementLifecycleEvent[]
  >(agreement.lifecycleHistory);
  const [artefacts, setArtefacts] = useState<AgreementArtefact[]>(
    agreement.artefacts
  );

  const hydratedRef = useRef(false);
  const storageKey = `paddockme.workspace.${agreement.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          sectionState?: Record<string, SectionAgreementState>;
          lifecycleState?: AgreementLifecycleState;
          lifecycleHistory?: AgreementLifecycleEvent[];
          messages?: Message[];
          artefacts?: AgreementArtefact[];
        };
        if (parsed.sectionState) setSectionState(parsed.sectionState);
        if (parsed.lifecycleState) setLifecycleState(parsed.lifecycleState);
        if (parsed.lifecycleHistory)
          setLifecycleHistory(parsed.lifecycleHistory);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.artefacts) {
          setArtefacts(mergeArtefacts(agreement.artefacts, parsed.artefacts));
        }
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
    // Only hydrate once per agreement.
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          sectionState,
          lifecycleState,
          lifecycleHistory,
          messages,
          artefacts,
        })
      );
    } catch {
      // ignore - quota / private mode
    }
  }, [
    storageKey,
    sectionState,
    lifecycleState,
    lifecycleHistory,
    messages,
    artefacts,
  ]);

  const toggleAgreement = (sectionId: string, party: WorkspaceParty) => {
    // Guard - the panel only renders the viewer's own button as
    // interactive, but defend against rogue calls just in case.
    if (party !== viewerParty) return;
    setSectionState((current) => {
      const previous = current[sectionId] ?? {
        agreedByA: false,
        agreedByB: false,
      };
      const next: SectionAgreementState =
        party === "A"
          ? { ...previous, agreedByA: !previous.agreedByA }
          : { ...previous, agreedByB: !previous.agreedByB };
      const justMutuallyAgreed =
        next.agreedByA &&
        next.agreedByB &&
        !(previous.agreedByA && previous.agreedByB);
      if (justMutuallyAgreed) {
        const section = agreement.sections.find((s) => s.id === sectionId);
        if (section) {
          flash(
            `Both parties agree on ${section.label}.`,
            "success"
          );
          appendSystemMessage(
            `Both parties agree on "${section.label}".`,
            section.id
          );
        }
      }
      return { ...current, [sectionId]: next };
    });
  };

  const advanceLifecycle = (to: AgreementLifecycleState) => {
    const byParty = viewerParty === "A" ? "Farmer A" : "Farmer B";
    setLifecycleState((from) => {
      setLifecycleHistory((history) => [
        ...history,
        {
          at: nowLabel(),
          from,
          to,
          byParty,
          note: `Advanced from ${from} to ${to}.`,
        },
      ]);
      appendSystemMessage(
        from
          ? `Agreement moved from ${from} to ${to} by ${byParty}.`
          : `Agreement entered ${to}.`
      );
      return to;
    });
    flash(
      to === "Completed"
        ? "Agreement marked complete."
        : `Moved to ${to}.`,
      "success"
    );
  };

  const addArtefact = (draft: ArtefactDraft) => {
    const newArtefact: AgreementArtefact = {
      id: `local-art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: draft.label,
      kind: draft.kind,
      description: draft.description,
      uploadedBy: viewerParty === "A" ? "farmerA" : "farmerB",
      sectionId: draft.sectionId,
    };
    setArtefacts((current) => [...current, newArtefact]);
    flash(`Artefact "${draft.label}" added.`, "success");
    appendSystemMessage(
      `${partyProfile[viewerParty].label} added artefact "${draft.label}".`,
      draft.sectionId
    );
  };

  const cancelLifecycle = () => {
    const byParty = viewerParty === "A" ? "Farmer A" : "Farmer B";
    setLifecycleState((from) => {
      if (from === "Cancelled" || from === "Completed") return from;
      setLifecycleHistory((history) => [
        ...history,
        {
          at: nowLabel(),
          from,
          to: "Cancelled",
          byParty,
          note: "Agreement cancelled from the workspace.",
        },
      ]);
      appendSystemMessage(`Agreement cancelled by ${byParty}.`);
      flash("Agreement cancelled.", "warning");
      return "Cancelled";
    });
  };

  const timelineItems = useMemo(() => {
    const mutuallyAgreedCount = agreement.sections.reduce((count, section) => {
      const state = sectionState[section.id] ?? section;
      return state.agreedByA && state.agreedByB ? count + 1 : count;
    }, 0);
    const totalSections = agreement.sections.length;
    const allAgreed = mutuallyAgreedCount === totalSections;

    return [
      {
        title: "Request matched to paddock",
        detail: "100 cattle request matched with Glenbarra River Paddocks.",
        complete: true,
      },
      {
        title: "Terms under discussion",
        detail: `${mutuallyAgreedCount} of ${totalSections} sections mutually agreed. Tap a section to anchor the chat and step through the wording.`,
        complete: allAgreed,
      },
      {
        title: "Final agreement record",
        detail:
          "When every section shows 'Both parties agree', the artefact becomes the binding agreement record.",
        complete: allAgreed,
      },
    ];
  }, [agreement.sections, sectionState]);

  return (
    <div className="space-y-5">
      <section
        aria-label="Prototype party switcher"
        className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Viewing as
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Prototype
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose which side of the agreement you represent"
          className="grid gap-2 sm:grid-cols-2"
        >
          {(["A", "B"] as const).map((party) => {
            const profile = partyProfile[party];
            const active = party === viewerParty;
            return (
              <button
                key={party}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setViewerParty(party)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl border px-4 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                )}
              >
                <Avatar
                  name={profile.name}
                  src={profile.avatarUrl}
                  size="md"
                  ring={active}
                  className="shrink-0"
                />
                <div>
                  <span className="block text-sm font-bold">{profile.label}</span>
                  <span
                    className={cn(
                      "block text-xs",
                      active ? "text-sage-glow" : "text-bark/60"
                    )}
                  >
                    {profile.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <SplitWorkspace
        leftLabel="Agreement"
        rightLabel="Chat"
        left={
          <div className="space-y-5">
            <AgreementPanel
              agreement={agreement}
              activeSectionId={activeSectionId}
              onSelectSection={(id) => setActiveSectionId(id)}
              sectionState={sectionState}
              onToggleAgreement={toggleAgreement}
              timelineItems={timelineItems}
              lifecycleState={lifecycleState}
              lifecycleHistory={lifecycleHistory}
              onAdvanceLifecycle={advanceLifecycle}
              onCancelLifecycle={cancelLifecycle}
              transportHref={transportHref}
              viewerParty={viewerParty}
              artefacts={artefacts}
              onAddArtefact={addArtefact}
              transportJob={linkedTransport}
              transportConfirmations={transportConfirmations}
              transportQuotes={transportQuotes}
              acceptedTransportQuoteId={acceptedTransportQuoteId}
            />
          </div>
        }
        right={
          <ChatPanel
            title="Farmer A and Farmer B"
            messages={messages}
            onlineCount={2}
            sections={agreement.sections}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onSend={sendMessage}
            composerSenderLabel={partyProfile[viewerParty].label}
          />
        }
      />
    </div>
  );
}

function mergeArtefacts(
  seedArtefacts: AgreementArtefact[],
  storedArtefacts: AgreementArtefact[]
): AgreementArtefact[] {
  const byId = new Map<string, AgreementArtefact>();
  for (const artefact of seedArtefacts) byId.set(artefact.id, artefact);
  for (const artefact of storedArtefacts) byId.set(artefact.id, artefact);
  return Array.from(byId.values());
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

function shortTime(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}
