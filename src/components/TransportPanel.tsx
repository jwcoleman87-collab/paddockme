"use client";

import { useState } from "react";
import {
  ArrowRight,
  Ban,
  Banknote,
  Calendar,
  Check,
  CheckCircle,
  ClipboardList,
  Eye,
  EyeOff,
  Map as MapIcon,
  MapPin,
  PackageOpen,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  ArtefactUploadDialog,
  type ArtefactDraft,
} from "@/components/ArtefactUploadDialog";
import {
  ArtefactViewer,
  type ViewableArtefact,
} from "@/components/ArtefactViewer";
import { Button } from "@/components/Button";
import { InfoTile } from "@/components/InfoTile";
import { SelectablePill } from "@/components/SelectablePill";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { cn } from "@/lib/utils";
import type {
  TransportArtefact,
  TransportCapacity,
  TransportJob,
  TransportQuote,
  TransportQuoteBasis,
  TransportRole,
  TransportSection,
  TransportSectionStatus,
  TransportTimelineEntry,
} from "@/lib/dummyData";

type ConfirmationState = TransportSection["confirmations"];

type TransportPanelProps = {
  job: TransportJob;
  role: TransportRole;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  confirmations: Record<string, ConfirmationState>;
  onToggleConfirmation: (sectionId: string) => void;
  /** When provided, replaces job.timeline. Used to derive completion from live confirmations. */
  timeline?: TransportTimelineEntry[];
  /** Live artefacts list (allows the client to lift state above the panel). */
  artefacts: TransportArtefact[];
  onAddArtefact?: (draft: ArtefactDraft) => void;
  /** Live quote chain - the transport commercial negotiation. */
  quotes: TransportQuote[];
  /** Pointer to the accepted quote, if any. */
  acceptedQuoteId?: string;
  /** Driver or Farmer A proposes a new quote. Not callable as Farmer B (the tab is hidden). */
  onProposeQuote?: (draft: TransportQuoteDraft) => void;
  /** Recipient of a pending quote accepts it. */
  onAcceptQuote?: (quoteId: string) => void;
  /** Recipient of a pending quote rejects it. */
  onRejectQuote?: (quoteId: string) => void;
  /** Driver's other posted capacity rows. Rendered as Possible backloads when role=driver. */
  backloads?: TransportCapacity[];
};

export type TransportQuoteDraft = {
  basis: TransportQuoteBasis;
  amount: number;
  currency: string;
  paymentTerms: string;
  note?: string;
  previousQuoteId?: string;
};

type TransportTab =
  | "overview"
  | "coordination"
  | "rate"
  | "artefacts"
  | "timeline";

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> =
  {
    pickup: PackageOpen,
    manifest: ClipboardList,
    route: Route,
    delivery: MapPin,
    return: Truck,
  };

const transportTabs = [
  { id: "overview", label: "Overview" },
  { id: "coordination", label: "Coordination" },
  { id: "rate", label: "Rate" },
  { id: "artefacts", label: "Artefacts" },
  { id: "timeline", label: "Timeline" },
] satisfies { id: TransportTab; label: string }[];

const sectionStatusTone: Record<
  TransportSectionStatus,
  "success" | "warning" | "info" | "neutral"
> = {
  Done: "success",
  Confirmed: "success",
  "In progress": "info",
  Pending: "warning",
};

const roleLabel: Record<TransportRole, string> = {
  farmerA: "Farmer A",
  farmerB: "Farmer B",
  driver: "Driver",
};

const transportCardClass =
  "min-w-0 overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)]";

