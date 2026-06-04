"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export type PickerOption = {
  id: string;
  label: string;
};

export type PickerGroup = {
  /** Stable id (e.g. state code "NSW"). */
  id: string;
  /** Group header text in the popover. */
  label: string;
  options: PickerOption[];
};

type CommonProps = {
  /** Label rendered above the trigger button. */
  label: string;
  /** Placeholder shown inside the trigger when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the search input inside the popover. */
  searchPlaceholder?: string;
  /** Optional helper text rendered below the label. */
  helper?: string;
  /** Whole list of groups; the picker filters inside each group on search. */
  groups: PickerGroup[];
  /** Disable the trigger. */
  disabled?: boolean;
};

type SingleProps = CommonProps & {
  multi?: false;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

type MultiProps = CommonProps & {
  multi: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type SearchablePickerProps = SingleProps | MultiProps;

/**
 * Searchable, grouped picker. Single source of truth for "long list"
 * selectors like Region and Breed. Trigger button shows current
 * selection (or a count for multi-select); popover holds a search input
 * and a scrollable list of options grouped by state / family / etc.
 *
 * Same component covers single-select (commits + closes on tap) and
 * multi-select (chips with "Done" button at the bottom).
 *
 * Mobile sheet vs desktop popover: handled by max-width + max-height +
 * fixed positioning so it works on both without a separate breakpoint
 * stylesheet.
 */
export function SearchablePicker(props: SearchablePickerProps) {
  const {
    label,
    placeholder = "Choose...",
    searchPlaceholder = "Search",
    helper,
    groups,
    disabled = false,
  } = props;
  const multi = props.multi === true;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Smart-flip state: when there's more room above the trigger than
  // below (e.g. on iPad with the bottom nav covering 5-7vh of the
  // viewport) we render the popover upwards instead of letting it
  // disappear behind the nav. listMaxPx is the cap for the inner
  // scroll area so the user can always reach the Done button.
  const [flipUp, setFlipUp] = useState(false);
  const [listMaxPx, setListMaxPx] = useState<number>(320);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const popoverId = useId();

  const allOptions = useMemo(
    () => groups.flatMap((group) => group.options),
    [groups]
  );
  const optionById = useMemo(() => {
    const map = new Map<string, PickerOption>();
    for (const option of allOptions) map.set(option.id, option);
    return map;
  }, [allOptions]);

  const selectedIds = multi
    ? (props as MultiProps).value
    : (props as SingleProps).value
      ? [(props as SingleProps).value as string]
      : [];

  const selectedOptions = selectedIds
    .map((id) => optionById.get(id))
    .filter((option): option is PickerOption => !!option);

  const triggerLabel = useMemo(() => {
    if (selectedOptions.length === 0) return placeholder;
    if (!multi) return selectedOptions[0].label;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} selected`;
  }, [multi, placeholder, selectedOptions]);

  const filteredGroups = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) return groups;
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          option.label.toLowerCase().includes(normalised)
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }, []);

  // Measure the available space above and below the trigger so the
  // popover never runs off the visible viewport (BottomNav covers the
  // bottom ~5-7vh on iPad). Flip upwards when there's more room above.
  const updatePopoverPlacement = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // Use the visualViewport when available so the on-screen keyboard
    // and browser chrome are taken into account.
    const vh = (typeof window !== "undefined" && window.visualViewport?.height) || window.innerHeight;
    // Account for the AppShell bottom nav + safe-area inset on mobile.
    const bottomInset = 128;
    const topInset = 16;
    const margin = 12;
    const below = vh - rect.bottom - bottomInset - margin;
    const above = rect.top - topInset - margin;
    const shouldFlip = above > below && above > 200;
    setFlipUp(shouldFlip);
    // Reserve room for the popover header (search) and the optional
    // multi-select footer (~52px each). Cap the inner scroll area so
    // the user can always reach the Done button.
    const headerFooter = (multi ? 56 : 0) + 48 + 16;
    const usable = Math.max(180, (shouldFlip ? above : below) - headerFooter);
    setListMaxPx(Math.min(usable, 460));
  }, [multi]);

  // Close on Escape, click-outside; focus search; recompute placement
  // on open and on viewport changes.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    function onPointer(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    }
    updatePopoverPlacement();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", updatePopoverPlacement);
    window.visualViewport?.addEventListener("resize", updatePopoverPlacement);
    window.addEventListener("scroll", updatePopoverPlacement, true);
    queueMicrotask(() => searchRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", updatePopoverPlacement);
      window.visualViewport?.removeEventListener(
        "resize",
        updatePopoverPlacement
      );
      window.removeEventListener("scroll", updatePopoverPlacement, true);
    };
  }, [open, close]);

  function toggleOption(id: string) {
    if (multi) {
      const onChange = (props as MultiProps).onChange;
      const current = (props as MultiProps).value;
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      onChange(next);
      return;
    }
    (props as SingleProps).onChange(id);
    close();
  }

  function removeChip(id: string) {
    if (!multi) {
      (props as SingleProps).onChange(undefined);
      return;
    }
    const onChange = (props as MultiProps).onChange;
    const current = (props as MultiProps).value;
    onChange(current.filter((item) => item !== id));
  }

  return (
    <div className="relative w-full">
      <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
        {label}
      </span>
      {helper && (
        <p className="mt-1 text-xs font-medium text-bark/65">{helper}</p>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={popoverId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "mt-2 flex min-h-14 w-full items-center justify-between gap-3 rounded-[8px] border px-4 text-left text-base font-semibold shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] transition focus:border-sage focus:ring-2 focus:ring-sage/25",
          selectedOptions.length > 0
            ? "border-sage-deep/40 bg-white text-bark"
            : "border-stone/35 bg-white text-stone",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-5 w-5 shrink-0 text-stone transition",
            open && "rotate-180"
          )}
        />
      </button>

      {multi && selectedOptions.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => removeChip(option.id)}
                className="inline-flex items-center gap-1 rounded-full bg-sage-mist px-2.5 py-1 text-xs font-bold text-sage-deep transition hover:bg-sage-mist/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                {option.label}
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute left-0 right-0 z-30 overflow-hidden rounded-[10px] border border-sage-deep/15 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.18)]",
            flipUp ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="flex items-center gap-2 border-b border-mist bg-cream/55 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-stone" aria-hidden />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-bark outline-none placeholder:font-medium placeholder:text-stone/55"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="rounded-full p-0.5 text-stone transition hover:bg-mist hover:text-bark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: `${listMaxPx}px` }}
          >
            {filteredGroups.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm font-medium text-bark/70">
                No matches for &quot;{query}&quot;.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id}>
                  <div className="sticky top-0 z-10 bg-cream/95 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-bark/60 backdrop-blur">
                    {group.label}
                  </div>
                  <ul role="listbox" aria-label={group.label}>
                    {group.options.map((option) => {
                      const isSelected = selectedIds.includes(option.id);
                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => toggleOption(option.id)}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                              isSelected
                                ? "bg-sage-mist/55 font-bold text-sage-deep"
                                : "font-medium text-bark hover:bg-cream"
                            )}
                          >
                            <span className="truncate">{option.label}</span>
                            {isSelected && (
                              <Check
                                className="h-4 w-4 shrink-0 text-sage-deep"
                                aria-hidden
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          {multi && (
            <div className="flex items-center justify-between gap-3 border-t border-mist bg-cream/55 px-3 py-2.5">
              <span className="text-xs font-bold text-bark/65">
                {selectedIds.length} selected
              </span>
              <Button type="button" onClick={close} className="min-h-9 px-4 py-1.5 text-sm">
                Done
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Helper: turn the canonical region list into picker groups. */
export function pickerGroupsFromRegions<
  T extends { id: string; label: string; state: string }
>(
  groupedByState: { state: string; label: string; regions: T[] }[]
): PickerGroup[] {
  return groupedByState
    .filter((group) => group.regions.length > 0)
    .map((group) => ({
      id: group.state,
      label: group.label,
      options: group.regions.map((region) => ({
        id: region.id,
        label: region.label,
      })),
    }));
}
