import { StatusBadge } from "@/components/StatusBadge";
import {
  paddockListings,
  regionalInsights,
  type PaddockListing,
} from "@/lib/dummyData";
import { getListingMapImageSrc } from "@/lib/listingMapImages";

type RegionRollup = {
  region: string;
  pressure: "Low" | "Medium" | "High";
  feed: string;
  availability: number;
  listings: number;
  verified: number;
  totalAcres: number;
  mapImageSrc?: string;
  mapPlaceLabel?: string;
  /** Whether this entry was derived from live listings (true) or the seed list (false). */
  fromListings: boolean;
};

const feedRank: Record<PaddockListing["feedStatus"], number> = {
  Excellent: 3,
  Good: 2,
  Tight: 1,
};

export function DummyMap() {
  const rollups = computeRegionRollups();
  const topAvailability = pickTop(rollups, "availability", "desc");
  const lowestFeed = pickTop(rollups, "availability", "asc");
  const mostVerified = rollups
    .filter((rollup) => rollup.verified > 0)
    .sort((a, b) => b.verified - a.verified)[0];

  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-mist bg-sage-mist p-5">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-[12%] top-[18%] h-28 w-40 rounded-full bg-match-light" />
          <div className="absolute right-[14%] top-[28%] h-32 w-52 rounded-full bg-amber-light" />
          <div className="absolute bottom-[16%] left-[28%] h-36 w-56 rounded-full bg-ochre-light" />
          <div className="absolute bottom-[26%] right-[26%] h-24 w-36 rounded-full bg-cream" />
        </div>
        <div className="relative flex h-full min-h-[380px] flex-col justify-between">
          <div>
            <StatusBadge tone="info">Regional intelligence placeholder</StatusBadge>
            <h2 className="mt-4 max-w-lg text-3xl font-bold text-sage-deep">
              Availability, feed status, and drought pressure by region.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bark/70">
              Headlines pulled from live listings where we have them; the
              rest fall back to the seeded outlook until more paddocks list.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MapStat
              label="High availability"
              value={topAvailability?.region ?? "-"}
            />
            <MapStat
              label="Feed pressure"
              value={lowestFeed?.region ?? "-"}
            />
            <MapStat
              label="Most verified"
              value={mostVerified ? `${mostVerified.region}` : "-"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rollups.map((rollup) => (
          <article
            key={rollup.region}
            className="overflow-hidden rounded-[8px] border border-mist bg-cream"
          >
            {rollup.mapImageSrc && (
              <div className="relative h-32 border-b border-mist bg-warm-white">
                <img
                  src={rollup.mapImageSrc}
                  alt={`${rollup.mapPlaceLabel ?? rollup.region} map`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-[8px] bg-cream/95 px-2.5 py-1 text-xs font-bold text-sage-deep shadow-sm">
                  {rollup.mapPlaceLabel ?? rollup.region}
                </span>
              </div>
            )}
            <div className="p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sage-deep">{rollup.region}</h3>
                <StatusBadge tone={pressureTone(rollup.pressure)}>
                  {rollup.pressure} pressure
                </StatusBadge>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-warm-white">
                <div
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${rollup.availability}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-bark/70">
                {rollup.availability}% indicative availability - feed is{" "}
                {rollup.feed.toLowerCase()}.
              </p>
              {rollup.fromListings ? (
                <p className="mt-1 text-xs text-stone">
                  {rollup.listings} listing
                  {rollup.listings === 1 ? "" : "s"} &middot; {rollup.totalAcres}{" "}
                  ac &middot; {rollup.verified} verified
                </p>
              ) : (
                <p className="mt-1 text-xs text-stone">
                  No live listings yet - showing seeded outlook.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function computeRegionRollups(): RegionRollup[] {
  const byRegion = new Map<string, PaddockListing[]>();
  for (const listing of paddockListings) {
    const key = listing.regionLabel;
    const bucket = byRegion.get(key) ?? [];
    bucket.push(listing);
    byRegion.set(key, bucket);
  }

  const seedRegions = new Set(regionalInsights.map((r) => r.region));
  const liveRegions = Array.from(byRegion.keys()).filter(
    (region) => !seedRegions.has(region)
  );
  const orderedRegions = [
    ...regionalInsights.map((r) => r.region),
    ...liveRegions,
  ];

  return orderedRegions.map((regionName) => {
    const listings = byRegion.get(regionName) ?? [];
    if (listings.length > 0) {
      const avgFeed =
        listings.reduce((sum, l) => sum + feedRank[l.feedStatus], 0) /
        listings.length;
      const availability = Math.round((avgFeed / 3) * 100);
      const verified = listings.filter(
        (l) => l.verificationStatus === "Verified provider"
      ).length;
      const totalAcres = listings.reduce((sum, l) => sum + l.acres, 0);
      const mapListing = listings.find((listing) =>
        getListingMapImageSrc(listing.id)
      );
      return {
        region: regionName,
        pressure: pressureFromAvailability(availability),
        feed: feedLabelFromAvg(avgFeed),
        availability,
        listings: listings.length,
        verified,
        totalAcres,
        mapImageSrc: mapListing ? getListingMapImageSrc(mapListing.id) : undefined,
        mapPlaceLabel: mapListing?.mapPlaceLabel,
        fromListings: true,
      };
    }
    const seed = regionalInsights.find((r) => r.region === regionName);
    return {
      region: regionName,
      pressure: (seed?.pressure as RegionRollup["pressure"]) ?? "Medium",
      feed: seed?.feed ?? "Unknown",
      availability: seed?.availability ?? 0,
      listings: 0,
      verified: 0,
      totalAcres: 0,
      fromListings: false,
    };
  });
}

function pressureFromAvailability(
  availability: number
): RegionRollup["pressure"] {
  if (availability >= 75) return "Low";
  if (availability >= 50) return "Medium";
  return "High";
}

function feedLabelFromAvg(avg: number): string {
  if (avg >= 2.5) return "Strong";
  if (avg >= 1.75) return "Good";
  if (avg >= 1.25) return "Patchy";
  return "Tight";
}

function pressureTone(
  pressure: RegionRollup["pressure"]
): "success" | "warning" | "neutral" {
  if (pressure === "Low") return "success";
  if (pressure === "High") return "warning";
  return "neutral";
}

function pickTop(
  rollups: RegionRollup[],
  key: "availability",
  order: "asc" | "desc"
): RegionRollup | undefined {
  const sorted = [...rollups].sort((a, b) =>
    order === "asc" ? a[key] - b[key] : b[key] - a[key]
  );
  return sorted[0];
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sage-glow bg-warm-white/80 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-1 font-semibold text-sage-deep">{value}</p>
    </div>
  );
}
