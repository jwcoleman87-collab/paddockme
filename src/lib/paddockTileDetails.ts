import type { PaddockListing } from "@/lib/dummyData";

export type PaddockTileDetail = {
  headline: string;
  bullets: string[];
};

export type PaddockTileDetails = {
  feed: PaddockTileDetail;
  water: PaddockTileDetail;
  fencing: PaddockTileDetail;
  area: PaddockTileDetail;
};

/**
 * Derive plausible per-tile detail content from a listing's existing fields.
 * Prototype values - swap with real per-listing data once it lives in the
 * database. The bullet lists are written so they read like things a
 * landowner would genuinely jot down about their property.
 */
export function getPaddockTileDetails(
  listing: PaddockListing
): PaddockTileDetails {
  return {
    feed: deriveFeedDetail(listing),
    water: deriveWaterDetail(listing),
    fencing: deriveFencingDetail(listing),
    area: deriveAreaDetail(listing),
  };
}

function deriveFeedDetail(listing: PaddockListing): PaddockTileDetail {
  switch (listing.feedStatus) {
    case "Excellent":
      return {
        headline: "Strong improved pasture, ready to stock",
        bullets: [
          "Perennial rye / white clover mix across the river flats",
          "Lucerne stand (~14 ha) for finishing weaners",
          "Standing oats and forage rape available as winter feed",
          "Recent rain: 62 mm logged last month",
        ],
      };
    case "Good":
      return {
        headline: "Mixed native and improved pasture",
        bullets: [
          "Phalaris + sub-clover blend through the main paddocks",
          "Native kangaroo grass and wallaby grass on the ridges",
          "Light super dressing applied last autumn",
          "Some summer sorghum carried over for backgrounding",
        ],
      };
    case "Tight":
    default:
      return {
        headline: "Native pasture, supplement feed advised",
        bullets: [
          "Mostly native grasses, summer growth slowing",
          "Last decent rain 38 mm two months ago",
          "Hay shed on site - 80 round bales available at cost",
          "Suit short-term holding rather than finishing",
        ],
      };
  }
}

function deriveWaterDetail(listing: PaddockListing): PaddockTileDetail {
  switch (listing.waterStatus) {
    case "Permanent":
      return {
        headline: "Permanent and reticulated",
        bullets: [
          "3 dams (2 large, 1 small) all currently full",
          "Approx 1 km of river frontage with stock access",
          "Solar-pumped bore feeding 4 troughs",
          "Reticulation to every paddock with float valves",
        ],
      };
    case "Tank":
      return {
        headline: "Tank-fed troughs",
        bullets: [
          "30,000 L poly tank from shed roof catchment",
          "Trough on float in each of the main paddocks",
          "1 small dam, holds water April through October",
          "Top-up carting arranged with local contractor",
        ],
      };
    case "Seasonal":
    default:
      return {
        headline: "Seasonal supply - plan around summer",
        bullets: [
          "1 dam, fills reliably each winter",
          "Creek flows May to early November in most years",
          "No bore on site",
          "Carting may be required December to February",
        ],
      };
  }
}

function deriveFencingDetail(listing: PaddockListing): PaddockTileDetail {
  switch (listing.fencingStatus) {
    case "Secure":
      return {
        headline: "Secure boundary, ready for cattle and sheep",
        bullets: [
          "Boundary: 5-strand barbed with electric offset",
          "Internal: 4-wire fences with hinge-joint where sheep run",
          "All gates with chain + ratchet, no slacks",
          "Steel yards with crush and loading ramp (100 head)",
        ],
      };
    case "Good":
      return {
        headline: "Sound fencing, recently maintained",
        bullets: [
          "Boundary: 4-strand barbed, re-strained last spring",
          "Internal subdivisions mostly intact",
          "Timber yards in working order (60 head capacity)",
          "One length of mesh sheep fence under repair",
        ],
      };
    case "Needs inspection":
    default:
      return {
        headline: "Functional - walk the boundary first",
        bullets: [
          "Older 4-strand barbed boundary",
          "Internal divisions partly removed for cropping",
          "Yards usable but need maintenance",
          "Discuss any temporary electric setup before stocking",
        ],
      };
  }
}

function deriveAreaDetail(listing: PaddockListing): PaddockTileDetail {
  const acres = listing.acres;
  const breakdown = paddockBreakdown(acres);
  const dseLow = acres >= 280 ? 0.8 : acres >= 160 ? 0.6 : 0.5;
  const dseHigh = acres >= 280 ? 1.4 : acres >= 160 ? 1.0 : 0.8;
  return {
    headline: `${acres} acres across ${breakdown.length} paddocks`,
    bullets: [
      `Paddocks: ${breakdown.join(" ac, ")} ac`,
      "Mix of shaded paddocks and open grazing country",
      "Laneway access to all paddocks from the homestead",
      `Stocking guide ${dseLow.toFixed(1)}-${dseHigh.toFixed(1)} DSE/ac for the season`,
    ],
  };
}

function paddockBreakdown(totalAcres: number): number[] {
  // Split the total into a plausible set of paddock sizes - largest first.
  // Deterministic so the same listing always shows the same breakdown.
  if (totalAcres >= 280) {
    const sizes = [0.32, 0.22, 0.16, 0.12, 0.1, 0.08];
    return sizes.map((share) => Math.round(totalAcres * share));
  }
  if (totalAcres >= 160) {
    const sizes = [0.36, 0.26, 0.18, 0.12, 0.08];
    return sizes.map((share) => Math.round(totalAcres * share));
  }
  const sizes = [0.45, 0.3, 0.15, 0.1];
  return sizes.map((share) => Math.round(totalAcres * share));
}
