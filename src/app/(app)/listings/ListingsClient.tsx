"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { useFlash } from "@/components/FlashProvider";
import { ListingCard } from "@/components/ListingCard";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { SelectablePill } from "@/components/SelectablePill";
import { getListingMapImageSrc } from "@/lib/listingMapImages";
import { scoreListing } from "@/lib/listingMatch";
import { cn } from "@/lib/utils";
import {
  livestockRequests,
  type LivestockRequest,
  type PaddockListing,
} from "@/lib/dummyData";
import {
  listPaddockListings,
  listSupabasePaddockListings,
} from "@/lib/data/repositories";

type FilterGroupKey =
  | "regions"
  | "stockTypes"
  | "feed"
  | "water"
  | "fencing";

type FilterState = {
  regions: string[];
  stockTypes: string[];
  feed: string[];
  water: string[];
  fencing: string[];
  verifiedOnly: boolean;
};

export type InitialFilters = Partial<FilterState>;

const emptyFilters: FilterState = {
  regions: [],
  stockTypes: [],
  feed: [],
  water: [],
  fencing: [],
  verifiedOnly: false,
};

const filterGroups: {
  key: FilterGroupKey;
  label: string;
  getOptions: (listings: PaddockListing[]) => string[];
}[] = [
  {
    key: "regions",
    label: "Region",
    getOptions: (listings) =>
      uniqueSorted(listings.map((listing) => listing.regionLabel)),
  },
  {
    key: "stockTypes",
    label: "Suitable stock",
    getOptions: (listings) =>
      uniqueSorted(listings.flatMap((listing) => listing.suitableLivestock)),
  },
  {
    key: "feed",
    label: "Feed",
    getOptions: (listings) =>
      uniqueSorted(listings.map((listing) => listing.feedStatus)),
  },
  {
    key: "water",
    label: "Water",
    getOptions: (listings) =>
      uniqueSorted(listings.map((listing) => listing.waterStatus)),
  },
  {
    key: "fencing",
    label: "Fencing",
    getOptions: (listings) =>
      uniqueSorted(listings.map((listing) => listing.fencingStatus)),
  },
];

