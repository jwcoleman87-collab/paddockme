"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AgreementPanel,
  type SectionAgreementState,
} from "@/components/AgreementPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { useFlash } from "@/components/FlashProvider";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { getTransportJobForAgreement } from "@/lib/dummyData";
import type {
  Agreement,
  AgreementLifecycleEvent,
  AgreementLifecycleState,
  Message,
} from "@/lib/dummyData";

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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const linkedTransport = getTransportJobForAgreement(agreement.id);
  const transportHref = linkedTransport
    ? `/transport/${linkedTransport.id}`
    : undefined;

  function sendMessage(body: string) {
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        threadId: agreement.id,
        senderId: "farmer-a",
        senderName: "Dale",
        senderRole: "Livestock owner",
        body,
        time: shortTime(),
        sectionId: activeSectionId ?? undefined,
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
        };
        if (parsed.sectionState) setSectionState(parsed.sectionState);
        if (parsed.lifecycleState) setLifecycleState(parsed.lifecycleState);
        if (parsed.lifecycleHistory)
          setLifecycleHistory(parsed.lifecycleHistory);
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
        JSON.stringify({ sectionState, lifecycleState, lifecycleHistory })
      );
    } catch {
      // ignore - quota / private mode
    }
  }, [storageKey, sectionState, lifecycleState, lifecycleHistory]);

  const toggleAgreement = (sectionId: string, party: "A" | "B") => {
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
        }
      }
      return { ...current, [sectionId]: next };
    });
  };

  const advanceLifecycle = (to: AgreementLifecycleState) => {
    setLifecycleState((from) => {
      setLifecycleHistory((history) => [
        ...history,
        {
          at: nowLabel(),
          from,
          to,
          byParty: "Farmer A",
          note: `Advanced from ${from} to ${to}.`,
        },
      ]);
      return to;
    });
    flash(
      to === "Completed"
        ? "Agreement marked complete."
        : `Moved to ${to}.`,
      "success"
    );
  };

  const cancelLifecycle = () => {
    setLifecycleState((from) => {
      if (from === "Cancelled" || from === "Completed") return from;
      setLifecycleHistory((history) => [
        ...history,
        {
          at: nowLabel(),
          from,
          to: "Cancelled",
          byParty: "Farmer A",
          note: "Agreement cancelled from the workspace.",
        },
      ]);
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
          composerSenderLabel="Dale (Farmer A)"
        />
      }
    />
  );
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
