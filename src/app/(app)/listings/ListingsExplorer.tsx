"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MapPinned, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { SelectablePill } from "@/components/SelectablePill";
import {
  livestockRequests,
  paddockListings,
  type PaddockListing,
} from "@/lib/dummyData";

type ListingFilter =
  | "all"
  | "cattle"
  | "sheep"
  | "permanent-water"
  | "verified"
  | "preferred-region"
  | "strong-feed";

type ScoredListing = {
  listing: PaddockListing;
  score: number;
  reasons: string[];
};

const filters: Array<{ label: string; value: ListingFilter }> = [
  { label: "All", value: "all" },
  { label: "Cattle", value: "cattle" },
  { label: "Sheep", value: "sheep" },
  { label: "Permanent water", value: "permanent-water" },
  { label: "Verified", value: "verified" },
  { label: "Preferred region", value: "preferred-region" },
  { label: "Strong feed", value: "strong-feed" },
];

const locationMaps: Record<string, string> = {
  "paddock-glenbarra": "/location-maps/gundagai.png",
  "paddock-wattle-creek": "/location-maps/cowra.png",
  "paddock-hillview": "/location-maps/gippsland.png",
};

export function ListingsExplorer() {
  const request = livestockRequests[0];
  const [activeFilter, setActiveFilter] = useState<ListingFilter>("all");

  const scoredListings = useMemo(() => {
    return paddockListings
      .map((listing) => scoreListing(listing, request))
      .filter(({ listing }) => filterListing(listing, activeFilter))
      .sort((a, b) => b.score - a.score);
  }, [activeFilter, request]);

  const best = scoredListings[0];
  const verifiedCount = scoredListings.filter(
    ({ listing }) => listing.verificationStatus === "Verified provider"
  ).length;

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-mist bg-cream px-2 py-1.5 shadow-sm shadow-bark/5">
        <div className="grid gap-2 sm:grid-cols-3">
          <MatchSnapshotItem
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Top fit"
            value={best ? `${best.score}%` : "-"}
            detail={best?.listing.title ?? "No match"}
          />
          <MatchSnapshotItem
            icon={<MapPinned className="h-5 w-5" />}
            label="Shown"
            value={`${scoredListings.length}`}
            detail="paddocks"
          />
          <MatchSnapshotItem
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Verified"
            value={`${verifiedCount}`}
            detail="providers"
          />
        </div>
      </section>

      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-bark/85">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Refine results
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <SelectablePill
              key={filter.value}
              selected={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </SelectablePill>
          ))}
        </div>
      </div>

      {scoredListings.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scoredListings.map((match) => (
            <ListingCard
              key={match.listing.id}
              listing={match.listing}
              matchScore={match.score}
              matchReasons={match.reasons}
              mapImageSrc={locationMaps[match.listing.id]}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-mist bg-cream px-5 py-8 text-center">
          <p className="font-bold text-sage-deep">No paddocks match that filter.</p>
          <p className="mt-1 text-sm font-medium text-bark/80">
            Clear the filter to compare all available options.
          </p>
        </div>
      )}
    </div>
  );
}

function MatchSnapshotItem({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sage-mist text-sage-deep">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-bark/70">
          {label}
        </p>
        <div className="flex min-w-0 items-baseline gap-2">
          <p className="text-lg font-extrabold text-sage-deep">{value}</p>
          <p className="truncate text-sm font-semibold text-bark/85">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function scoreListing(
  listing: PaddockListing,
  request: typeof livestockRequests[number]
): ScoredListing {
  const reasons: string[] = [];
  let score = 12;

  if (listing.suitableLivestock.includes(request.stockType)) {
    score += 30;
    reasons.push(request.stockType);
  }

  if (request.preferredRegions.includes(listing.region)) {
    score += 22;
    reasons.push("Region");
  }

  if (listing.waterStatus === "Permanent") {
    score += 14;
    reasons.push("Water");
  }

  if (listing.verificationStatus === "Verified provider") {
    score += 12;
    reasons.push("Verified");
  }

  if (listing.feedStatus === "Excellent") {
    score += 10;
    reasons.push("Feed");
  } else if (listing.feedStatus === "Good") {
    score += 6;
    reasons.push("Feed");
  }

  if (listing.fencingStatus === "Secure") {
    score += 8;
    reasons.push("Fencing");
  }

  return {
    listing,
    score: Math.min(score, 98),
    reasons: reasons.slice(0, 3),
  };
}

function filterListing(listing: PaddockListing, filter: ListingFilter) {
  if (filter === "all") return true;
  if (filter === "cattle") return listing.suitableLivestock.includes("Cattle");
  if (filter === "sheep") return listing.suitableLivestock.includes("Sheep");
  if (filter === "permanent-water") return listing.waterStatus === "Permanent";
  if (filter === "verified") return listing.verificationStatus === "Verified provider";
  if (filter === "preferred-region") {
    return livestockRequests[0].preferredRegions.includes(listing.region);
  }
  return listing.feedStatus === "Excellent";
}
