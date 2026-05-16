"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle,
  Circle,
  FileText,
  Image as ImageIcon,
  Map as MapIcon,
  Truck,
  Users,
  Sprout,
  Calendar,
  Banknote,
  Tractor,
} from "lucide-react";
import {
  ArtefactUploadDialog,
  type ArtefactDraft,
} from "@/components/ArtefactUploadDialog";
import { ArtefactViewer, type ViewableArtefact } from "@/components/ArtefactViewer";
import { Button, ButtonLink } from "@/components/Button";
import { InfoTile } from "@/components/InfoTile";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { cn } from "@/lib/utils";
import type {
  Agreement,
  AgreementArtefact,
  AgreementLifecycleEvent,
  AgreementLifecycleState,
  AgreementSection,
} from "@/lib/dummyData";

export type SectionAgreementState = {
  agreedByA: boolean;
  agreedByB: boolean;
};

export type WorkspaceParty = "A" | "B";

type AgreementPanelProps = {
  agreement: Agreement;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  sectionState: Record<string, SectionAgreementState>;
  onToggleAgreement: (sectionId: string, party: WorkspaceParty) => void;
  timelineItems?: TimelineItem[];
  lifecycleState: AgreementLifecycleState;
  lifecycleHistory: AgreementLifecycleEvent[];
  onAdvanceLifecycle: (to: AgreementLifecycleState) => void;
  onCancelLifecycle: () => void;
  /** href of the transport room linked to this agreement, when one exists. */
  transportHref?: string;
  /** The party the current viewer represents. Drives which agree button is interactive. */
  viewerParty: WorkspaceParty;
  /** Live artefacts list (allows the workspace client to lift state above the panel). */
  artefacts: AgreementArtefact[];
  /** Called when the upload dialog submits. */
  onAddArtefact?: (draft: ArtefactDraft) => void;
};

type AgreementTab =
  | "overview"
  | "terms"
  | "artifacts"
  | "lifecycle"
  | "timeline";

type TimelineItem = {
  title: string;
  detail: string;
  complete?: boolean;
};

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> =
  {
    parties: Users,
    stock: Sprout,
    paddock: Tractor,
    dates: Calendar,
    terms: Banknote,
    transport: Truck,
  };

const agreementTabs = [
  { id: "overview", label: "Overview" },
  { id: "terms", label: "Terms" },
  { id: "artifacts", label: "Artifacts" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "timeline", label: "Timeline" },
] satisfies { id: AgreementTab; label: string }[];

const lifecycleTone: Record<
  AgreementLifecycleState,
  "success" | "warning" | "info" | "neutral"
> = {
  Draft: "neutral",
  Negotiating: "warning",
  "Ready to finalise": "info",
  Active: "success",
  Completed: "info",
  Cancelled: "neutral",
};

const forwardLifecycle: AgreementLifecycleState[] = [
  "Draft",
  "Negotiating",
  "Ready to finalise",
  "Active",
  "Completed",
];

function nextLifecycleState(
  current: AgreementLifecycleState
): AgreementLifecycleState | null {
  const index = forwardLifecycle.indexOf(current);
  if (index < 0 || index >= forwardLifecycle.length - 1) return null;
  return forwardLifecycle[index + 1];
}

const advanceLabels: Partial<
  Record<AgreementLifecycleState, { label: string; helper: string }>
> = {
  Negotiating: {
    label: "Send to Farmer B",
    helper: "Move the draft into negotiation.",
  },
  "Ready to finalise": {
    label: "Mark ready to finalise",
    helper: "All sections need both-parties-agree first.",
  },
  Active: {
    label: "Activate agreement",
    helper: "Locks the agreed terms and starts the agistment clock.",
  },
  Completed: {
    label: "Complete agreement",
    helper: "The agistment period has ended.",
  },
};

const workspaceCardClass =
  "min-w-0 overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)]";

