"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Map as MapIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { SelectablePill } from "@/components/SelectablePill";
import { cn } from "@/lib/utils";

const focusableSelector =
  'button:not([disabled]), input, select, textarea, [href], [tabindex]:not([tabindex="-1"])';

export type ArtefactDraftKind = "photo" | "document" | "map";

export type ArtefactDraft = {
  label: string;
  description: string;
  kind: ArtefactDraftKind;
  sectionId?: string;
};

type SectionRef = {
  id: string;
  label: string;
};

type ArtefactUploadDialogProps = {
  open: boolean;
  /** Display label for the uploader. */
  uploaderLabel: string;
  sections: SectionRef[];
  /** Preselect a section when upload is launched from a specific agreement area. */
  initialSectionId?: string | null;
  /** Keep uploads attached to the launched section instead of offering "None". */
  requireSection?: boolean;
  onClose: () => void;
  onSubmit: (draft: ArtefactDraft) => void;
};

const kindOptions: { id: ArtefactDraftKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "photo", label: "Photo", icon: ImageIcon },
  { id: "document", label: "Document", icon: FileText },
  { id: "map", label: "Map", icon: MapIcon },
];

export function ArtefactUploadDialog({
  open,
  uploaderLabel,
  sections,
  initialSectionId = null,
  requireSection = false,
  onClose,
  onSubmit,
}: ArtefactUploadDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const labelInputRef = useRef<HTMLInputElement | null>(null);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ArtefactDraftKind>("document");
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    setLabel("");
    setDescription("");
    setKind("document");
    setSectionId(initialSectionId);
    // Focus the label input after a tick so the autoFocus doesn't fight
    // with the focus-trap setup below.
    requestAnimationFrame(() => labelInputRef.current?.focus());
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
      ).filter((el) => !el.hasAttribute("disabled"));
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
  }, [initialSectionId, open, onClose]);

  if (!open) return null;

  const trimmedLabel = label.trim();
  const trimmedDescription = description.trim();
  const canSubmit = trimmedLabel.length > 0 && trimmedDescription.length > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      label: trimmedLabel,
      description: trimmedDescription,
      kind,
      sectionId: (requireSection ? initialSectionId : sectionId) ?? undefined,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="artefact-upload-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Upload artefact &middot; {uploaderLabel}
            </p>
            <h2
              id="artefact-upload-title"
              className="mt-1 text-xl font-bold text-sage-deep"
            >
              Add a shared artefact
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              Add the document details to this workspace so both parties can
              see it in the relevant agreement section.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload dialog"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
        >
          <div>
            <label
              htmlFor="artefact-label"
              className="text-xs font-bold uppercase tracking-wide text-stone"
            >
              Label
            </label>
            <input
              id="artefact-label"
              ref={labelInputRef}
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              required
              maxLength={120}
              placeholder="e.g. NLIS records"
              className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
            />
          </div>

          <div>
            <label
              htmlFor="artefact-description"
              className="text-xs font-bold uppercase tracking-wide text-stone"
            >
              Description
            </label>
            <textarea
              id="artefact-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              maxLength={400}
              rows={3}
              placeholder="One-line context other parties will see in the strip."
              className="mt-1 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 py-3 text-base text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
              Kind
            </p>
            <div
              role="radiogroup"
              aria-label="Artefact kind"
              className="grid gap-2 sm:grid-cols-3"
            >
              {kindOptions.map((option) => {
                const Icon = option.icon;
                const active = option.id === kind;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setKind(option.id)}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                      active
                        ? "border-sage-deep bg-sage-deep text-cream"
                        : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {sections.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
                Discussed in (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {!requireSection && (
                  <SelectablePill
                    selected={sectionId === null}
                    onClick={() => setSectionId(null)}
                  >
                    None
                  </SelectablePill>
                )}
                {sections.map((section) => (
                  <SelectablePill
                    key={section.id}
                    selected={sectionId === section.id}
                    onClick={() => {
                      if (!requireSection) setSectionId(section.id);
                    }}
                  >
                    {section.label}
                  </SelectablePill>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-sage-deep/10 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <UploadCloud className="h-4 w-4" aria-hidden />
              Add artefact
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
