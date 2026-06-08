"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  FileText,
  HelpCircle,
  Lock,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";

type RequirementKind = "text" | "upload";

type Requirement = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  kind: RequirementKind;
  privacy: "Private" | "Shared when needed" | "Shared with carrier";
  required?: boolean;
};

const requirements: Requirement[] = [
  {
    id: "pic",
    title: "Property Identification Code (PIC)",
    summary: "The property traceability code for where livestock are kept.",
    detail:
      "A PIC identifies a livestock property for traceability and disease response. It is commonly needed before stock can move on or off a property, including agistment.",
    kind: "text",
    privacy: "Shared when needed",
    required: true,
  },
  {
    id: "lpa",
    title: "LPA accreditation",
    summary: "Confirms access to LPA NVD/eNVD movement documents.",
    detail:
      "Livestock Production Assurance supports food safety, animal welfare, and biosecurity declarations. LPA accreditation is usually needed to complete NVD/eNVD paperwork.",
    kind: "upload",
    privacy: "Private",
    required: true,
  },
  {
    id: "nlis",
    title: "NLIS transfer readiness",
    summary: "Animal IDs/RFIDs and movement transfer details.",
    detail:
      "NLIS records livestock movements between PICs. Keep animal IDs, origin PIC, destination PIC, movement date, and NVD serial details ready.",
    kind: "upload",
    privacy: "Shared when needed",
    required: true,
  },
  {
    id: "nvd",
    title: "NVD / eNVD",
    summary: "Movement declaration and waybill information.",
    detail:
      "NVD/eNVD paperwork communicates food safety and treatment status as livestock move through the supply chain.",
    kind: "upload",
    privacy: "Shared when needed",
    required: true,
  },
  {
    id: "health",
    title: "Animal health declarations",
    summary: "Health status documents for cattle, sheep, or goats.",
    detail:
      "Health declarations help hosts, buyers, and transporters understand disease risk and animal health status. Requirements can vary by state and movement type.",
    kind: "upload",
    privacy: "Shared when needed",
  },
  {
    id: "vaccines",
    title: "Vaccination and treatment records",
    summary: "Vaccines, drenches, treatments, and withholding periods.",
    detail:
      "Keep records for treatments, vaccines, drenches, chemical use, and withholding periods so counterparties can assess suitability and food safety risk.",
    kind: "upload",
    privacy: "Private",
    required: true,
  },
  {
    id: "fit-to-load",
    title: "Fit-to-load checklist",
    summary: "Animal welfare check before transport.",
    detail:
      "Before transport, livestock should be assessed as fit to load. This helps reduce welfare risk and supports transport standards compliance.",
    kind: "upload",
    privacy: "Shared with carrier",
    required: true,
  },
  {
    id: "biosecurity",
    title: "Biosecurity plan",
    summary: "Property practices for reducing disease and pest spread.",
    detail:
      "A biosecurity plan records how the property manages livestock entry, visitors, vehicles, equipment, isolation, and disease risk.",
    kind: "upload",
    privacy: "Private",
  },
  {
    id: "insurance",
    title: "Insurance and liability",
    summary: "Relevant insurance documents for agistment or transport.",
    detail:
      "Insurance details help clarify responsibility if livestock, property, people, or transport are affected during an agistment or movement.",
    kind: "upload",
    privacy: "Private",
  },
  {
    id: "agreement",
    title: "Agistment agreement terms",
    summary: "Signed terms covering access, fees, care, and termination.",
    detail:
      "An agistment agreement should capture parties, livestock details, property access, fees, responsibilities, movement conditions, insurance, termination, and dispute handling.",
    kind: "upload",
    privacy: "Shared when needed",
  },
];

type SavedState = {
  textValues: Record<string, string>;
  fileNames: Record<string, string>;
};

const storageKey = "paddockme.compliance_readiness.v1";

