"use client";

import { useState } from "react";
import {
  Calendar,
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
  ArtefactViewer,
  type ViewableArtefact,
} from "@/components/ArtefactViewer";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { Timeline } from "@/components/Timeline";
import { cn } from "@/lib/utils";
import type {
  TransportArtefact,
  TransportJob,
  TransportRole,
  TransportSection,
  TransportSectionStatus,
} from "@/lib/dummyData";

type TransportPanelProps = {
  job: TransportJob;
  role: TransportRole;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
};

type TransportTab = "overview" | "coordination" | "artefacts" | "timeline";

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
}: TransportPanelProps) {
  const [activeTab, setActiveTab] = useState<TransportTab>("overview");
  const isDriver = role === "driver";

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
          {transportTabs.map((tab) => (
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
          <TransportOverview job={job} role={role} />
        )}

        {activeTab === "coordination" && (
          <CoordinationList
            sections={job.sections}
            role={role}
            activeSectionId={activeSectionId}
            onSelectSection={onSelectSection}
          />
        )}

        {activeTab === "artefacts" && (
          <TransportArtefactStrip
            artefacts={job.artefacts}
            sections={job.sections}
            onSelectSection={onSelectSection}
            activeSectionId={activeSectionId}
          />
        )}

        {activeTab === "timeline" && (
          <div className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
            <Timeline items={job.timeline} />
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
}: {
  job: TransportJob;
  role: TransportRole;
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
    </div>
  );
}

function CoordinationList({
  sections,
  role,
  activeSectionId,
  onSelectSection,
}: {
  sections: TransportSection[];
  role: TransportRole;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sage-deep/10 bg-cream/60 px-4 py-3">
        <h3 className="font-bold text-sage-deep">Movement steps</h3>
        <p className="mt-1 text-sm leading-relaxed text-bark/65">
          Tap a step to anchor the group chat. Confirmations show who&apos;s
          locked the step in.
        </p>
      </div>
      {sections.map((section) => (
        <CoordinationCard
          key={section.id}
          section={section}
          role={role}
          active={activeSectionId === section.id}
          onSelect={() => onSelectSection(section.id)}
        />
      ))}
    </div>
  );
}

function CoordinationCard({
  section,
  role,
  active,
  onSelect,
}: {
  section: TransportSection;
  role: TransportRole;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = sectionIcons[section.id] ?? Truck;
  const tone = sectionStatusTone[section.status];
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
          <StatusBadge tone={tone}>{section.status}</StatusBadge>
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
          confirmations={section.confirmations}
          role={role}
        />
      </div>
    </article>
  );
}

function ConfirmationsRow({
  confirmations,
  role,
}: {
  confirmations: TransportSection["confirmations"];
  role: TransportRole;
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
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            item.confirmed
              ? "border-match/25 bg-match-light text-match"
              : "border-mist bg-warm-white text-stone",
            item.key === role && "ring-2 ring-sage-deep/35"
          )}
        >
          {item.label}: {item.confirmed ? "Confirmed" : "Awaiting"}
        </span>
      ))}
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
}: {
  artefacts: TransportArtefact[];
  sections: TransportSection[];
  onSelectSection: (sectionId: string) => void;
  activeSectionId: string | null;
}) {
  const [activeArtefactId, setActiveArtefactId] = useState<string | null>(null);
  const activeArtefact =
    artefacts.find((artefact) => artefact.id === activeArtefactId) ?? null;
  const matchingCount = activeSectionId
    ? artefacts.filter((artefact) => artefact.sectionId === activeSectionId)
        .length
    : artefacts.length;
  const activeSectionLabel = activeSectionId
    ? sections.find((section) => section.id === activeSectionId)?.label
    : undefined;

  if (artefacts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-sage-deep/15 bg-cream/60 px-4 py-6 text-center text-sm text-bark/60">
        No transport artefacts attached yet.
      </p>
    );
  }

  const viewable: ViewableArtefact | null = activeArtefact
    ? {
        id: activeArtefact.id,
        label: activeArtefact.label,
        kind: activeArtefact.kind,
        description: activeArtefact.description,
        uploaderLabel: uploaderLabelFor(activeArtefact.uploadedBy, "Wayne"),
        sectionId: activeArtefact.sectionId,
      }
    : null;

  return (
    <section className="rounded-xl border border-sage-deep/10 bg-cream/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Transport artefacts
        </h3>
        <span className="text-xs text-bark/55">
          {activeSectionLabel
            ? `${matchingCount} for "${activeSectionLabel}"`
            : `${artefacts.length} item${artefacts.length === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {artefacts.map((artefact) => (
          <TransportArtefactCard
            key={artefact.id}
            artefact={artefact}
            onOpen={() => setActiveArtefactId(artefact.id)}
            dimmed={
              !!activeSectionId && artefact.sectionId !== activeSectionId
            }
          />
        ))}
      </div>
      <ArtefactViewer
        artefact={viewable}
        sections={sections.map((section) => ({
          id: section.id,
          label: section.label,
        }))}
        onClose={() => setActiveArtefactId(null)}
        onSelectSection={onSelectSection}
      />
    </section>
  );
}

function TransportArtefactCard({
  artefact,
  onOpen,
  dimmed,
}: {
  artefact: TransportArtefact;
  onOpen: () => void;
  dimmed?: boolean;
}) {
  const kindIcon = artefact.kind;
  const Icon =
    kindIcon === "photo"
      ? MapPin // photo placeholder uses map-pin to read as a location capture
      : kindIcon === "map"
        ? MapIcon
        : ClipboardList;
  const uploader = uploaderLabelFor(artefact.uploadedBy, "Wayne");

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
