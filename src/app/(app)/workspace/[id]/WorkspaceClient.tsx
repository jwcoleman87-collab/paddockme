"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import {
  AgreementPanel,
  type SectionAgreementState,
  type WorkspaceParty,
} from "@/components/AgreementPanel";
import type { ArtefactDraft } from "@/components/ArtefactUploadDialog";
import { ChatPanel } from "@/components/ChatPanel";
import { useFlash } from "@/components/FlashProvider";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { markThreadSeen } from "@/lib/inbox";
import { cn } from "@/lib/utils";
import {
  createAgreementArtefact,
  createAgreementMessage,
  getAgreementLiveState,
  getCurrentUserId,
  listAgreementMessages,
  listTransportJobs,
  requestTransportJob,
  updateAgreementSectionAgreement,
  updateAgreementSectionValue,
  updateAgreementStatusRecord,
} from "@/lib/data/repositories";
import type {
  Agreement,
  AgreementArtefact,
  AgreementLifecycleEvent,
  AgreementLifecycleState,
  AgreementSection,
  Message,
  TransportJob,
} from "@/lib/dummyData";

const fallbackPartyProfile: Record<
  WorkspaceParty,
  { id: string; name: string; role: string; label: string; avatarUrl: string }
> = {
  A: {
    id: "party-a",
    name: "Livestock owner",
    role: "Livestock owner",
    label: "Livestock owner",
    avatarUrl: "",
  },
  B: {
    id: "party-b",
    name: "Landowner",
    role: "Landowner",
    label: "Landowner",
    avatarUrl: "",
  },
};

/**
 * Client wrapper for the agreement workspace (spec §6.9 - DESIGN-LOCKED).
 * Production-only: the viewer's side is detected from the signed-in account,
 * and all state persists in Supabase via the repository layer. Demo mode
 * (persona switching and browser persistence) is retired.
 */
