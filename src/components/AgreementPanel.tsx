"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle,
  Circle,
  ClipboardCheck,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Map as MapIcon,
  UploadCloud,
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
  TransportJob,
  TransportQuote,
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
  onRequestTransport?: () => void;
  /** The party the current viewer represents. Drives which agree button is interactive. */
  viewerParty: WorkspaceParty;
  /** Live artefacts list (allows the workspace client to lift state above the panel). */
  artefacts: AgreementArtefact[];
  /** Called when the upload dialog submits. */
  onAddArtefact?: (draft: ArtefactDraft) => void;
  /** Linked transport job. When present, the Transport tab renders a live summary. */
  transportJob?: TransportJob;
  /** Live transport confirmations from the workspace client (for the summary count). */
  transportConfirmations?: Record<
    string,
    { farmerA: boolean; farmerB: boolean; driver: boolean }
  >;
  /** Live transport quotes - the commercial chain. Empty array when no negotiation has started. */
  transportQuotes?: TransportQuote[];
  /** Pointer to the accepted quote in the chain. */
  acceptedTransportQuoteId?: string;
};

type AgreementTab =
  | "overview"
  | "terms"
  | "artifacts"
  | "lifecycle"
  | "transport"
  | "timeline";

type TimelineItem = {
  title: string;
  detail: string;
  complete?: boolean;
};