export function ListingsClient({
  listings,
  initialFilters,
  realAccount = false,
}: {
  listings: PaddockListing[];
  initialFilters?: InitialFilters;
  /** When the page is rendered for a real signed-in account, the client
   * refresh must NOT merge prototype state - that would re-introduce the
   * Dale/Brett seed paddocks. Skip the prototype-change subscription and
   * use the strict Supabase-only fetcher. */
  realAccount?: boolean;
}) {
  const flash = useFlash();
  const [allListings, setAllListings] = useState(listings);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...emptyFilters,
    ...initialFilters,
  }));
  const [activeRequest, setActiveRequest] = useState<
    LivestockRequest | undefined
  >();

  useEffect(() => {
    if (realAccount) {
      void listSupabasePaddockListings().then(setAllListings);
      return;
    }
    void listPaddockListings().then(setAllListings);
    const sync = () => void listPaddockListings().then(setAllListings);
    window.addEventListener("paddockme:prototype-change", sync);
    return () => window.removeEventListener("paddockme:prototype-change", sync);
  }, [realAccount]);

  // Pick up the current persona's open request so the cards can score
  // themselves against it. Only the livestock owner has a request to match
  // against; landowners and drivers see the same cards without scores.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function read() {
      try {
        const personaId =
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona");
        if (!personaId) {
          setActiveRequest(undefined);
          return;
        }
        const request = livestockRequests.find(
          (r) => r.requesterId === personaId
        );
        setActiveRequest(request);
      } catch {
        setActiveRequest(undefined);
      }
    }
    read();
    window.addEventListener("paddockme:persona-change", read);
    return () =>
      window.removeEventListener("paddockme:persona-change", read);
  }, []);

  type Row = {
    listing: PaddockListing;
    match?: ReturnType<typeof scoreListing>;
  };
  const filtered = useMemo<Row[]>(() => {
    const matched = allListings.filter((listing) =>
      matchesFilters(listing, filters)
    );
    if (!activeRequest) return matched.map((listing) => ({ listing }));
    return matched
      .map((listing) => ({
        listing,
        match: scoreListing(listing, activeRequest),
      }))
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }, [allListings, filters, activeRequest]);

  const activeFilterCount =
    filters.regions.length +
    filters.stockTypes.length +
    filters.feed.length +
    filters.water.length +
    filters.fencing.length +
    (filters.verifiedOnly ? 1 : 0);

  function toggle(group: FilterGroupKey, value: string) {
    setFilters((current) => {
      const set = new Set(current[group]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, [group]: Array.from(set) };
    });
  }

  function toggleVerified() {
    setFilters((current) => ({
      ...current,
      verifiedOnly: !current.verifiedOnly,
    }));
  }

  function clearAll() {
    setFilters(emptyFilters);
    flash("Filters cleared.", "info");
  }

  function removeChip(group: FilterGroupKey | "verifiedOnly", value?: string) {
    if (group === "verifiedOnly") {
      setFilters((current) => ({ ...current, verifiedOnly: false }));
      return;
    }
    if (!value) return;
    setFilters((current) => ({
      ...current,
      [group]: current[group].filter((item) => item !== value),
    }));
  }

  type ActiveChip = {
    key: string;
    label: string;
    onRemove: () => void;
  };
  const activeChips: ActiveChip[] = [
    ...filterGroups.flatMap((group) =>
      filters[group.key].map((value) => ({
        key: `${group.key}:${value}`,
        label: value,
        onRemove: () => removeChip(group.key, value),
      }))
    ),
    ...(filters.verifiedOnly
      ? [
          {
            key: "verifiedOnly",
            label: "Verified providers only",
            onRemove: () => removeChip("verifiedOnly"),
          },
        ]
      : []),
  ];

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <PersonaIntroBanner page="listings" />
      <section
        aria-label="Filter paddocks"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-3 sm:p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="paddock-filter-groups"
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-sage-deep/20 bg-warm-white px-3.5 py-1.5 text-sm font-bold text-sage-deep transition hover:border-sage/60 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <Filter className="h-4 w-4" aria-hidden />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-deep px-1.5 text-[0.7rem] font-extrabold text-cream">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              aria-hidden
              className={cn(
                "h-4 w-4 shrink-0 transition",
                filtersOpen && "rotate-180"
              )}
            />
          </button>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-bark/70">
              {filtered.length} of {allListings.length} paddocks
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-mist bg-warm-white px-3 py-1 text-xs font-bold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear all
              </button>
            )}
          </div>
        </div>

        {activeChips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter ${chip.label}`}
                  className="inline-flex items-center gap-1 rounded-full bg-sage-mist px-2.5 py-1 text-xs font-bold text-sage-deep transition hover:bg-sage-mist/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  {chip.label}
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {filtersOpen && (
          <div
            id="paddock-filter-groups"
            className="mt-4 space-y-3 border-t border-sage-deep/10 pt-4"
          >
            {filterGroups.map((group) => {
              const options = group.getOptions(allListings);
              if (options.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-stone">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => (
                      <SelectablePill
                        key={option}
                        selected={filters[group.key].includes(option)}
                        onClick={() => toggle(group.key, option)}
                      >
                        {option}
                      </SelectablePill>
                    ))}
                  </div>
                </div>
              );
            })}
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-stone">
                Verification
              </p>
              <div className="flex flex-wrap gap-2">
                <SelectablePill
                  selected={filters.verifiedOnly}
                  onClick={toggleVerified}
                >
                  Verified providers only
                </SelectablePill>
              </div>
            </div>
          </div>
        )}
      </section>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ listing, match }) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              matchScore={match?.score}
              matchReasons={match?.reasons}
              mapImageSrc={listing.photos?.[0] ?? getListingMapImageSrc(listing.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onClear={clearAll} hasFilters={activeFilterCount > 0} />
      )}
    </>
  );
}

function EmptyState({
  onClear,
  hasFilters,
}: {
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-sage-deep/20 bg-cream/55 px-6 py-10 text-center"
      )}
    >
      <h2 className="text-lg font-bold text-sage-deep">
        No paddocks match these filters.
      </h2>
      <p className="mt-2 text-sm text-bark/70">
        Loosen a chip or two and try again. Filters AND across groups - so
        each pill you add narrows the shortlist further.
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear all filters
        </button>
      )}
    </div>
  );
}

function matchesFilters(
  listing: PaddockListing,
  filters: FilterState
): boolean {
  if (
    filters.regions.length > 0 &&
    !filters.regions.includes(listing.regionLabel)
  ) {
    return false;
  }
  if (
    filters.stockTypes.length > 0 &&
    !filters.stockTypes.some((type) => listing.suitableLivestock.includes(type))
  ) {
    return false;
  }
  if (
    filters.feed.length > 0 &&
    !filters.feed.includes(listing.feedStatus)
  ) {
    return false;
  }
  if (
    filters.water.length > 0 &&
    !filters.water.includes(listing.waterStatus)
  ) {
    return false;
  }
  if (
    filters.fencing.length > 0 &&
    !filters.fencing.includes(listing.fencingStatus)
  ) {
    return false;
  }
  if (
    filters.verifiedOnly &&
    listing.verificationStatus !== "Verified provider"
  ) {
    return false;
  }
  return true;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
