"use client";

import { useMemo, useState } from "react";
import {
  AgreementPanel,
  type SectionAgreementState,
} from "@/components/AgreementPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import type { Agreement, Message } from "@/lib/dummyData";

/**
 * Client wrapper for the workspace page.
 *
 * Owns two pieces of UI-only state shared between AgreementPanel and ChatPanel:
 *   1. `activeSectionId` - which agreement section is anchoring the chat
 *   2. `sectionState`    - per-section, per-party "agree" toggles
 *
 * Neither is persisted. Persistence + RLS lands in Build 02 Steps 3-4 (separate session).
 */
export function WorkspaceClient({
  agreement,
  messages,
}: {
  agreement: Agreement;
  messages: Message[];
}) {
  const firstOpenSectionId =
    agreement.sections.find((section) => !(section.agreedByA && section.agreedByB))?.id ??
    agreement.sections[0]?.id ??
    null;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(firstOpenSectionId);

  const [sectionState, setSectionState] = useState<
    Record<string, SectionAgreementState>
  >(() =>
    Object.fromEntries(
      agreement.sections.map((section) => [
        section.id,
        { agreedByA: section.agreedByA, agreedByB: section.agreedByB },
      ])
    )
  );

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
      return { ...current, [sectionId]: next };
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
        />
      }
    />
  );
}