export function WorkspaceClient({
  agreement,
  messages: initialMessages,
}: {
  agreement: Agreement;
  messages: Message[];
}) {
  const flash = useFlash();
  const partyProfile = useMemo(
    () => ({
      A: {
        ...fallbackPartyProfile.A,
        id: agreement.farmerAId,
        name: agreement.farmerAName ?? fallbackPartyProfile.A.name,
        label: agreement.farmerAName ?? fallbackPartyProfile.A.label,
      },
      B: {
        ...fallbackPartyProfile.B,
        id: agreement.farmerBId,
        name: agreement.farmerBName ?? fallbackPartyProfile.B.name,
        label: agreement.farmerBName ?? fallbackPartyProfile.B.label,
      },
    }),
    [agreement.farmerAId, agreement.farmerAName, agreement.farmerBId, agreement.farmerBName]
  );
  const [viewerParty, setViewerPartyState] = useState<WorkspaceParty>("A");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // Section content is editable (dates, pickup address, terms...), so it
  // lives in state rather than reading agreement.sections directly. Kept in
  // sync with the other party via the live-state poll.
  const [sectionsContent, setSectionsContent] = useState<AgreementSection[]>(
    agreement.sections
  );
  const liveAgreement = useMemo(
    () => ({ ...agreement, sections: sectionsContent }),
    [agreement, sectionsContent]
  );

  // Mark this workspace's thread as "seen up to the current message count"
  // whenever it changes while the workspace is open. The inbox uses this to
  // dim cards back to "all caught up" after the user opens the room.
  useEffect(() => {
    markThreadSeen(agreement.id, messages.length);
  }, [agreement.id, messages.length]);

  // Detect which side of the agreement the signed-in user is.
  useEffect(() => {
    void getCurrentUserId().then((userId) => {
      if (!userId) return;
      if (userId === agreement.farmerBId) setViewerPartyState("B");
      if (userId === agreement.farmerAId) setViewerPartyState("A");
    });
  }, [agreement.farmerAId, agreement.farmerBId]);

  // Live chat sync: poll every few seconds and merge, keeping any
  // local-only/system messages.
  const lastLocalMutationRef = useRef(0);
  // One-shot guard so the self-healing demotion below doesn't repeat the
  // database write and system message on every poll.
  const autoDemotedRef = useRef(false);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void listAgreementMessages(agreement.id).then((serverMessages) => {
        if (!active || serverMessages.length === 0) return;
        setMessages((current) => mergeMessages(serverMessages, current));
      });
    };
    const interval = window.setInterval(refresh, 5000);
    refresh();
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [agreement.id]);

  // Live sync of the other party's section agree-ticks, edits, and lifecycle
  // stage. Skipped briefly after a local change so a poll response can't
  // clobber an in-flight write with stale data.
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void getAgreementLiveState(agreement.id).then((live) => {
        if (!active || !live) return;
        if (Date.now() - lastLocalMutationRef.current < 6000) return;
        setSectionState((current) => {
          const next = { ...current };
          for (const section of live.sections) {
            next[section.id] = {
              agreedByA: section.agreedByA,
              agreedByB: section.agreedByB,
            };
          }
          return next;
        });
        // Pick up the other party's edits to section values too.
        setSectionsContent((current) =>
          current.map((section) => {
            const liveSection = live.sections.find(
              (item) => item.id === section.id
            );
            if (!liveSection) return section;
            return sectionWithValues(
              section,
              liveSection.valueA,
              liveSection.valueB
            );
          })
        );
        // Self-healing guard: a finalised status must never coexist with a
        // section both parties haven't agreed.
        const finalised =
          live.status === "Ready to finalise" ||
          live.status === "Active" ||
          live.status === "Completed";
        const hasUnagreedSection = live.sections.some(
          (section) => !(section.agreedByA && section.agreedByB)
        );
        const effectiveStatus =
          finalised && hasUnagreedSection ? "Negotiating" : live.status;
        if (effectiveStatus !== live.status && !autoDemotedRef.current) {
          autoDemotedRef.current = true;
          void updateAgreementStatusRecord(agreement.id, "Negotiating");
          appendSystemMessage(
            `Agreement moved from ${live.status} back to Negotiating - a section is awaiting agreement from both parties.`
          );
        }
        setLifecycleState((current) =>
          current === effectiveStatus ? current : effectiveStatus
        );
      });
    };
    const interval = window.setInterval(refresh, 5000);
    refresh();
    return () => {
      active = false;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreement.id]);

  const [linkedTransport, setLinkedTransport] = useState<TransportJob | undefined>(
    undefined
  );
  const transportHref = linkedTransport
    ? `/transport/${linkedTransport.id}`
    : undefined;

  const [transportConfirmations, setTransportConfirmations] = useState<
    Record<string, { farmerA: boolean; farmerB: boolean; driver: boolean }>
  >({});
  const [transportQuotes, setTransportQuotes] = useState(
    linkedTransport?.quotes ?? []
  );
  const [acceptedTransportQuoteId, setAcceptedTransportQuoteId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    void listTransportJobs().then((jobs) => {
      const job = jobs.find((item) => item.agreementId === agreement.id);
      if (job) setLinkedTransport(job);
    });
  }, [agreement.id]);

  function sendMessage(body: string) {
    const sender = partyProfile[viewerParty];
    void createAgreementMessage({
      agreementId: agreement.id,
      body,
      sectionId: activeSectionId ?? undefined,
    }).then((saved) => {
      setMessages((current) => [
        ...current,
        saved ?? {
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
    });
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

  const toggleAgreement = (sectionId: string, party: WorkspaceParty) => {
    // Guard - the panel only renders the viewer's own button as
    // interactive, but defend against rogue calls just in case.
    if (party !== viewerParty) return;
    const previous = sectionState[sectionId] ?? {
      agreedByA: false,
      agreedByB: false,
    };
    const next: SectionAgreementState =
      party === "A"
        ? { ...previous, agreedByA: !previous.agreedByA }
        : { ...previous, agreedByB: !previous.agreedByB };
    lastLocalMutationRef.current = Date.now();
    setSectionState((current) => ({ ...current, [sectionId]: next }));
    void updateAgreementSectionAgreement({
      agreementId: agreement.id,
      sectionId,
      agreedByA: next.agreedByA,
      agreedByB: next.agreedByB,
    });

    const justMutuallyAgreed =
      next.agreedByA &&
      next.agreedByB &&
      !(previous.agreedByA && previous.agreedByB);
    if (justMutuallyAgreed) {
      const section = agreement.sections.find((s) => s.id === sectionId);
      if (section) {
        flash(`Both parties agree on ${section.label}.`, "success");
        appendSystemMessage(
          `Both parties agree on "${section.label}".`,
          section.id
        );
      }
    }

    // Pulling an agree tick off a finalised agreement reopens negotiation.
    const withdrewAgreement =
      (previous.agreedByA && !next.agreedByA) ||
      (previous.agreedByB && !next.agreedByB);
    if (withdrewAgreement) {
      const section = agreement.sections.find((s) => s.id === sectionId);
      demoteLifecycleIfFinalised(
        `${partyProfile[viewerParty].label} withdrew agreement on "${section?.label ?? sectionId}".`
      );
    }
  };

  /**
   * A finalised agreement (Ready to finalise / Active / Completed) drops
   * back to Negotiating the moment either party changes a section or pulls
   * their agree tick - "Completed" must never sit next to an unagreed
   * section. Both screens pick the change up via the status poll.
   */
  const demoteLifecycleIfFinalised = (reason: string) => {
    const from = lifecycleState;
    if (from !== "Ready to finalise" && from !== "Active" && from !== "Completed") {
      return;
    }
    const byParty = viewerParty === "A" ? "Livestock owner" : "Landowner";
    lastLocalMutationRef.current = Date.now();
    setLifecycleState("Negotiating");
    setLifecycleHistory((history) => [
      ...history,
      {
        at: nowLabel(),
        from,
        to: "Negotiating",
        byParty,
        note: reason,
      },
    ]);
    void updateAgreementStatusRecord(agreement.id, "Negotiating");
    appendSystemMessage(
      `Agreement moved from ${from} back to Negotiating - ${reason}`
    );
    flash(
      "The agreement is back in Negotiating until both parties re-agree.",
      "warning"
    );
  };

  const editSectionValue = (sectionId: string, value: string) => {
    const section = sectionsContent.find((item) => item.id === sectionId);
    lastLocalMutationRef.current = Date.now();
    setSectionsContent((current) =>
      current.map((item) => {
        if (item.id !== sectionId) return item;
        const valueA =
          viewerParty === "A" ? value : item.detail[0]?.value ?? "";
        const valueB =
          viewerParty === "B" ? value : item.detail[1]?.value ?? "";
        return sectionWithValues(item, valueA, valueB);
      })
    );
    // Changed wording needs fresh agreement from both sides.
    setSectionState((current) => ({
      ...current,
      [sectionId]: { agreedByA: false, agreedByB: false },
    }));
    void updateAgreementSectionValue({
      agreementId: agreement.id,
      sectionId,
      party: viewerParty,
      value,
    });
    flash(
      `${section?.label ?? "Section"} updated. Both parties need to agree again.`,
      "info"
    );
    appendSystemMessage(
      `${partyProfile[viewerParty].label} updated "${section?.label ?? sectionId}". Both parties need to re-confirm this section.`,
      sectionId
    );
    demoteLifecycleIfFinalised(
      `"${section?.label ?? sectionId}" was edited after finalisation.`
    );
  };

  const advanceLifecycle = (to: AgreementLifecycleState) => {
    const byParty = viewerParty === "A" ? "Livestock owner" : "Landowner";
    const from = lifecycleState;
    lastLocalMutationRef.current = Date.now();
    setLifecycleState(to);
    void updateAgreementStatusRecord(agreement.id, to);
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
    void createAgreementArtefact({
      agreementId: agreement.id,
      label: draft.label,
      description: draft.description,
      kind: draft.kind,
      sectionId: draft.sectionId,
    }).then((saved) => {
      if (saved) {
        setArtefacts((current) =>
          current.map((artefact) =>
            artefact.id === newArtefact.id ? saved : artefact
          )
        );
      }
      flash(`Artefact "${draft.label}" added.`, "success");
      appendSystemMessage(
        `${partyProfile[viewerParty].label} added artefact "${draft.label}".`,
        draft.sectionId
      );
    });
  };

  const cancelLifecycle = () => {
    const byParty = viewerParty === "A" ? "Livestock owner" : "Landowner";
    const from = lifecycleState;
    if (from === "Cancelled" || from === "Completed") return;
    lastLocalMutationRef.current = Date.now();
    setLifecycleState("Cancelled");
    void updateAgreementStatusRecord(agreement.id, "Cancelled");
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
  };

  const requestTransport = async () => {
    if (!allSectionsAgreed) {
      flash("Resolve every agreement section before pushing an RFT.", "warning");
      return;
    }
    const { job } = await requestTransportJob(agreement.id);
    if (!job) {
      flash(
        "Couldn't send the RFT. Confirm the Start date, Transport, pickup location and destination before sending it to carriers.",
        "warning"
      );
      return;
    }
    setLinkedTransport(job);
    setTransportConfirmations(
      Object.fromEntries(
        job.sections.map((section) => [
          section.id,
          { ...section.confirmations },
        ])
      )
    );
    setTransportQuotes(job.quotes);
    setAcceptedTransportQuoteId(job.acceptedQuoteId);
    appendSystemMessage(
      "RFT (Request for Transport) sent - carriers can now see and accept this job.",
      "transport"
    );
    flash("RFT sent. Carriers are being notified.", "success");
  };

  const mutuallyAgreedCount = sectionsContent.reduce((count, section) => {
    const state = sectionState[section.id] ?? section;
    return state.agreedByA && state.agreedByB ? count + 1 : count;
  }, 0);
  const allSectionsAgreed = mutuallyAgreedCount === sectionsContent.length;

  const timelineItems = useMemo(() => {
    const totalSections = sectionsContent.length;
    const allAgreed = mutuallyAgreedCount === totalSections;

    return [
      {
        title: "Request matched to paddock",
        detail: `${agreement.livestock} request matched with ${
          agreement.listingTitle ?? "the selected paddock"
        }.`,
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
  }, [sectionsContent, sectionState, agreement.livestock, agreement.listingTitle]);

  return (
    <div className="space-y-5">
      <Card className="border-sage/30 bg-sage-mist/70">
        <p className="text-sm font-bold text-sage-deep">
          You are {partyProfile[viewerParty].name} ({partyProfile[viewerParty].role}).
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-bark/85">
          You are working with {partyProfile[viewerParty === "A" ? "B" : "A"].name} ({partyProfile[viewerParty === "A" ? "B" : "A"].role}).
          The agreement becomes real only after both sides agree the open sections.
        </p>
      </Card>
      <section
        aria-label="Agreement parties"
        className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Parties
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Signed in
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["A", "B"] as const).map((party) => {
            const profile = partyProfile[party];
            const active = party === viewerParty;
            return (
              <div
                key={party}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl border px-4 py-2 text-left",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark"
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
              </div>
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
              agreement={liveAgreement}
              activeSectionId={activeSectionId}
              onSelectSection={(id) =>
                setActiveSectionId((current) => (current === id ? null : id))
              }
              sectionState={sectionState}
              onToggleAgreement={toggleAgreement}
              onEditSectionValue={editSectionValue}
              timelineItems={timelineItems}
              lifecycleState={lifecycleState}
              lifecycleHistory={lifecycleHistory}
              onAdvanceLifecycle={advanceLifecycle}
              onCancelLifecycle={cancelLifecycle}
              transportHref={transportHref}
              onRequestTransport={requestTransport}
              canRequestTransport={allSectionsAgreed}
              requestTransportBlockedReason={`${mutuallyAgreedCount} of ${sectionsContent.length} sections agreed. Resolve every section before pushing an RFT.`}
              viewerParty={viewerParty}
              partyLabels={{
                A: partyProfile.A.label,
                B: partyProfile.B.label,
              }}
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
            title={`${partyProfile.A.label} and ${partyProfile.B.label}`}
            messages={messages}
            onlineCount={2}
            sections={sectionsContent}
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

/**
 * Rebuild a section's display strings after either party edits a value.
 * Mirrors mapAgreementSectionRow in the repositories module.
 */
function sectionWithValues(
  section: AgreementSection,
  valueA: string,
  valueB: string
): AgreementSection {
  return {
    ...section,
    summary: valueA === valueB ? valueA : `${valueA} / ${valueB}`,
    detail: [
      { label: "Livestock owner value", value: valueA },
      { label: "Landowner value", value: valueB },
    ],
  };
}

/**
 * Server messages win on ordering; anything the server doesn't know about
 * (optimistic sends still in flight, local system notices) stays appended.
 */
function mergeMessages(serverMessages: Message[], current: Message[]): Message[] {
  const serverIds = new Set(serverMessages.map((message) => message.id));
  const localOnly = current.filter((message) => !serverIds.has(message.id));
  return [...serverMessages, ...localOnly];
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
