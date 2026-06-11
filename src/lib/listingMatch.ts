import type { LivestockRequest, PaddockListing } from "@/lib/dummyData";

export type ListingMatch = {
  score: number;
  reasons: string[];
};

const LOCATION_WEIGHT = 50;
const STOCK_WEIGHT = 30;
const FEED_WEIGHT = 10;
const WATER_WEIGHT = 10;

/**
 * Compute a 0-100 fit score for a paddock listing against a livestock owner's
 * active request. Surface the reasons that drove the score so cards can
 * explain themselves rather than showing a black-box number.
 *
 * Weights are deliberately readable - location/distance dominates because
 * moving stock is the most expensive miss. Feed/water are small confidence
 * boosts on top.
 */
export function scoreListing(
  listing: PaddockListing,
  request: LivestockRequest
): ListingMatch {
  let score = 0;
  const reasons: string[] = [];

  const distanceKm =
    request.originLocation && listing.coordinates
      ? distanceInKm(request.originLocation, listing.coordinates)
      : null;
  if (distanceKm !== null) {
    if (distanceKm <= 150) {
      score += LOCATION_WEIGHT;
      reasons.push(`${Math.round(distanceKm)} km from pickup`);
    } else if (distanceKm <= 300) {
      score += 35;
      reasons.push(`${Math.round(distanceKm)} km from pickup`);
    }
  } else if (request.preferredRegions.includes(listing.regionLabel)) {
    score += LOCATION_WEIGHT;
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

function distanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
