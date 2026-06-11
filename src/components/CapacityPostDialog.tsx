"use client";

import { useEffect, useRef, useState } from "react";
import { Banknote, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/Button";
import {
  SearchablePicker,
  pickerGroupsFromRegions,
} from "@/components/SearchablePicker";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes as stockTypeOptions, type TransportQuoteBasis } from "@/lib/dummyData";
import { findRegion, regionsGroupedByState } from "@/lib/regions";

const regionPickerGroups = pickerGroupsFromRegions(regionsGroupedByState());

const focusableSelector =
  'button:not([disabled]), input, select, textarea, [href], [tabindex]:not([tabindex="-1"])';

export type CapacityDraft = {
  truckLabel: string | null;
  originRegion: string;
  destinationRegion: string;
  /** Human display, e.g. "Fri 22 May". */
  earliestDate: string;
  latestDate: string;
  /** ISO YYYY-MM-DD - used by /transport/available to expire past rows. */
  earliestDateIso: string;
  latestDateIso: string;
  headCapacity: number;
  stockTypes: string[];
  rateBasis: TransportQuoteBasis | null;
  rateAmount: number | null;
  notes: string | null;
};

type CapacityPostDialogProps = {
  open: boolean;
  driverLabel: string;
  onClose: () => void;
  onSubmit: (draft: CapacityDraft) => void;
};

const rateBasisOptions: { id: TransportQuoteBasis; label: string }[] = [
  { id: "per_head", label: "Per head" },
  { id: "per_km", label: "Per km" },
  { id: "flat", label: "Flat" },
];

export function CapacityPostDialog({
  open,
  driverLabel,
  onClose,
  onSubmit,
}: CapacityPostDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Region picker stores ids; we resolve them to canonical labels when
  // we hand the draft back to the parent for storage / display.
  const [originRegionId, setOriginRegionId] = useState<string | undefined>();
  const [destinationRegionId, setDestinationRegionId] = useState<
    string | undefined
  >();
  const originRegion = findRegion(originRegionId)?.label ?? null;
  const destinationRegion = findRegion(destinationRegionId)?.label ?? null;
  const [earliestDate, setEarliestDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [headCapacity, setHeadCapacity] = useState<string>("");
  const [stockTypes, setStockTypes] = useState<string[]>([]);
  const [truckLabel, setTruckLabel] = useState("");
  const [rateBasis, setRateBasis] = useState<TransportQuoteBasis | null>(
    "per_head"
  );
  const [rateAmount, setRateAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Reset on every open.
    setOriginRegionId(undefined);
    setDestinationRegionId(undefined);
    setEarliestDate("");
    setLatestDate("");
    setHeadCapacity("");
    setStockTypes([]);
    setTruckLabel("");
    setRateBasis("per_head");
    setRateAmount("");
    setNotes("");
    requestAnimationFrame(() => firstFieldRef.current?.focus());
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
  }, [open, onClose]);

  if (!open) return null;

  const parsedHead = Number.parseInt(headCapacity, 10);
  const parsedRate = rateAmount ? Number.parseFloat(rateAmount) : null;
  const datesValid =
    !!earliestDate &&
    !!latestDate &&
    new Date(latestDate) >= new Date(earliestDate);
  const canSubmit =
    !!originRegion &&
    !!destinationRegion &&
    originRegion !== destinationRegion &&
    datesValid &&
    Number.isFinite(parsedHead) &&
    parsedHead > 0 &&
    stockTypes.length > 0 &&
    (parsedRate === null || (Number.isFinite(parsedRate) && parsedRate >= 0));

  function toggleStock(type: string) {
    setStockTypes((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type]
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      truckLabel: truckLabel.trim() || null,
      originRegion: originRegion!,
      destinationRegion: destinationRegion!,
      earliestDate: formatDateDisplay(earliestDate),
      latestDate: formatDateDisplay(latestDate),
      earliestDateIso: earliestDate,
      latestDateIso: latestDate,
      headCapacity: parsedHead,
      stockTypes,
      rateBasis: parsedRate !== null ? rateBasis : null,
      rateAmount: parsedRate,
      notes: notes.trim() || null,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="capacity-post-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div
        ref={dialogRef}
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Share capacity &middot; {driverLabel}
            </p>
            <h2
              id="capacity-post-title"
              className="mt-1 text-xl font-bold text-sage-deep"
            >
              Publish available capacity
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-bark/70">
              Farmers browse posted runs on the same page. Skip the rate to
              show "Rate on enquiry" instead.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close post dialog"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5"
        >
          <SearchablePicker
            label="Origin region"
            placeholder="Where the stock is coming from…"
            searchPlaceholder="Search regions"
            value={originRegionId}
            onChange={(next) => {
              setOriginRegionId(next);
              if (next && next === destinationRegionId) {
                setDestinationRegionId(undefined);
              }
            }}
            groups={regionPickerGroups}
          />

          <SearchablePicker
            label="Destination region"
            placeholder="Where the stock is going…"
            searchPlaceholder="Search regions"
            value={destinationRegionId}
            onChange={(next) => {
              if (next && next === originRegionId) return;
              setDestinationRegionId(next);
            }}
            groups={regionPickerGroups}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone">
                Earliest date
              </span>
              <input
                ref={firstFieldRef}
                type="date"
                value={earliestDate}
                onChange={(event) => setEarliestDate(event.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone">
                Latest date
              </span>
              <input
                type="date"
                value={latestDate}
                onChange={(event) => setLatestDate(event.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone">
                Head capacity
              </span>
              <input
                type="number"
                min={1}
                value={headCapacity}
                onChange={(event) => setHeadCapacity(event.target.value)}
                required
                className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="56"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-stone">
                Truck label (optional)
              </span>
              <input
                type="text"
                value={truckLabel}
                onChange={(event) => setTruckLabel(event.target.value)}
                maxLength={60}
                className="mt-1 min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
                placeholder="B-double, double-deck"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
              Stock types you'll carry
            </p>
            <div className="flex flex-wrap gap-2">
              {stockTypeOptions.map((option) => (
                <SelectablePill
                  key={option}
                  selected={stockTypes.includes(option)}
                  onClick={() => toggleStock(option)}
                >
                  {option}
                </SelectablePill>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone">
              <Banknote className="h-3.5 w-3.5" aria-hidden />
              Indicative rate (optional)
            </p>
            <div className="mb-2 flex flex-wrap gap-2">
              {rateBasisOptions.map((option) => (
                <SelectablePill
                  key={option.id}
                  selected={rateBasis === option.id}
                  onClick={() => setRateBasis(option.id)}
                >
                  {option.label}
                </SelectablePill>
              ))}
            </div>
            <input
              type="number"
              min={0}
              step={0.01}
              value={rateAmount}
              onChange={(event) => setRateAmount(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 text-base font-semibold text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
              placeholder="8.50"
            />
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-stone">
              Notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              maxLength={280}
              className="mt-1 w-full rounded-xl border border-sage-deep/15 bg-warm-white px-4 py-3 text-base text-bark outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
              placeholder="Crate config locked, fuel surcharge included, call before loading..."
            />
          </label>

          <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-sage-deep/10 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              <UploadCloud className="h-4 w-4" aria-hidden />
              Publish run
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return isoDate;
  }
}
