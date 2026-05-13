"use client";

import { useEffect, useRef } from "react";
import {
  FileText,
  Image as ImageIcon,
  Map as MapIcon,
  MessageSquare,
  X,
} from "lucide-react";
import type {
  AgreementArtefact,
  AgreementSection,
} from "@/lib/dummyData";

const kindIcons = {
  photo: ImageIcon,
  document: FileText,
  map: MapIcon,
};

const kindLabels = {
  photo: "Photo",
  document: "Document",
  map: "Map",
};

const kindPreviewHints = {
  photo: "Real photo upload lands here when artefact uploads are wired.",
  document:
    "Real document preview lands here when artefact uploads are wired.",
  map: "Real interactive map lands here when paddock boundaries are wired.",
};

const focusableSelector =
  'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

type ArtefactViewerProps = {
  artefact: AgreementArtefact | null;
  sections: AgreementSection[];
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
};

export function ArtefactViewer({
  artefact,
  sections,
  onClose,
  onSelectSection,
}: ArtefactViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const open = artefact !== null;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!artefact) return null;

  const Icon = kindIcons[artefact.kind];
  const kindLabel = kindLabels[artefact.kind];
  const uploader = artefact.uploadedBy === "farmerA" ? "Farmer A" : "Farmer B";
  const linkedSection = artefact.sectionId
    ? sections.find((section) => section.id === artefact.sectionId)
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="artefact-viewer-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Shared artefact &middot; {kindLabel}
            </p>
            <h2
              id="artefact-viewer-title"
              className="mt-1 text-xl font-bold text-sage-deep"
            >
              {artefact.label}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              {artefact.description}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close artefact viewer"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sage/35 bg-sage-mist px-4 py-10 text-center">
            <Icon className="h-12 w-12 text-sage-deep" aria-hidden />
            <p className="font-semibold text-sage-deep">{kindLabel} preview</p>
            <p className="max-w-sm text-sm text-bark/70">
              {kindPreviewHints[artefact.kind]}
            </p>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetaRow label="Uploaded by" value={uploader} />
            <MetaRow label="Type" value={kindLabel} />
          </dl>
        </div>

        {linkedSection && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sage-deep/15 bg-cream/45 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-stone">
                Discussed in
              </p>
              <p className="mt-0.5 truncate font-semibold text-bark">
                {linkedSection.label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectSection(linkedSection.id);
                onClose();
              }}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Open in chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-mist bg-cream/50 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-stone">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-bark">{value}</dd>
    </div>
  );
}