export function TransportPanel({
  job,
  role,
  activeSectionId,
  onSelectSection,
  confirmations,
  onToggleConfirmation,
  timeline,
  artefacts,
  onAddArtefact,
  quotes,
  acceptedQuoteId,
  onProposeQuote,
  onAcceptQuote,
  onRejectQuote,
  backloads,
}: TransportPanelProps) {
  const timelineItems = timeline ?? job.timeline;
  const [activeTab, setActiveTab] = useState<TransportTab>("overview");
  const isDriver = role === "driver";
  // The landowner-visibility wall: Farmer B never sees the Rate tab. The
  // pricing chain stays between Farmer A and the driver.
  const showRateTab = role !== "farmerB";
  const visibleTabs = showRateTab
    ? transportTabs
    : transportTabs.filter((tab) => tab.id !== "rate");

  return (
    <section className={transportCardClass}>
      <div className="border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
        <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <StatusBadge tone="info">Movement: {job.status}</StatusBadge>
          <StatusBadge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Logistics-only surface
          </StatusBadge>
          <StatusBadge tone="neutral">
            <Truck className="h-3.5 w-3.5" aria-hidden />
            3 parties
          </StatusBadge>
        </div>
        <h2 className="text-2xl font-bold text-sage-deep">
          Stock movement room
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-bark/65">
          Farmer A, Farmer B and the driver coordinate the move here. Agreement
          pricing and contract terms stay out of this room by design.
        </p>

        <div
          role="tablist"
          aria-label="Transport panel sections"
          className="mt-4 flex flex-wrap gap-1 rounded-[24px] border border-sage-deep/10 bg-warm-white p-1"
        >
          {visibleTabs.map((tab) => (
            <TransportTabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TransportTabButton>
          ))}
        </div>
      </div>

      <div role="tabpanel" className="p-5">
        {activeTab === "overview" && (
          <TransportOverview
            job={job}
            role={role}
            backloads={backloads ?? []}
          />
        )}

        {activeTab === "coordination" && (
          <CoordinationList
            sections={job.sections}
            role={role}
            activeSectionId={activeSectionId}
            onSelectSection={onSelectSection}
            confirmations={confirmations}
            onToggleConfirmation={onToggleConfirmation}
          />
        )}

        {activeTab === "rate" && showRateTab && (
          <RateNegotiation
            quotes={quotes}
            acceptedQuoteId={acceptedQuoteId}
            role={role}
            onPropose={onProposeQuote}
            onAccept={onAcceptQuote}
            onReject={onRejectQuote}
          />
        )}

        {activeTab === "artefacts" && (
          <TransportArtefactStrip
            artefacts={artefacts}
            sections={job.sections}
            onSelectSection={onSelectSection}
            activeSectionId={activeSectionId}
            role={role}
            driverName={job.driver}
            onAddArtefact={onAddArtefact}
          />
        )}

        {activeTab === "timeline" && (
          <div className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
            <Timeline items={timelineItems} />
          </div>
        )}
      </div>

      {isDriver && (
        <div className="flex items-start gap-3 border-t border-sage-deep/15 bg-amber-light/45 px-5 py-4">
          <EyeOff
            className="mt-0.5 h-5 w-5 shrink-0 text-amber"
            aria-hidden
          />
          <div>
            <p className="text-sm font-bold text-bark">
              You&apos;re viewing as the driver.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              Commercial detail (agistment duration, rate, contract terms)
              stays in the agreement workspace between Farmer A and Farmer B.
              You see the logistics you need to move the stock.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function TransportTabButton({
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

function TransportOverview({
  job,
  role,
  backloads,
}: {
  job: TransportJob;
  role: TransportRole;
  backloads: TransportCapacity[];
}) {
  const isDriver = role === "driver";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile
          icon={<MapPin className="h-4 w-4" />}
          iconPlacement="inline"
          label="Pickup"
          value={job.pickup}
        />
        <InfoTile
          icon={<MapPin className="h-4 w-4" />}
          iconPlacement="inline"
          label="Destination"
          value={job.destination}
        />
        <InfoTile
          icon={<Truck className="h-4 w-4" />}
          iconPlacement="inline"
          label="Livestock"
          value={job.livestockCount}
        />
        <InfoTile
          icon={<Calendar className="h-4 w-4" />}
          iconPlacement="inline"
          label="Preferred date"
          value={job.preferredDate}
        />
        <InfoTile
          icon={<Truck className="h-4 w-4" />}
          iconPlacement="inline"
          label="Driver"
          value={job.driver}
        />
        <InfoTile
          icon={<MapIcon className="h-4 w-4" />}
          iconPlacement="inline"
          label="Route"
          value={job.routeSummary}
        />
      </div>

      {!isDriver && (
        <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
              Agreement context
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold text-stone">
              <Eye className="h-3 w-3" aria-hidden />
              Hidden from driver
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile
              tone="subtle"
              size="sm"
              label="Duration"
              value={job.agreementContext.duration}
            />
            <InfoTile
              tone="subtle"
              size="sm"
              label="Weeks remaining"
              value={`${job.agreementContext.weeksRemaining}`}
            />
            <InfoTile
              tone="subtle"
              size="sm"
              label="Agreement status"
              value={job.agreementContext.agreementStatus}
            />
          </div>
        </section>
      )}

      {isDriver && backloads.length > 0 && (
        <BackloadsPanel job={job} backloads={backloads} />
      )}
    </div>
  );
}

function BackloadsPanel({
  job,
  backloads,
}: {
  job: TransportJob;
  backloads: TransportCapacity[];
}) {
  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-sage-deep">
        <Route className="h-5 w-5" aria-hidden />
        <h3 className="text-sm font-bold uppercase tracking-wide">
          Possible backloads
        </h3>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-bark/70">
        Your other posted runs that could chain off this delivery at{" "}
        <span className="font-semibold text-bark">{job.destination}</span>.
        Turning the empty leg back into a paid leg.
      </p>
      <ul className="space-y-2">
        {backloads.map((capacity) => (
          <BackloadRow key={capacity.id} capacity={capacity} />
        ))}
      </ul>
    </section>
  );
}

function BackloadRow({ capacity }: { capacity: TransportCapacity }) {
  const rateLabel = capacity.rateAmount
    ? `$${capacity.rateAmount.toFixed(2)} ${
        capacity.rateBasis === "per_head"
          ? "/ head"
          : capacity.rateBasis === "per_km"
            ? "/ km"
            : "flat"
      }`
    : "Rate on enquiry";
  return (
    <li className="rounded-lg border border-mist bg-warm-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-bark">
            {capacity.originRegion} &rarr; {capacity.destinationRegion}
          </p>
          <p className="mt-0.5 text-xs text-bark/65">
            {capacity.earliestDate} - {capacity.latestDate} &middot;{" "}
            {capacity.headCapacity} head &middot; {capacity.stockTypes.join(", ")}
          </p>
          {capacity.truckLabel && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone">
              {capacity.truckLabel}
            </p>
          )}
        </div>
        <span className="rounded-full bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
          {rateLabel}
        </span>
      </div>
    </li>
  );
}

function CoordinationList({
  sections,
  role,
  activeSectionId,
  onSelectSection,
  confirmations,
  onToggleConfirmation,
}: {
  sections: TransportSection[];
  role: TransportRole;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  confirmations: Record<string, ConfirmationState>;
  onToggleConfirmation: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sage-deep/10 bg-cream/60 px-4 py-3">
        <h3 className="font-bold text-sage-deep">Movement steps</h3>
        <p className="mt-1 text-sm leading-relaxed text-bark/65">
          Tap a step to anchor the group chat. Tap your own pill in the
          confirmations row to lock the step in.
        </p>
      </div>
      {sections.map((section) => {
        const liveConfirmations =
          confirmations[section.id] ?? section.confirmations;
        return (
          <CoordinationCard
            key={section.id}
            section={section}
            role={role}
            active={activeSectionId === section.id}
            onSelect={() => onSelectSection(section.id)}
            confirmations={liveConfirmations}
            onToggleConfirmation={() => onToggleConfirmation(section.id)}
          />
        );
      })}
    </div>
  );
}

function CoordinationCard({
  section,
  role,
  active,
  onSelect,
  confirmations,
  onToggleConfirmation,
}: {
  section: TransportSection;
  role: TransportRole;
  active: boolean;
  onSelect: () => void;
  confirmations: ConfirmationState;
  onToggleConfirmation: () => void;
}) {
  const Icon = sectionIcons[section.id] ?? Truck;
  const derivedStatus = deriveStatus(confirmations, section.status);
  const tone = sectionStatusTone[derivedStatus];
  const visibleDetail =
    role === "driver"
      ? section.detail.filter((row) => !row.privateFromDriver)
      : section.detail;

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
        aria-pressed={active}
        className={cn(
          "flex w-full flex-col gap-2 px-5 py-4 text-left transition cursor-pointer",
          active
            ? "bg-sage-mist/60"
            : "hover:bg-sage-mist/40 focus-visible:bg-sage-mist/40"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sage-deep">
            <Icon className="h-5 w-5" aria-hidden />
            <h3 className="text-lg font-bold">{section.label}</h3>
          </div>
          <StatusBadge tone={tone}>{derivedStatus}</StatusBadge>
        </div>
        <p className="text-sm text-bark/70">{section.summary}</p>
      </button>

      <div className="space-y-4 border-t border-mist bg-cream px-5 py-4">
        {visibleDetail.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleDetail.map((item) => (
              <InfoTile
                key={item.label}
                tone="subtle"
                size="sm"
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-bark/60">
            No driver-visible detail recorded yet for this step.
          </p>
        )}

        <ConfirmationsRow
          confirmations={confirmations}
          role={role}
          onToggle={onToggleConfirmation}
        />
      </div>
    </article>
  );
}

function deriveStatus(
  confirmations: ConfirmationState,
  fallback: TransportSectionStatus
): TransportSectionStatus {
  if (fallback === "Done") return "Done";
  const count =
    (confirmations.farmerA ? 1 : 0) +
    (confirmations.farmerB ? 1 : 0) +
    (confirmations.driver ? 1 : 0);
  if (count === 3) return "Confirmed";
  if (count > 0) return "In progress";
  return "Pending";
}

function ConfirmationsRow({
  confirmations,
  role,
  onToggle,
}: {
  confirmations: ConfirmationState;
  role: TransportRole;
  onToggle: () => void;
}) {
  const items: { key: TransportRole; label: string; confirmed: boolean }[] = [
    {
      key: "farmerA",
      label: roleLabel.farmerA,
      confirmed: confirmations.farmerA,
    },
    {
      key: "farmerB",
      label: roleLabel.farmerB,
      confirmed: confirmations.farmerB,
    },
    {
      key: "driver",
      label: roleLabel.driver,
      confirmed: confirmations.driver,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isYours = item.key === role;
        const classes = cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
          item.confirmed
            ? "border-match/25 bg-match-light text-match"
            : "border-mist bg-warm-white text-stone",
          isYours && "ring-2 ring-sage-deep/35",
          isYours &&
            "cursor-pointer hover:border-sage/40 focus-visible:outline-none focus-visible:ring-sage"
        );
        const label = `${item.label}: ${item.confirmed ? "Confirmed" : "Awaiting"}`;

        if (isYours) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              aria-pressed={item.confirmed}
              className={classes}
            >
              {label}
            </button>
          );
        }
        return (
          <span key={item.key} className={classes}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function uploaderLabelFor(role: TransportRole, driverName: string): string {
  if (role === "driver") return `Driver (${driverName})`;
  return role === "farmerA" ? "Farmer A" : "Farmer B";
}

function TransportArtefactStrip({
  artefacts,
  sections,
  onSelectSection,
  activeSectionId,
  role,
  driverName,
  onAddArtefact,
}: {
  artefacts: TransportArtefact[];
  sections: TransportSection[];
  onSelectSection: (sectionId: string) => void;
  activeSectionId: string | null;
  role: TransportRole;
  driverName: string;
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

  const viewable: ViewableArtefact | null = activeArtefact
    ? {
        id: activeArtefact.id,
        label: activeArtefact.label,
        kind: activeArtefact.kind,
        description: activeArtefact.description,
        uploaderLabel: uploaderLabelFor(activeArtefact.uploadedBy, driverName),
        sectionId: activeArtefact.sectionId,
      }
    : null;

  const uploaderLabel = uploaderLabelFor(role, driverName);

  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Transport artefacts
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
          No transport artefacts attached yet. Add an NVD, journey plan, or
          gate access photo when one is on hand.
        </p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {artefacts.map((artefact) => (
            <TransportArtefactCard
              key={artefact.id}
              artefact={artefact}
              onOpen={() => setActiveArtefactId(artefact.id)}
              driverName={driverName}
              dimmed={
                !!activeSectionId && artefact.sectionId !== activeSectionId
              }
            />
          ))}
        </div>
      )}
      <ArtefactViewer
        artefact={viewable}
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

function TransportArtefactCard({
  artefact,
  onOpen,
  driverName,
  dimmed,
}: {
  artefact: TransportArtefact;
  onOpen: () => void;
  driverName: string;
  dimmed?: boolean;
}) {
  const kindIcon = artefact.kind;
  const Icon =
    kindIcon === "photo"
      ? MapPin // photo placeholder uses map-pin to read as a location capture
      : kindIcon === "map"
        ? MapIcon
        : ClipboardList;
  const uploader = uploaderLabelFor(artefact.uploadedBy, driverName);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open transport artefact: ${artefact.label}`}
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

function RateNegotiation({
  quotes,
  acceptedQuoteId,
  role,
  onPropose,
  onAccept,
  onReject,
}: {
  quotes: TransportQuote[];
  acceptedQuoteId?: string;
  role: TransportRole;
  onPropose?: (draft: TransportQuoteDraft) => void;
  onAccept?: (quoteId: string) => void;
  onReject?: (quoteId: string) => void;
}) {
  const acceptedQuote = acceptedQuoteId
    ? quotes.find((q) => q.id === acceptedQuoteId)
    : undefined;
  const pendingQuote = quotes
    .slice()
    .reverse()
    .find((q) => q.status === "pending");
  // The party who didn't send the pending quote is the one who can act on it.
  const youCanAct =
    pendingQuote && !acceptedQuote && pendingQuote.proposedBy !== role;
  const youProposedLast =
    pendingQuote && pendingQuote.proposedBy === role;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
        <div className="mb-2 flex items-center gap-2 text-sage-deep">
          <Banknote className="h-5 w-5" aria-hidden />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Transport rate
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-bark/70">
          Negotiate the haulage rate here. Visible to Farmer A and the driver
          only - the landowner never sees these numbers.
        </p>
      </div>

      {acceptedQuote && (
        <AcceptedQuoteCard quote={acceptedQuote} />
      )}

      {!acceptedQuote && pendingQuote && (
        <PendingQuoteCard
          quote={pendingQuote}
          youCanAct={!!youCanAct}
          youProposedLast={!!youProposedLast}
          onAccept={onAccept ? () => onAccept(pendingQuote.id) : undefined}
          onReject={onReject ? () => onReject(pendingQuote.id) : undefined}
        />
      )}

      {!acceptedQuote && quotes.length === 0 && (
        <div className="rounded-xl border border-dashed border-sage-deep/15 bg-cream/55 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-bark">
            No quote sent yet.
          </p>
          <p className="mt-1 text-sm text-bark/70">
            {role === "driver"
              ? "Propose a rate to start the conversation."
              : "Wait for the driver to send a quote, or propose your own."}
          </p>
        </div>
      )}

      {!acceptedQuote && onPropose && (
        <QuoteProposeForm
          previousQuoteId={pendingQuote?.id}
          previousAmount={pendingQuote?.amount}
          isCounter={!!pendingQuote && !youProposedLast}
          onPropose={onPropose}
        />
      )}

      {quotes.length > 1 && (
        <QuoteHistorySection quotes={quotes} />
      )}
    </div>
  );
}

function AcceptedQuoteCard({ quote }: { quote: TransportQuote }) {
  const basisLabel =
    quote.basis === "per_head"
      ? "per head"
      : quote.basis === "per_km"
        ? "per km"
        : "flat";
  return (
    <section className="rounded-xl border border-match/25 bg-match-light/55 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sage-deep">
          <CheckCircle className="h-5 w-5 text-match" aria-hidden />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Rate accepted
          </h3>
        </div>
        <StatusBadge tone="success">Locked in</StatusBadge>
      </div>
      <p className="text-2xl font-bold text-sage-deep">
        ${quote.amount.toFixed(2)} {quote.currency}{" "}
        <span className="text-base font-semibold text-bark/70">
          {basisLabel}
        </span>
      </p>
      <p className="mt-1 text-xs text-bark/65">{quote.paymentTerms}</p>
      {quote.acceptedAt && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone">
          Accepted {quote.acceptedAt}
        </p>
      )}
    </section>
  );
}

function PendingQuoteCard({
  quote,
  youCanAct,
  youProposedLast,
  onAccept,
  onReject,
}: {
  quote: TransportQuote;
  youCanAct: boolean;
  youProposedLast: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const basisLabel =
    quote.basis === "per_head"
      ? "per head"
      : quote.basis === "per_km"
        ? "per km"
        : "flat";
  return (
    <section className="rounded-xl border border-sage-deep/15 bg-warm-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-stone">
          {quote.proposedBy === "driver" ? "Driver proposed" : "Farmer A proposed"}{" "}
          &middot; {quote.at}
        </p>
        <StatusBadge tone="info">
          {youProposedLast ? "Awaiting other party" : "Awaiting you"}
        </StatusBadge>
      </div>
      <p className="text-2xl font-bold text-sage-deep">
        ${quote.amount.toFixed(2)} {quote.currency}{" "}
        <span className="text-base font-semibold text-bark/70">
          {basisLabel}
        </span>
      </p>
      <p className="mt-1 text-xs text-bark/65">{quote.paymentTerms}</p>
      {quote.note && (
        <p className="mt-3 rounded-lg border border-mist bg-cream/60 px-3 py-2 text-sm text-bark/75">
          {quote.note}
        </p>
      )}
      {youCanAct && (onAccept || onReject) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-mist pt-4">
          {onAccept && (
            <Button type="button" onClick={onAccept}>
              <Check className="h-4 w-4" aria-hidden />
              Accept rate
            </Button>
          )}
          {onReject && (
            <Button
              type="button"
              variant="ghost"
              onClick={onReject}
              className="text-terra hover:bg-terra-light/60"
            >
              <Ban className="h-4 w-4" aria-hidden />
              Reject
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Negotiation history with collapse-on-long-chains. Per BUILD_03's open
 * question about long quote chains: when there are 3+ counters we render
 * the most recent two and tuck the rest behind a "Show earlier" toggle.
 */
function QuoteHistorySection({ quotes }: { quotes: TransportQuote[] }) {
  const [expanded, setExpanded] = useState(false);
  const reversed = quotes.slice().reverse();
  const collapseThreshold = 2;
  const shouldCollapse = reversed.length > collapseThreshold + 1;
  const head = shouldCollapse && !expanded ? reversed.slice(0, collapseThreshold) : reversed;
  const tail = shouldCollapse && !expanded ? reversed.slice(collapseThreshold) : [];

  return (
    <section>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
        Negotiation history
      </h4>
      <ol className="space-y-2">
        {head.map((quote) => (
          <QuoteHistoryRow key={quote.id} quote={quote} />
        ))}
        {tail.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-mist bg-warm-white px-3 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              Show {tail.length} earlier counter{tail.length === 1 ? "" : "s"}
            </button>
          </li>
        )}
      </ol>
    </section>
  );
}

function QuoteHistoryRow({ quote }: { quote: TransportQuote }) {
  const basisLabel =
    quote.basis === "per_head"
      ? "/ head"
      : quote.basis === "per_km"
        ? "/ km"
        : "flat";
  const tone: "success" | "warning" | "info" | "neutral" =
    quote.status === "accepted"
      ? "success"
      : quote.status === "rejected"
        ? "warning"
        : quote.status === "countered"
          ? "neutral"
          : "info";
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mist bg-warm-white px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-semibold text-bark">
          ${quote.amount.toFixed(2)} {quote.currency} {basisLabel}
        </p>
        <p className="text-xs text-bark/65">
          {quote.proposedBy === "driver" ? "Driver" : "Farmer A"} &middot;{" "}
          {quote.at}
        </p>
      </div>
      <StatusBadge tone={tone}>{quote.status}</StatusBadge>
    </li>
  );
}

function QuoteProposeForm({
  previousQuoteId,
  previousAmount,
  isCounter,
  onPropose,
}: {
  previousQuoteId?: string;
  previousAmount?: number;
  isCounter: boolean;
  onPropose: (draft: TransportQuoteDraft) => void;
}) {
  const [basis, setBasis] = useState<TransportQuoteBasis>("per_head");
  const [amount, setAmount] = useState<string>(
    previousAmount ? previousAmount.toFixed(2) : ""
  );
  const [paymentTerms, setPaymentTerms] = useState("Net 14 after delivery");
  const [note, setNote] = useState("");

  const parsed = Number.parseFloat(amount);
  const canSubmit = Number.isFinite(parsed) && parsed > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onPropose({
      basis,
      amount: parsed,
      currency: "AUD",
      paymentTerms: paymentTerms.trim() || "Net 14 after delivery",
      note: note.trim() ? note.trim() : undefined,
      previousQuoteId,
    });
    setNote("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-sage-deep/10 bg-cream/60 p-4"
    >
      <h4 className="text-sm font-bold uppercase tracking-wide text-stone">
        {isCounter ? "Counter offer" : "Propose a rate"}
      </h4>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Rate basis
        </p>
        <div role="radiogroup" aria-label="Rate basis" className="flex flex-wrap gap-2">
          {(
            [
              { id: "per_head", label: "Per head" },
              { id: "per_km", label: "Per km" },
              { id: "flat", label: "Flat" },
            ] as { id: TransportQuoteBasis; label: string }[]
          ).map((option) => (
            <SelectablePill
              key={option.id}
              selected={basis === option.id}
              onClick={() => setBasis(option.id)}
            >
              {option.label}
            </SelectablePill>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-stone">
            Amount (AUD)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
            placeholder="8.50"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-stone">
            Payment terms
          </span>
          <input
            type="text"
            value={paymentTerms}
            onChange={(event) => setPaymentTerms(event.target.value)}
            maxLength={80}
            className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
            placeholder="Net 14 after delivery"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-stone">
          Note (optional)
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={280}
          className="mt-1 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 py-3 text-base text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
          placeholder="Fuel surcharge included; expects Friday loading."
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          {isCounter ? "Send counter" : "Send quote"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
}