type AttentionGuidance = {
  title: string;
  explanation: string;
  tip: string;
  sectionId?: string;
  /** Specific detail row label to scroll to + highlight when the user
   * taps "Open section". When omitted, the section is opened without
   * focusing any particular row. */
  fieldLabel?: string;
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
  { id: "transport", label: "Transport" },
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
  onRequestTransport,
  viewerParty,
  artefacts,
  onAddArtefact,
  transportJob,
  transportConfirmations,
  transportQuotes,
  acceptedTransportQuoteId,
}: AgreementPanelProps) {
  const [activeTab, setActiveTab] = useState<AgreementTab>("overview");
  const [pendingCancel, setPendingCancel] = useState(false);
  // Set when "Open section" is tapped from an attention dialog with a
  // fieldLabel. SectionCard scrolls to the matching detail tile and
  // highlights it, then clears this value so subsequent taps re-trigger.
  const [focusFieldLabel, setFocusFieldLabel] = useState<string | null>(null);

  function handleOpenFlaggedField(sectionId: string, fieldLabel?: string) {
    onSelectSection(sectionId);
    setActiveTab("terms");
    setFocusFieldLabel(fieldLabel ?? null);
  }

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
            artefacts={artefacts}
            onSelectSection={onSelectSection}
            onOpenFlaggedField={handleOpenFlaggedField}
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
                artefacts={artefacts.filter(
                  (artefact) => artefact.sectionId === section.id
                )}
                allSections={agreement.sections}
                onSelectSection={onSelectSection}
                onAddArtefact={onAddArtefact}
                focusFieldLabel={
                  activeSectionId === section.id ? focusFieldLabel : null
                }
                onFocusFieldHandled={() => setFocusFieldLabel(null)}
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

        {activeTab === "transport" && (
          <TransportTabContent
            transportJob={transportJob}
            transportHref={transportHref}
            confirmations={transportConfirmations}
            quotes={transportQuotes ?? []}
            acceptedQuoteId={acceptedTransportQuoteId}
            viewerParty={viewerParty}
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
        ) : onRequestTransport ? (
          <Button type="button" variant="secondary" onClick={onRequestTransport}>
            Request transport
            <Truck className="h-4 w-4" aria-hidden />
          </Button>
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

function TransportTabContent({
  transportJob,
  transportHref,
  confirmations,
  quotes,
  acceptedQuoteId,
  viewerParty,
}: {
  transportJob?: TransportJob;
  transportHref?: string;
  confirmations?: Record<
    string,
    { farmerA: boolean; farmerB: boolean; driver: boolean }
  >;
  quotes: TransportQuote[];
  acceptedQuoteId?: string;
  viewerParty: WorkspaceParty;
}) {
  if (!transportJob) {
    return (
      <div className="rounded-xl border border-dashed border-sage-deep/15 bg-cream/55 px-4 py-6 text-center">
        <Truck
          className="mx-auto mb-2 h-6 w-6 text-sage-deep"
          aria-hidden
        />
        <p className="text-sm font-semibold text-bark">
          No transport room linked yet.
        </p>
        <p className="mt-2 text-sm text-bark/70">
          A transport room opens when the agreement is activated and a driver
          is invited.
        </p>
      </div>
    );
  }

  let confirmedCount = 0;
  for (const section of transportJob.sections) {
    const state = confirmations?.[section.id] ?? section.confirmations;
    confirmedCount +=
      (state.farmerA ? 1 : 0) +
      (state.farmerB ? 1 : 0) +
      (state.driver ? 1 : 0);
  }
  const totalConfirmations = transportJob.sections.length * 3;

  const showPricing = viewerParty === "A";
  const acceptedQuote = acceptedQuoteId
    ? quotes.find((q) => q.id === acceptedQuoteId)
    : undefined;
  const pendingQuote = quotes
    .slice()
    .reverse()
    .find((q) => q.status === "pending");
  const latestQuote =
    acceptedQuote ?? pendingQuote ?? quotes[quotes.length - 1];

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Truck className="h-5 w-5" aria-hidden />
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Stock movement
            </h3>
          </div>
          <StatusBadge tone="info">Status: {transportJob.status}</StatusBadge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            tone="subtle"
            size="sm"
            label="Driver"
            value={transportJob.driver}
          />
          <InfoTile
            tone="subtle"
            size="sm"
            label="Pickup window"
            value={transportJob.preferredDate}
          />
          <InfoTile
            tone="subtle"
            size="sm"
            label="Pickup from"
            value={transportJob.pickup}
          />
          <InfoTile
            tone="subtle"
            size="sm"
            label="Delivery to"
            value={transportJob.destination}
          />
        </div>
      </section>

      <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
            Coordination
          </h3>
          <span className="rounded-full bg-warm-white px-2.5 py-0.5 text-xs font-bold text-stone">
            {confirmedCount} / {totalConfirmations} confirmations
          </span>
        </div>
        <ul className="space-y-2">
          {transportJob.sections.map((section) => {
            const state =
              confirmations?.[section.id] ?? section.confirmations;
            const sectionConfirmed =
              (state.farmerA ? 1 : 0) +
              (state.farmerB ? 1 : 0) +
              (state.driver ? 1 : 0);
            const fullyConfirmed = sectionConfirmed === 3;
            const Icon = fullyConfirmed ? CheckCircle : Circle;
            return (
              <li
                key={section.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-mist bg-warm-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-bark">{section.label}</p>
                  <p className="text-xs text-bark/65">
                    {sectionConfirmed} of 3 parties confirmed
                  </p>
                </div>
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    fullyConfirmed ? "text-match" : "text-stone"
                  )}
                  aria-hidden
                />
              </li>
            );
          })}
        </ul>
      </section>

      {showPricing ? (
        <TransportPricingSummary
          quote={latestQuote}
          accepted={!!acceptedQuote}
        />
      ) : (
        <section className="flex items-start gap-3 rounded-xl border border-amber/25 bg-amber-light/45 p-4">
          <EyeOff
            className="mt-0.5 h-5 w-5 shrink-0 text-amber"
            aria-hidden
          />
          <div>
            <p className="text-sm font-bold text-bark">
              Transport pricing isn&apos;t visible to you.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              The haulage rate sits between Farmer A and the driver. You see
              pickup, delivery, and arrival timing - the commercial detail
              between the other two parties stays between them.
            </p>
          </div>
        </section>
      )}

      {transportHref && (
        <ButtonLink href={transportHref}>
          Open transport room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      )}
    </div>
  );
}

function TransportPricingSummary({
  quote,
  accepted,
}: {
  quote?: TransportQuote;
  accepted: boolean;
}) {
  if (!quote) {
    return (
      <section className="rounded-xl border border-dashed border-sage-deep/15 bg-cream/55 px-4 py-6 text-center">
        <Banknote
          className="mx-auto mb-2 h-6 w-6 text-sage-deep"
          aria-hidden
        />
        <p className="text-sm font-semibold text-bark">
          No transport rate proposed yet.
        </p>
        <p className="mt-1 text-sm text-bark/70">
          The driver hasn&apos;t sent a quote. Open the transport room to
          start the conversation.
        </p>
      </section>
    );
  }
  const basisLabel =
    quote.basis === "per_head"
      ? "per head"
      : quote.basis === "per_km"
        ? "per km"
        : "flat";
  const tone: "success" | "warning" | "info" = accepted
    ? "success"
    : quote.status === "rejected"
      ? "warning"
      : "info";
  const statusLabel = accepted
    ? "Accepted"
    : quote.status === "rejected"
      ? "Rejected"
      : quote.status === "countered"
        ? "Countered"
        : "Awaiting response";
  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sage-deep">
          <Banknote className="h-5 w-5" aria-hidden />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Transport rate
          </h3>
        </div>
        <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
      </div>
      <p className="text-2xl font-bold text-sage-deep">
        ${quote.amount.toFixed(2)} {quote.currency}{" "}
        <span className="text-base font-semibold text-bark/70">
          {basisLabel}
        </span>
      </p>
      <p className="mt-1 text-xs text-bark/65">{quote.paymentTerms}</p>
      {quote.note && (
        <p className="mt-3 rounded-lg border border-mist bg-warm-white px-3 py-2 text-sm text-bark/75">
          {quote.note}
        </p>
      )}
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone">
        Proposed by {quote.proposedBy === "driver" ? "Driver" : "Farmer A"}{" "}
        &middot; {quote.at}
      </p>
    </section>
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
  artefacts,
  onSelectSection,
  onOpenFlaggedField,
}: {
  agreement: Agreement;
  sectionState: Record<string, SectionAgreementState>;
  mutuallyAgreedCount: number;
  artefacts: AgreementArtefact[];
  onSelectSection: (sectionId: string) => void;
  onOpenFlaggedField: (sectionId: string, fieldLabel?: string) => void;
}) {
  const [guidance, setGuidance] = useState<AttentionGuidance | null>(null);
  const [activeArtefactId, setActiveArtefactId] = useState<string | null>(null);
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
  const activeArtefact =
    artefacts.find((artefact) => artefact.id === activeArtefactId) ?? null;

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
            guidance={{
              title: "Agreement sections still need mutual sign-off",
              explanation:
                "This caution means at least one section has not been agreed by both Dale and Brett.",
              tip: "Open the Terms tab, check the sections marked awaiting a party, then have that party tap their agree control once the wording is right.",
            }}
            onOpenGuidance={setGuidance}
          />
          <AlignmentRow
            complete={paddockAgreed}
            label={
              paddockAgreed
                ? "Feed, water and fencing details match"
                : "Feed, water and fencing details still under review"
            }
            guidance={{
              title: "Paddock details need confirmation",
              explanation:
                "The feed, water, and fencing row turns green once the paddock section is agreed by both parties.",
              tip: "Review the paddock photos and details, then confirm the Paddock section if both sides accept them.",
              sectionId: "paddock",
              fieldLabel: "Feed",
            }}
            onOpenGuidance={setGuidance}
          />
          <AlignmentRow
            complete={termsAgreed}
            label={
              termsAgreed
                ? "Rate and final terms agreed"
                : "Rate and final terms require attention"
            }
            guidance={{
              title: "Rate and final terms need attention",
              explanation:
                "The commercial terms have not been accepted by both parties yet, so the agreement cannot be finalised.",
              tip: "Settle the weekly rate, feed top-up, water, and fencing responsibilities, then mark the Rate and terms section agreed.",
              sectionId: "terms",
              fieldLabel: "Rate",
            }}
            onOpenGuidance={setGuidance}
          />
          {agreement.transportRequired && (
            <AlignmentRow
              complete={transportAgreed}
              label={
                transportAgreed
                  ? "Transport plan confirmed by both parties"
                  : "Transport plan still being arranged"
              }
              guidance={{
                title: "Transport plan is not fully confirmed",
                explanation:
                  "The transport section still has at least one party waiting to confirm pickup, delivery, or operator details.",
                tip: "Open the transport room or the Transport section, confirm the pickup window and driver, then have the remaining party agree.",
                sectionId: "transport",
                fieldLabel: "Preferred date",
              }}
              onOpenGuidance={setGuidance}
            />
          )}
        </div>
      </section>

      <ReadinessChecklist
        agreement={agreement}
        artefacts={artefacts}
        onOpenGuidance={setGuidance}
        onOpenArtefact={setActiveArtefactId}
      />
      <AttentionDialog
        guidance={guidance}
        onClose={() => setGuidance(null)}
        onOpenSection={(sectionId, fieldLabel) => {
          onOpenFlaggedField(sectionId, fieldLabel);
          setGuidance(null);
        }}
      />
      <ArtefactViewer
        artefact={activeArtefact ? toViewableArtefact(activeArtefact) : null}
        sections={agreement.sections.map((section) => ({
          id: section.id,
          label: section.label,
        }))}
        onClose={() => setActiveArtefactId(null)}
        onSelectSection={onSelectSection}
      />
    </div>
  );
}

