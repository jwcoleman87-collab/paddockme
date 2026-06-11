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
import { getTransportJobForAgreement } from "@/lib/dummyData";
import {
  createAgreementArtefact,
  createAgreementMessage,
  getAgreementLiveState,
  getCurrentUserId,
  listAgreementMessages,
  requestTransportJob,
  listTransportJobs,
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
    id: "farmer-a",
    name: "Livestock owner",
    role: "Livestock owner",
    label: "Livestock owner",
    avatarUrl: "",
  },
  B: {
    id: "farmer-b",
    name: "Landowner",
    role: "Landowner",
    label: "Landowner",
    avatarUrl: "",
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
  const isRealWorkspace = isUuid(agreement.id);
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
  // Section content is editable for real workspaces (dates, pickup address,
  // terms...), so it lives in state rather than reading agreement.sections
  // directly. Kept in sync with the other party via the live-state poll.
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

  // Live chat sync for real (Supabase) workspaces. Messages used to load once
  // on mount, so the other party never saw anything new without a full page
  // reload - "James typed a message and nothing came through for Leona".
  // Poll every few seconds and merge, keeping any local-only/system messages.
  const lastLocalMutationRef = useRef(0);
  // One-shot guard so the self-healing demotion below doesn't repeat the
  // database write and system message on every poll.
  const autoDemotedRef = useRef(false);
  useEffect(() => {
    if (!isRealWorkspace) return;
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
  }, [agreement.id, isRealWorkspace]);

  const [linkedTransport, setLinkedTransport] = useState<TransportJob | undefined>(
    () => getTransportJobForAgreement(agreement.id)
  );
  const transportHref = linkedTransport
    ? `/transport/${linkedTransport.id}`
    : undefined;

  // Read-through of the transport room's live state from localStorage so the
  // Transport tab in the workspace reflects whatever Livestock owner / Driver have
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
    if (isRealWorkspace) {
      void getCurrentUserId().then((userId) => {
        if (!userId) return;
        if (userId === agreement.farmerBId) setViewerPartyState("B");
        if (userId === agreement.farmerAId) setViewerPartyState("A");
      });
      return;
    }
    if (typeof window === "undefined") return;
    const cookiePersona = readPersonaCookie();
    try {
      const stored =
        window.localStorage.getItem("paddockme.agreements.persona") ??
        window.localStorage.getItem("paddockme.profile.persona") ??
        cookiePersona;
      if (stored === "farmer-b") setViewerPartyState("B");
      if (stored === "farmer-a") setViewerPartyState("A");
    } catch {
      if (cookiePersona === "farmer-b") setViewerPartyState("B");
      if (cookiePersona === "farmer-a") setViewerPartyState("A");
    }
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
  }, [agreement.farmerAId, agreement.farmerBId, isRealWorkspace, linkedTransport?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    void listTransportJobs().then((jobs) => {
      const localJob = jobs.find(
      (job) => job.agreementId === agreement.id
      );
      if (localJob) setLinkedTransport(localJob);
    });
  }, [agreement.id]);

  function setViewerParty(next: WorkspaceParty) {
    if (isRealWorkspace) return;
    if (next === viewerParty) return;
    setViewerPartyState(next);
    writePersonaCookie(partyProfile[next].id);
    try {
      const personaId = partyProfile[next].id;
      window.localStorage.setItem("paddockme.profile.persona", personaId);
      window.localStorage.setItem("paddockme.agreements.persona", personaId);
      window.dispatchEvent(new CustomEvent("paddockme:persona-change"));
    } catch {
      // ignore
    }
    flash(`Role view changed to ${partyProfile[next].label}.`, "info");
  }

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

  // Live sync of the other party's section agree-ticks and lifecycle stage
  // for real workspaces. Skipped briefly after a local change so a poll
  // response can't clobber an in-flight write with stale data.
  useEffect(() => {
    if (!isRealWorkspace) return;
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
        // section both parties haven't agreed (covers agreements finalised
        // before the demote-on-edit rule existed).
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
  }, [agreement.id, isRealWorkspace]);

  const hydratedRef = useRef(false);
  const storageKey = `paddockme.workspace.${agreement.id}`;

  useEffect(() => {
    if (isRealWorkspace) {
      hydratedRef.current = true;
      return;
    }
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
  }, [isRealWorkspace, storageKey]);

  useEffect(() => {
    if (isRealWorkspace) return;
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
    isRealWorkspace,
  ]);

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
    if (isRealWorkspace) {
      void updateAgreementStatusRecord(agreement.id, "Negotiating");
    }
    appendSystemMessage(
      `Agreement moved from ${from} back to Negotiating - ${reason}`
    );
    flash(
      "The agreement is back in Negotiating until both parties re-agree.",
      "warning"
    );
  };

  const editSectionValue = (sectionId: string, value: string) => {
    if (!isRealWorkspace) return;
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
    if (isRealWorkspace) {
      void updateAgreementStatusRecord(agreement.id, to);
    }
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
      fileName: draft.fileName,
      fileType: draft.fileType,
      fileSize: draft.fileSize,
      fileDataUrl: draft.fileDataUrl,
    };
    setArtefacts((current) => [...current, newArtefact]);
    void createAgreementArtefact({
      agreementId: agreement.id,
      label: draft.label,
      description: draft.description,
      kind: draft.kind,
      sectionId: draft.sectionId,
      fileName: draft.fileName,
      fileType: draft.fileType,
      fileSize: draft.fileSize,
      fileDataUrl: draft.fileDataUrl,
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
    if (isRealWorkspace) {
      void updateAgreementStatusRecord(agreement.id, "Cancelled");
    }
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
    const { job } = await requestTransportJob(agreement.id);
    if (!job) {
      flash("Couldn't request transport. Please try again.", "warning");
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
      `Transport requested. ${job.driver} can now accept the job.`,
      "transport"
    );
    flash("Transport requested.", "success");
  };

  const timelineItems = useMemo(() => {
    const mutuallyAgreedCount = sectionsContent.reduce((count, section) => {
      const state = sectionState[section.id] ?? section;
      return state.agreedByA && state.agreedByB ? count + 1 : count;
    }, 0);
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
        aria-label={isRealWorkspace ? "Agreement parties" : "Agreement party switcher"}
        className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {isRealWorkspace ? "Parties" : "Role view"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/workspace/${agreement.id}/snapshot`}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-mist bg-warm-white px-3 text-xs font-bold text-sage-deep transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              View snapshot
            </a>
            <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
              {isRealWorkspace ? "Signed in" : "Role view"}
            </span>
          </div>
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
                disabled={isRealWorkspace}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl border px-4 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  isRealWorkspace && "cursor-default",
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
              agreement={liveAgreement}
              activeSectionId={activeSectionId}
              onSelectSection={(id) =>
                setActiveSectionId((current) => (current === id ? null : id))
              }
              sectionState={sectionState}
              onToggleAgreement={toggleAgreement}
              onEditSectionValue={isRealWorkspace ? editSectionValue : undefined}
              timelineItems={timelineItems}
              lifecycleState={lifecycleState}
              lifecycleHistory={lifecycleHistory}
              onAdvanceLifecycle={advanceLifecycle}
              onCancelLifecycle={cancelLifecycle}
              transportHref={transportHref}
              onRequestTransport={requestTransport}
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function readPersonaCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("paddockme_persona="));
  return entry ? decodeURIComponent(entry.split("=")[1] ?? "") : null;
}

function writePersonaCookie(personaId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `paddockme_persona=${encodeURIComponent(personaId)}; path=/; max-age=31536000; SameSite=Lax`;
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
