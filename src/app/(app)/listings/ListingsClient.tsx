"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { useFlash } from "@/components/FlashProvider";
import { ListingCard } from "@/components/ListingCard";
import { SelectablePill } from "@/components/SelectablePill";
import { getListingMapImageSrc } from "@/lib/listingMapImages";
import { cn } from "@/lib/utils";
import type { PaddockListing } from "@/lib/dummyData";
import { listPaddockListings } from "@/lib/data/repositories";

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
}: {
  listings: PaddockListing[];
  initialFilters?: InitialFilters;
}) {
  const flash = useFlash();
  const [allListings, setAllListings] = useState(listings);
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...emptyFilters,
    ...initialFilters,
  }));

  useEffect(() => {
    void listPaddockListings().then(setAllListings);
    const sync = () => void listPaddockListings().then(setAllListings);
    window.addEventListener("paddockme:prototype-change", sync);
    return () => window.removeEventListener("paddockme:prototype-change", sync);
  }, []);

  const filtered = useMemo(
    () => allListings.filter((listing) => matchesFilters(listing, filters)),
    [allListings, filters]
  );

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

  return (
    <>
      <section
        aria-label="Filter paddocks"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Filter className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Filter paddocks
            </h2>
          </div>
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
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
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
      </section>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              mapImageSrc={getListingMapImageSrc(listing.id)}
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