function AlignmentRow({
  complete,
  label,
  guidance,
  onOpenGuidance,
}: {
  complete: boolean;
  label: string;
  guidance: AttentionGuidance;
  onOpenGuidance: (guidance: AttentionGuidance) => void;
}) {
  const Icon = complete ? CheckCircle : AlertTriangle;
  if (!complete) {
    return (
      <button
        type="button"
        onClick={() => onOpenGuidance(guidance)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-sage-deep/10 bg-warm-white px-4 py-3 text-left transition hover:border-amber/45 hover:bg-amber-light/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-sm font-semibold text-bark">{label}</span>
        <Icon className="h-5 w-5 shrink-0 text-amber" aria-hidden />
      </button>
    );
  }
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

const readinessGuidance: Record<string, AttentionGuidance> = {
  "Transport ready": {
    title: "Transport is not ready yet",
    explanation:
      "This caution means the stock movement is still provisional and the agreement is waiting on transport confirmation.",
    tip: "Open the transport room, confirm pickup and delivery details with Wayne, then return here once the plan is confirmed.",
    sectionId: "transport",
  },
};

const readinessArtefacts: Record<string, string> = {
  "NLIS tagged": "art-nlis-doc",
  "Vaccination records uploaded": "art-vaccination-doc",
};

function ReadinessChecklist({
  agreement,
  artefacts,
  onOpenGuidance,
  onOpenArtefact,
}: {
  agreement: Agreement;
  artefacts: AgreementArtefact[];
  onOpenGuidance: (guidance: AttentionGuidance) => void;
  onOpenArtefact: (artefactId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
        Livestock readiness checklist
      </h3>
      <div className="space-y-2">
        {agreement.readinessChecklist.map((item) => {
          const artefactId = readinessArtefacts[item.label];
          const hasArtefact =
            !!artefactId && artefacts.some((artefact) => artefact.id === artefactId);
          const guidance = readinessGuidance[item.label] ?? {
            title: `${item.label} needs attention`,
            explanation:
              "This item is required before the agreement can move cleanly into operation.",
            tip: "Upload or confirm the missing detail, then return to this checklist.",
          };
          const interactive = hasArtefact || !item.complete;
          const Icon = item.complete ? CheckCircle : AlertTriangle;
          const iconClass = item.complete ? "text-match" : "text-amber";

          if (!interactive) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-sage-deep/10 bg-warm-white px-4 py-3"
              >
                <span className="font-semibold text-bark">{item.label}</span>
                <Icon className={cn("h-5 w-5", iconClass)} aria-hidden />
              </div>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (hasArtefact) {
                  onOpenArtefact(artefactId);
                  return;
                }
                onOpenGuidance(guidance);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-sage-deep/10 bg-warm-white px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                item.complete
                  ? "hover:border-match/35 hover:bg-match-light/25 focus-visible:ring-match"
                  : "hover:border-amber/45 hover:bg-amber-light/35 focus-visible:ring-amber"
              )}
            >
              <span className="font-semibold text-bark">{item.label}</span>
              <span className="inline-flex items-center gap-2">
                {hasArtefact && (
                  <FileText className="h-4 w-4 text-sage-deep" aria-hidden />
                )}
                <Icon className={cn("h-5 w-5", iconClass)} aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AttentionDialog({
  guidance,
  onClose,
  onOpenSection,
}: {
  guidance: AttentionGuidance | null;
  onClose: () => void;
  onOpenSection: (sectionId: string, fieldLabel?: string) => void;
}) {
  if (!guidance) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attention-dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]">
        <div className="flex items-start gap-3 border-b border-sage-deep/15 bg-amber-light/45 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Needs attention
            </p>
            <h2 id="attention-dialog-title" className="mt-1 text-lg font-bold text-sage-deep">
              {guidance.title}
            </h2>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-bark/75">
            {guidance.explanation}
          </p>
          <div className="rounded-xl border border-mist bg-cream/65 px-4 py-3">
            <div className="mb-1 flex items-center gap-2 text-sage-deep">
              <ClipboardCheck className="h-4 w-4" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-wide">Tip</p>
            </div>
            <p className="text-sm leading-relaxed text-bark/75">{guidance.tip}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-sage-deep/15 bg-cream/45 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-mist bg-warm-white px-4 py-2 text-sm font-semibold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            Close
          </button>
          {guidance.sectionId && (
            <button
              type="button"
              onClick={() =>
                onOpenSection(guidance.sectionId!, guidance.fieldLabel)
              }
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              {guidance.fieldLabel ? "Take me there" : "Open section"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
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
  artefacts,
  allSections,
  onSelectSection,
  onAddArtefact,
  focusFieldLabel,
  onFocusFieldHandled,
}: {
  section: AgreementSection;
  active: boolean;
  state: SectionAgreementState;
  viewerParty: WorkspaceParty;
  onSelect: () => void;
  onToggleA: () => void;
  onToggleB: () => void;
  artefacts: AgreementArtefact[];
  allSections: AgreementSection[];
  onSelectSection: (sectionId: string) => void;
  onAddArtefact?: (draft: ArtefactDraft) => void;
  /** When set, scroll to and highlight the detail row whose label matches.
   * Only honoured when active is true. */
  focusFieldLabel?: string | null;
  /** Called once the focus highlight is done (or no matching row was found)
   * so the parent can clear focusFieldLabel and let it re-trigger. */
  onFocusFieldHandled?: () => void;
}) {
  const Icon = sectionIcons[section.id] ?? Sprout;
  const { agreedByA, agreedByB } = state;
  const [activeArtefactId, setActiveArtefactId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const activeArtefact =
    artefacts.find((artefact) => artefact.id === activeArtefactId) ?? null;
  const uploaderLabel =
    viewerParty === "A" ? "Farmer A (Dale)" : "Farmer B (Brett)";

  const alignment = getSectionAlignment(section, agreedByA, agreedByB);

  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedFieldLabel, setHighlightedFieldLabel] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!active || !focusFieldLabel) return;
    const target = fieldRefs.current[focusFieldLabel];
    if (!target) {
      // Nothing to highlight; let the parent reset so the next tap works.
      onFocusFieldHandled?.();
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedFieldLabel(focusFieldLabel);
    const clearTimer = window.setTimeout(() => {
      setHighlightedFieldLabel(null);
      onFocusFieldHandled?.();
    }, 2400);
    return () => window.clearTimeout(clearTimer);
  }, [active, focusFieldLabel, onFocusFieldHandled]);

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
          <StatusBadge tone={alignment.tone}>{alignment.label}</StatusBadge>
        </div>
        <p className="text-sm text-bark/70">{section.summary}</p>
      </button>

      <div className="space-y-4 border-t border-mist bg-cream px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {section.detail.map((item) => {
            const isHighlighted = highlightedFieldLabel === item.label;
            return (
              <div
                key={item.label}
                ref={(el) => {
                  fieldRefs.current[item.label] = el;
                }}
                className={cn(
                  "rounded-xl transition",
                  isHighlighted &&
                    "ring-2 ring-amber bg-amber-light/60 shadow-[0_0_0_4px_rgba(247,234,208,0.55)]"
                )}
              >
                <InfoTile
                  tone="subtle"
                  size="sm"
                  label={item.label}
                  value={item.value}
                />
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-sage-deep/10 bg-warm-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-stone">
                Section documents
              </p>
              <p className="mt-1 text-sm font-semibold text-bark">
                {artefacts.length > 0
                  ? `${artefacts.length} attached to ${section.label}`
                  : `No documents attached to ${section.label} yet`}
              </p>
            </div>
            {onAddArtefact && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-sage-deep/20 bg-cream px-3 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <UploadCloud className="h-3.5 w-3.5" aria-hidden />
                Upload here
              </button>
            )}
          </div>

          {artefacts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {artefacts.map((artefact) => (
                <button
                  key={artefact.id}
                  type="button"
                  onClick={() => setActiveArtefactId(artefact.id)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-mist bg-cream px-3 text-xs font-bold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  <FileText className="h-3.5 w-3.5 text-sage-deep" aria-hidden />
                  {artefact.label}
                </button>
              ))}
            </div>
          )}
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
      <ArtefactViewer
        artefact={activeArtefact ? toViewableArtefact(activeArtefact) : null}
        sections={allSections.map((item) => ({
          id: item.id,
          label: item.label,
        }))}
        onClose={() => setActiveArtefactId(null)}
        onSelectSection={onSelectSection}
      />
      {onAddArtefact && (
        <ArtefactUploadDialog
          open={uploadOpen}
          uploaderLabel={uploaderLabel}
          sections={[{ id: section.id, label: section.label }]}
          initialSectionId={section.id}
          requireSection
          onClose={() => setUploadOpen(false)}
          onSubmit={(draft) => {
            onAddArtefact({ ...draft, sectionId: draft.sectionId ?? section.id });
            setUploadOpen(false);
          }}
        />
      )}
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
    recordDetails: artefactRecordDetails[artefact.id],
  };
}

function getSectionAlignment(
  section: AgreementSection,
  agreedByA: boolean,
  agreedByB: boolean
): { label: "agreed" | "pending" | "needs attention"; tone: "success" | "warning" | "neutral" } {
  if (agreedByA && agreedByB) return { label: "agreed", tone: "success" };
  const farmerAValue = section.detail.find((row) => row.label === "Farmer A value")?.value;
  const farmerBValue = section.detail.find((row) => row.label === "Farmer B value")?.value;
  if (!farmerAValue || !farmerBValue) return { label: "pending", tone: "neutral" };
  if (farmerAValue.trim().toLowerCase() !== farmerBValue.trim().toLowerCase()) {
    return { label: "needs attention", tone: "warning" };
  }
  return { label: "pending", tone: "neutral" };
}

const artefactRecordDetails: Record<string, ViewableArtefact["recordDetails"]> = {
  "art-vaccination-doc": {
    title: "Vaccination certificate - Mob DM-100",
    status: "Checked",
    rows: [
      { label: "Stock", value: "100 Angus cattle" },
      { label: "Treatment", value: "5-in-1 vaccination" },
      { label: "Administered", value: "04 May 2026" },
      { label: "Batch", value: "VAX-5IN1-0426" },
      { label: "Withholding", value: "Nil withholding noted" },
      { label: "Vet / certifier", value: "Central West Large Animal Clinic" },
    ],
    notes:
      "Record matches the Stock section and supports Dale's readiness checklist. Drenching note is attached to the same certificate pack.",
  },
  "art-nlis-doc": {
    title: "NLIS movement list - Mob DM-100",
    status: "Checked",
    rows: [
      { label: "Head count", value: "100 cattle" },
      { label: "PIC of origin", value: "NA123456" },
      { label: "Tag range", value: "982 000402100001 to 982 000402100100" },
      { label: "Uploaded by", value: "Dale Morgan" },
    ],
    notes:
      "The tag list is on file for the current movement and can be checked against the transport manifest before loading.",
  },
};

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