export function AgreementPanel({
  agreement,
  activeSectionId,
  onSelectSection,
  sectionState,
  onToggleAgreement,
  timelineItems = [],
  lifecycleState,
  lifecycleHistory,
  onAdvanceLifecycle,
  onCancelLifecycle,
  transportHref,
  viewerParty,
  artefacts,
  onAddArtefact,
}: AgreementPanelProps) {
  const [activeTab, setActiveTab] = useState<AgreementTab>("overview");
  const [pendingCancel, setPendingCancel] = useState(false);

  const mutuallyAgreedCount = agreement.sections.reduce((count, section) => {
    const state = sectionState[section.id] ?? section;
    return state.agreedByA && state.agreedByB ? count + 1 : count;
  }, 0);
  const allSectionsAgreed =
    mutuallyAgreedCount === agreement.sections.length;
  const nextState = nextLifecycleState(lifecycleState);
  const advanceMeta = nextState ? advanceLabels[nextState] : undefined;
  const isTerminal =
    lifecycleState === "Completed" || lifecycleState === "Cancelled";
  const advanceBlocked =
    nextState === "Ready to finalise" && !allSectionsAgreed;

  return (
    <section className={workspaceCardClass}>
      <div className="border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
        <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <StatusBadge tone={lifecycleTone[lifecycleState]}>
            Status: {lifecycleState}
          </StatusBadge>
          {agreement.transportRequired && (
            <StatusBadge tone="info">
              <Truck className="h-3.5 w-3.5" aria-hidden />
              Transport required
            </StatusBadge>
          )}
          <StatusBadge tone="neutral">
            {mutuallyAgreedCount} of {agreement.sections.length} sections agreed
          </StatusBadge>
        </div>
        <h2 className="text-2xl font-bold text-sage-deep">
          Shared agistment agreement
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-bark/65">
          A shared artefact both farmers can review. Tap a section to anchor the
          chat, then mark each side&apos;s agreement when the wording holds up.
        </p>

        <div
          role="tablist"
          aria-label="Agreement panel sections"
          className="mt-4 flex flex-wrap gap-1 rounded-[24px] border border-sage-deep/10 bg-warm-white p-1"
        >
          {agreementTabs.map((tab) => (
            <AgreementTabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </AgreementTabButton>
          ))}
        </div>
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === "overview" && (
          <AgreementOverview
            agreement={agreement}
            sectionState={sectionState}
            mutuallyAgreedCount={mutuallyAgreedCount}
          />
        )}

        {activeTab === "terms" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-sage-deep/10 bg-cream/60 px-4 py-3">
              <h3 className="font-bold text-sage-deep">Terms under review</h3>
              <p className="mt-1 text-sm leading-relaxed text-bark/65">
                Select a section to anchor the chat and confirm each party&apos;s
                agreement state.
              </p>
            </div>
            {agreement.sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                active={activeSectionId === section.id}
                state={
                  sectionState[section.id] ?? {
                    agreedByA: section.agreedByA,
                    agreedByB: section.agreedByB,
                  }
                }
                viewerParty={viewerParty}
                onSelect={() => onSelectSection(section.id)}
                onToggleA={() => onToggleAgreement(section.id, "A")}
                onToggleB={() => onToggleAgreement(section.id, "B")}
              />
            ))}
          </div>
        )}

        {activeTab === "artifacts" && (
          <ArtefactStrip
            artefacts={artefacts}
            sections={agreement.sections}
            onSelectSection={onSelectSection}
            activeSectionId={activeSectionId}
            viewerParty={viewerParty}
            onAddArtefact={onAddArtefact}
          />
        )}

        {activeTab === "lifecycle" && (
          <LifecycleTabContent
            currentState={lifecycleState}
            history={lifecycleHistory}
            allSectionsAgreed={allSectionsAgreed}
            sectionCount={agreement.sections.length}
            agreedCount={mutuallyAgreedCount}
          />
        )}

        {activeTab === "timeline" && (
          <div className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
            {timelineItems.length > 0 ? (
              <Timeline items={timelineItems} />
            ) : (
              <p className="text-sm text-bark/65">
                No timeline events have been added yet.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-sage-deep/12 bg-cream/45 p-5 sm:flex-row sm:items-center sm:justify-between">
        {transportHref ? (
          <ButtonLink href={transportHref} variant="secondary">
            Open transport room
          </ButtonLink>
        ) : (
          <span className="text-sm font-semibold text-bark/55">
            No transport room linked yet.
          </span>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!isTerminal && nextState && advanceMeta && (
            <Button
              type="button"
              onClick={() => onAdvanceLifecycle(nextState)}
              disabled={advanceBlocked}
              title={
                advanceBlocked
                  ? `Mutual agreement needed on every section first (${mutuallyAgreedCount} of ${agreement.sections.length}).`
                  : advanceMeta.helper
              }
            >
              {advanceMeta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
          {!isTerminal && !pendingCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingCancel(true)}
              className="text-terra hover:bg-terra-light/60"
            >
              <Ban className="h-4 w-4" aria-hidden />
              Cancel agreement
            </Button>
          )}
          {!isTerminal && pendingCancel && (
            <div
              role="group"
              aria-label="Confirm cancellation"
              className="flex items-center gap-2 rounded-full border border-terra/35 bg-terra-light/45 p-1"
            >
              <span className="px-3 text-xs font-semibold text-bark">
                Cancel for real?
              </span>
              <Button
                type="button"
                onClick={() => {
                  setPendingCancel(false);
                  onCancelLifecycle();
                }}
                className="bg-terra text-cream hover:bg-terra"
              >
                Yes, cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingCancel(false)}
              >
                Keep
              </Button>
            </div>
          )}
          {isTerminal && (
            <p className="text-sm font-semibold text-bark/70">
              Agreement is {lifecycleState.toLowerCase()} - no further actions.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function LifecycleTabContent({
  currentState,
  history,
  allSectionsAgreed,
  sectionCount,
  agreedCount,
}: {
  currentState: AgreementLifecycleState;
  history: AgreementLifecycleEvent[];
  allSectionsAgreed: boolean;
  sectionCount: number;
  agreedCount: number;
}) {
  const nextState = nextLifecycleState(currentState);
  const isTerminal =
    currentState === "Completed" || currentState === "Cancelled";

  return (
    <div className="space-y-5">
      <LifecycleStepper current={currentState} />

      <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          {isTerminal ? "Final state" : "Next step"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-bark/75">
          {isTerminal
            ? currentState === "Completed"
              ? "The agistment ran to its end and the agreement is closed."
              : "This agreement was cancelled and is no longer active."
            : nextState === "Ready to finalise"
              ? allSectionsAgreed
                ? "Every section has both-parties-agree. You can move this agreement to ready-to-finalise."
                : `${agreedCount} of ${sectionCount} sections mutually agreed. Both parties must agree on every section before this can be marked ready.`
              : nextState
                ? `From ${currentState}, the next forward state is ${nextState}.`
                : "No further forward transitions defined."}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Audit history
        </h3>
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sage-deep/15 bg-cream/60 px-4 py-6 text-center text-sm text-bark/60">
            No lifecycle events recorded yet.
          </p>
        ) : (
          <ol className="space-y-3">
            {history.map((event, index) => (
              <li
                key={`${event.at}-${index}`}
                className="rounded-xl border border-sage-deep/10 bg-warm-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-bark">
                    {event.from ? `${event.from} -> ${event.to}` : `Created as ${event.to}`}
                  </span>
                  <span className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-sage-deep">
                    {event.byParty}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone">
                  {event.at}
                </p>
                {event.note && (
                  <p className="mt-2 text-sm leading-relaxed text-bark/75">
                    {event.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function AgreementTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "min-h-10 shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white",
        active
          ? "bg-sage-deep text-cream shadow-sm"
          : "text-bark/70 hover:bg-sage-mist/60 hover:text-sage-deep"
      )}
    >
      {children}
    </button>
  );
}

function AgreementOverview({
  agreement,
  sectionState,
  mutuallyAgreedCount,
}: {
  agreement: Agreement;
  sectionState: Record<string, SectionAgreementState>;
  mutuallyAgreedCount: number;
}) {
  const allAgreed = mutuallyAgreedCount === agreement.sections.length;
  const sectionAgreed = (id: string) => {
    const state = sectionState[id];
    const fallback = agreement.sections.find((section) => section.id === id);
    if (state) return state.agreedByA && state.agreedByB;
    if (fallback) return fallback.agreedByA && fallback.agreedByB;
    return false;
  };
  const paddockAgreed = sectionAgreed("paddock");
  const termsAgreed = sectionAgreed("terms");
  const transportAgreed = sectionAgreed("transport");

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile label="Livestock" value={agreement.livestock} />
        <InfoTile label="Duration" value={agreement.duration} />
        <InfoTile label="Feed" value={agreement.feed} />
        <InfoTile label="Water" value={agreement.water} />
        <InfoTile label="Fencing" value={agreement.fencing} />
        <InfoTile
          label="Transport"
          value={agreement.transportRequired ? "Required" : "Not required"}
        />
      </div>

      <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Agreement alignment
        </h3>
        <div className="mt-3 space-y-2">
          <AlignmentRow
            complete={allAgreed}
            label={`${mutuallyAgreedCount} of ${agreement.sections.length} sections mutually agreed`}
          />
          <AlignmentRow
            complete={paddockAgreed}
            label={
              paddockAgreed
                ? "Feed, water and fencing details match"
                : "Feed, water and fencing details still under review"
            }
          />
          <AlignmentRow
            complete={termsAgreed}
            label={
              termsAgreed
                ? "Rate and final terms agreed"
                : "Rate and final terms require attention"
            }
          />
          {agreement.transportRequired && (
            <AlignmentRow
              complete={transportAgreed}
              label={
                transportAgreed
                  ? "Transport plan confirmed by both parties"
                  : "Transport plan still being arranged"
              }
            />
          )}
        </div>
      </section>

      <ReadinessChecklist agreement={agreement} />
    </div>
  );
}

function AlignmentRow({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  const Icon = complete ? CheckCircle : AlertTriangle;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-sage-deep/10 bg-warm-white px-4 py-3">
      <span className="text-sm font-semibold text-bark">{label}</span>
      <Icon
        className={cn("h-5 w-5 shrink-0", complete ? "text-match" : "text-amber")}
        aria-hidden
      />
    </div>
  );
}

function ReadinessChecklist({ agreement }: { agreement: Agreement }) {
  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
        Livestock readiness checklist
      </h3>
      <div className="space-y-2">
        {agreement.readinessChecklist.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-sage-deep/10 bg-warm-white px-4 py-3"
          >
            <span className="font-semibold text-bark">{item.label}</span>
            {item.complete ? (
              <CheckCircle
                className="h-5 w-5 text-match"
                aria-label="Complete"
              />
            ) : (
              <AlertTriangle
                className="h-5 w-5 text-amber"
                aria-label="Needs attention"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionCard({
  section,
  active,
  state,
  viewerParty,
  onSelect,
  onToggleA,
  onToggleB,
}: {
  section: AgreementSection;
  active: boolean;
  state: SectionAgreementState;
  viewerParty: WorkspaceParty;
  onSelect: () => void;
  onToggleA: () => void;
  onToggleB: () => void;
}) {
  const Icon = sectionIcons[section.id] ?? Sprout;
  const { agreedByA, agreedByB } = state;

  const summaryTone: "success" | "warning" | "neutral" =
    agreedByA && agreedByB
      ? "success"
      : agreedByA || agreedByB
        ? "warning"
        : "neutral";
  const summaryLabel =
    agreedByA && agreedByB
      ? "Both parties agree"
      : agreedByA
        ? "Awaiting Farmer B"
        : agreedByB
          ? "Awaiting Farmer A"
          : "Pending";

  return (
    <article
      aria-current={active ? "true" : undefined}
      className={cn(
        "overflow-hidden rounded-xl border bg-cream/70 transition",
        active
          ? "border-sage-deep/45 shadow-[0_0_0_4px_rgba(208,232,207,0.55)]"
          : "border-sage-deep/12"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-2 px-5 py-4 text-left transition cursor-pointer",
          active
            ? "bg-sage-mist/60"
            : "hover:bg-sage-mist/40 focus-visible:bg-sage-mist/40"
        )}
        aria-pressed={active}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sage-deep">
            <Icon className="h-5 w-5" aria-hidden />
            <h3 className="text-lg font-bold">{section.label}</h3>
          </div>
          <StatusBadge tone={summaryTone}>{summaryLabel}</StatusBadge>
        </div>
        <p className="text-sm text-bark/70">{section.summary}</p>
      </button>

      <div className="space-y-4 border-t border-mist bg-cream px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {section.detail.map((item) => (
            <InfoTile
              key={item.label}
              tone="subtle"
              size="sm"
              label={item.label}
              value={item.value}
            />
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <PartyAgreeButton
            party="Farmer A"
            agreed={agreedByA}
            interactive={viewerParty === "A"}
            onClick={onToggleA}
          />
          <PartyAgreeButton
            party="Farmer B"
            agreed={agreedByB}
            interactive={viewerParty === "B"}
            onClick={onToggleB}
          />
        </div>
      </div>
    </article>
  );
}

function PartyAgreeButton({
  party,
  agreed,
  interactive,
  onClick,
}: {
  party: string;
  agreed: boolean;
  interactive: boolean;
  onClick: () => void;
}) {
  const Icon = agreed ? CheckCircle : Circle;
  const label = interactive
    ? `${party}: ${agreed ? "Agreed" : "Tap to agree"}`
    : `${party}: ${agreed ? "Agreed" : "Awaiting"}`;
  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      aria-pressed={agreed}
      title={interactive ? undefined : `Only ${party} can toggle this from their account.`}
      className={cn(
        "inline-flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        interactive ? "cursor-pointer" : "cursor-not-allowed",
        agreed
          ? "border-match/30 bg-match-light text-match"
          : interactive
            ? "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
            : "border-mist bg-warm-white/60 text-bark/55"
      )}
    >
      <span>{label}</span>
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function toViewableArtefact(artefact: AgreementArtefact): ViewableArtefact {
  return {
    id: artefact.id,
    label: artefact.label,
    kind: artefact.kind,
    description: artefact.description,
    uploaderLabel: artefact.uploadedBy === "farmerA" ? "Farmer A" : "Farmer B",
    sectionId: artefact.sectionId,
  };
}

function ArtefactStrip({
  artefacts,
  sections,
  onSelectSection,
  activeSectionId,
  viewerParty,
  onAddArtefact,
}: {
  artefacts: AgreementArtefact[];
  sections: AgreementSection[];
  onSelectSection: (sectionId: string) => void;
  activeSectionId: string | null;
  viewerParty: WorkspaceParty;
  onAddArtefact?: (draft: ArtefactDraft) => void;
}) {
  const [activeArtefactId, setActiveArtefactId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const activeArtefact =
    artefacts.find((artefact) => artefact.id === activeArtefactId) ?? null;
  const matchingCount = activeSectionId
    ? artefacts.filter((artefact) => artefact.sectionId === activeSectionId)
        .length
    : artefacts.length;
  const activeSectionLabel = activeSectionId
    ? sections.find((section) => section.id === activeSectionId)?.label
    : undefined;

  const uploaderLabel =
    viewerParty === "A" ? "Farmer A (Dale)" : "Farmer B (Brett)";

  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Shared artefacts
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-bark/55">
            {activeSectionLabel
              ? `${matchingCount} for "${activeSectionLabel}"`
              : `${artefacts.length} item${artefacts.length === 1 ? "" : "s"}`}
          </span>
          {onAddArtefact && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-sage-deep/20 bg-warm-white px-3 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              + Add artefact
            </button>
          )}
        </div>
      </div>
      {artefacts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sage-deep/15 bg-warm-white px-4 py-6 text-center text-sm text-bark/60">
          No artefacts shared yet. Add one when an NVD, photo, or property
          map needs to be on record.
        </p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {artefacts.map((artefact) => (
            <ArtefactCard
              key={artefact.id}
              artefact={artefact}
              onOpen={() => setActiveArtefactId(artefact.id)}
              dimmed={
                !!activeSectionId && artefact.sectionId !== activeSectionId
              }
            />
          ))}
        </div>
      )}
      <ArtefactViewer
        artefact={activeArtefact ? toViewableArtefact(activeArtefact) : null}
        sections={sections.map((section) => ({
          id: section.id,
          label: section.label,
        }))}
        onClose={() => setActiveArtefactId(null)}
        onSelectSection={onSelectSection}
      />
      {onAddArtefact && (
        <ArtefactUploadDialog
          open={uploadOpen}
          uploaderLabel={uploaderLabel}
          sections={sections.map((section) => ({
            id: section.id,
            label: section.label,
          }))}
          onClose={() => setUploadOpen(false)}
          onSubmit={(draft) => {
            onAddArtefact(draft);
            setUploadOpen(false);
          }}
        />
      )}
    </section>
  );
}

function ArtefactCard({
  artefact,
  onOpen,
  dimmed,
}: {
  artefact: AgreementArtefact;
  onOpen: () => void;
  dimmed?: boolean;
}) {
  const Icon =
    artefact.kind === "photo"
      ? ImageIcon
      : artefact.kind === "map"
        ? MapIcon
        : FileText;
  const uploader =
    artefact.uploadedBy === "farmerA" ? "Farmer A" : "Farmer B";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open artefact: ${artefact.label}`}
      className={cn(
        "flex w-44 shrink-0 cursor-pointer flex-col gap-2 rounded-xl border border-sage-deep/10 bg-warm-white p-3 text-left transition hover:border-sage/40 hover:bg-sage-mist/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        dimmed && "opacity-55"
      )}
    >
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-sage/35 bg-sage-mist text-sage-deep">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-semibold text-bark">{artefact.label}</p>
        <p className="mt-0.5 text-xs text-bark/65">{artefact.description}</p>
        <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
          From {uploader}
        </p>
      </div>
    </button>
  );
}
