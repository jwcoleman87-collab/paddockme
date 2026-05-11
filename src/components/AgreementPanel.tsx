"use client";

import {
  AlertTriangle,
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
import { ButtonLink } from "@/components/Button";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  Agreement,
  AgreementArtefact,
  AgreementSection,
} from "@/lib/dummyData";

export type SectionAgreementState = {
  agreedByA: boolean;
  agreedByB: boolean;
};

type AgreementPanelProps = {
  agreement: Agreement;
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  sectionState: Record<string, SectionAgreementState>;
  onToggleAgreement: (sectionId: string, party: "A" | "B") => void;
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

export function AgreementPanel({
  agreement,
  activeSectionId,
  onSelectSection,
  sectionState,
  onToggleAgreement,
}: AgreementPanelProps) {
  const mutuallyAgreedCount = agreement.sections.reduce((count, section) => {
    const state = sectionState[section.id] ?? section;
    return state.agreedByA && state.agreedByB ? count + 1 : count;
  }, 0);

  return (
    <section className="space-y-5">
      {/* Header card */}
      <div className="rounded-xl border border-mist bg-cream">
        <div className="border-b border-mist px-5 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge tone="warning">
              Agreement status: {agreement.status}
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
          <p className="mt-1 text-sm text-bark/65">
            A shared artefact both farmers can review. Tap a section to anchor
            the chat, then mark each side&rsquo;s agreement when the wording
            holds up.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
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
            onSelect={() => onSelectSection(section.id)}
            onToggleA={() => onToggleAgreement(section.id, "A")}
            onToggleB={() => onToggleAgreement(section.id, "B")}
          />
        ))}
      </div>

      {/* Shared artefacts */}
      <ArtefactStrip artefacts={agreement.artefacts} />

      {/* Readiness checklist */}
      <section className="rounded-xl border border-mist bg-cream p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Livestock readiness checklist
        </h3>
        <div className="space-y-2">
          {agreement.readinessChecklist.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-mist bg-warm-white px-4 py-3"
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

      {/* Action buttons */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ButtonLink
          href={`/workspace/${agreement.id}`}
          variant="secondary"
        >
          Counter offer
        </ButtonLink>
        <ButtonLink
          href="/transport/transport-glenbarra"
          variant="secondary"
        >
          Open transport room
        </ButtonLink>
        <ButtonLink href="/agreements">Finalise agreement</ButtonLink>
      </div>
    </section>
  );
}

function SectionCard({
  section,
  active,
  state,
  onSelect,
  onToggleA,
  onToggleB,
}: {
  section: AgreementSection;
  active: boolean;
  state: SectionAgreementState;
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
        "overflow-hidden rounded-xl border bg-cream transition",
        active
          ? "border-sage-deep shadow-[0_0_0_4px_rgba(208,232,207,0.55)]"
          : "border-mist"
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
            onClick={onToggleA}
          />
          <PartyAgreeButton
            party="Farmer B"
            agreed={agreedByB}
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
  onClick,
}: {
  party: string;
  agreed: boolean;
  onClick: () => void;
}) {
  const Icon = agreed ? CheckCircle : Circle;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={agreed}
      className={cn(
        "inline-flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        agreed
          ? "border-match/30 bg-match-light text-match"
          : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
      )}
    >
      <span>
        {party}: {agreed ? "Agreed" : "Tap to agree"}
      </span>
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}

function ArtefactStrip({ artefacts }: { artefacts: AgreementArtefact[] }) {
  if (artefacts.length === 0) return null;
  return (
    <section className="rounded-xl border border-mist bg-cream p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Shared artefacts
        </h3>
        <span className="text-xs text-bark/55">
          {artefacts.length} item{artefacts.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {artefacts.map((artefact) => (
          <ArtefactCard key={artefact.id} artefact={artefact} />
        ))}
      </div>
    </section>
  );
}

function ArtefactCard({ artefact }: { artefact: AgreementArtefact }) {
  const Icon =
    artefact.kind === "photo"
      ? ImageIcon
      : artefact.kind === "map"
        ? MapIcon
        : FileText;
  const uploader =
    artefact.uploadedBy === "farmerA" ? "Farmer A" : "Farmer B";

  return (
    <article className="flex w-44 shrink-0 flex-col gap-2 rounded-xl border border-mist bg-warm-white p-3">
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
    </article>
  );
}
