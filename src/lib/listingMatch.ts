import type { LivestockRequest, PaddockListing } from "@/lib/dummyData";

export type ListingMatch = {
  score: number;
  reasons: string[];
};

const REGION_WEIGHT = 50;
const STOCK_WEIGHT = 30;
const FEED_WEIGHT = 10;
const WATER_WEIGHT = 10;

/**
 * Compute a 0-100 fit score for a paddock listing against a livestock owner's
 * active request. Surface the reasons that drove the score so cards can
 * explain themselves rather than showing a black-box number.
 *
 * Weights are deliberately readable - region match dominates because moving
 * stock between regions is the most expensive miss. Feed/water are small
 * confidence boosts on top.
 */
export function scoreListing(
  listing: PaddockListing,
  request: LivestockRequest
): ListingMatch {
  let score = 0;
  const reasons: string[] = [];

  if (request.preferredRegions.includes(listing.regionLabel)) {
    score += REGION_WEIGHT;
    reasons.push(`${listing.regionLabel} matches your regions`);
  }

  if (
    listing.suitableLivestock
      .map((s) => s.toLowerCase())
      .includes(request.stockType.toLowerCase())
  ) {
    score += STOCK_WEIGHT;
    reasons.push(`Set up for ${request.stockType.toLowerCase()}`);
  }

  if (listing.feedStatus === "Excellent" || listing.feedStatus === "Good") {
    score += FEED_WEIGHT;
    reasons.push(`Feed: ${listing.feedStatus.toLowerCase()}`);
  }

  if (listing.waterStatus === "Permanent") {
    score += WATER_WEIGHT;
    reasons.push("Permanent water");
  }

  return { score, reasons };
}