export function ComplianceReadinessPanel() {
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<SavedState>;
      setTextValues(saved.textValues ?? {});
      setFileNames(saved.fileNames ?? {});
    } catch {
      // Local-only progress should never block the dashboard.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ textValues, fileNames })
      );
    } catch {
      // Ignore private browsing or storage limits.
    }
  }, [textValues, fileNames]);

  const completedCount = useMemo(
    () =>
      requirements.filter((item) =>
        item.kind === "text"
          ? Boolean(textValues[item.id]?.trim())
          : Boolean(fileNames[item.id])
      ).length,
    [fileNames, textValues]
  );

  return (
    <section
      id="readiness-documents"
      aria-label="Livestock readiness"
      className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-3 sm:p-4"
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls="readiness-document-grid"
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-all duration-200 ease-in-out hover:bg-sage-mist/35 hover:shadow-sm hover:shadow-sage-deep/10 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-mist text-sage-deep transition-all duration-200 ease-in-out">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-sage-deep">
            Documents
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-bark/70">
            PIC, NVD/eNVD, health records, biosecurity, fit-to-load and
            agistment paperwork. Private by default.
          </span>
        </span>
        <span className="hidden shrink-0 rounded-xl border border-mist bg-warm-white px-3 py-2 text-sm font-bold text-sage-deep sm:block">
          {completedCount} / {requirements.length} saved
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-sage-deep transition-transform duration-200 ease-in-out",
            expanded && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {expanded && (
      <div
        id="readiness-document-grid"
        className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {requirements.map((item) => {
          const complete =
            item.kind === "text"
              ? Boolean(textValues[item.id]?.trim())
              : Boolean(fileNames[item.id]);
          const isOpen = openId === item.id;
          return (
            <Card
              key={item.id}
              className={cn(
                "flex min-h-[10.75rem] flex-col gap-2 p-3",
                "hover:border-sage/40 hover:bg-cream/90 hover:shadow-[0_12px_30px_rgba(63,51,40,0.09)]",
                complete && "border-sage/35 bg-sage-mist/25"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    complete
                      ? "bg-sage-deep text-cream"
                      : "bg-sage-mist text-sage-deep"
                  )}
                >
                  {complete ? (
                    <BadgeCheck className="h-4 w-4" aria-hidden />
                  ) : (
                    <FileText className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="text-[0.82rem] font-bold leading-snug text-sage-deep">
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-label={`More information about ${item.title}`}
                      title={`More information about ${item.title}`}
                      className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-sage-deep transition-all duration-200 ease-in-out hover:bg-sage-mist active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                    >
                      <HelpCircle className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs leading-snug text-bark/70">
                    {item.summary}
                  </p>
                </div>
              </div>

              {isOpen && (
                <p className="rounded-xl border border-sage-deep/10 bg-warm-white px-3 py-2 text-xs leading-relaxed text-bark/75">
                  {item.detail}
                </p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-1.5">
                <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-warm-white px-2 text-[0.68rem] font-bold text-bark/65">
                  <Lock className="h-3 w-3" aria-hidden />
                  {item.privacy}
                </span>
                {item.required && (
                  <span className="inline-flex min-h-6 items-center rounded-full bg-ochre-light px-2 text-[0.68rem] font-bold text-sage-deep">
                    Required
                  </span>
                )}
              </div>

              {item.kind === "text" ? (
                <label className="block">
                  <span className="sr-only">{item.title}</span>
                  <input
                    value={textValues[item.id] ?? ""}
                    onChange={(event) =>
                      setTextValues((current) => ({
                        ...current,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Enter PIC"
                    className="min-h-10 w-full rounded-[8px] border border-mist bg-warm-white px-3 text-sm font-semibold text-bark outline-none transition-all duration-200 ease-in-out placeholder:text-bark/45 hover:border-sage/40 focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </label>
              ) : (
                <div>
                  <input
                    ref={(node) => {
                      inputRefs.current[item.id] = node;
                    }}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setFileNames((current) => ({
                        ...current,
                        [item.id]: file.name,
                      }));
                    }}
                  />
                  <Button
                    type="button"
                    variant={complete ? "secondary" : "primary"}
                    onClick={() => inputRefs.current[item.id]?.click()}
                    className="min-h-10 w-full px-3 text-sm"
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {complete ? "Replace file" : "Upload"}
                  </Button>
                  {fileNames[item.id] && (
                    <p className="mt-2 truncate text-xs font-semibold text-bark/65">
                      {fileNames[item.id]}
                    </p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      )}
    </section>
  );
}
