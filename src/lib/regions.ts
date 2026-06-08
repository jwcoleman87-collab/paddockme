/**
 * Canonical Australian agistment regions.
 *
 * The single source of truth for every region picker in the app
 * (request creation, listing creation, paddock filters, transport
 * filters). Sourced from livestock-industry groupings (ABS SA4 + AWI +
 * ABARES regional names that producers actually use day to day).
 *
 * Each region carries:
 *   - id:    stable kebab-case identifier (DB-safe, never shown to user)
 *   - label: human display name ("Southern NSW", "Darling Downs")
 *   - state: parent state code (used to group in the picker and to
 *            derive a region from a Google Places result in /map and
 *            /listings/new geocoding flows)
 *
 * Order within each state is roughly the order producers think about
 * the country (south-to-north or east-to-west by convention) so the
 * picker reads predictably.
 */

export type AustralianState =
  | "NSW"
  | "VIC"
  | "QLD"
  | "SA"
  | "WA"
  | "TAS"
  | "NT"
  | "ACT";

export const australianStateLabel: Record<AustralianState, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
};

export type Region = {
  id: string;
  label: string;
  state: AustralianState;
};

export const regions: Region[] = [
  // NSW ----------------------------------------------------------------
  { id: "southern-nsw", label: "Southern NSW", state: "NSW" },
  { id: "riverina", label: "Riverina", state: "NSW" },
  { id: "central-west-nsw", label: "Central West NSW", state: "NSW" },
  { id: "western-nsw", label: "Western NSW", state: "NSW" },
  { id: "north-west-nsw", label: "North West NSW", state: "NSW" },
  { id: "new-england", label: "New England", state: "NSW" },
  { id: "northern-tablelands", label: "Northern Tablelands NSW", state: "NSW" },
  { id: "northern-rivers", label: "Northern Rivers NSW", state: "NSW" },
  { id: "mid-north-coast-nsw", label: "Mid North Coast NSW", state: "NSW" },
  { id: "hunter", label: "Hunter NSW", state: "NSW" },
  { id: "central-coast-nsw", label: "Central Coast NSW", state: "NSW" },
  { id: "illawarra", label: "Illawarra NSW", state: "NSW" },
  { id: "south-coast-nsw", label: "South Coast NSW", state: "NSW" },
  { id: "snowy-monaro", label: "Snowy Monaro", state: "NSW" },
  { id: "southern-tablelands", label: "Southern Tablelands NSW", state: "NSW" },
  { id: "southern-highlands", label: "Southern Highlands NSW", state: "NSW" },

  // VIC ----------------------------------------------------------------
  { id: "gippsland", label: "Gippsland", state: "VIC" },
  { id: "east-gippsland", label: "East Gippsland", state: "VIC" },
  { id: "western-districts-vic", label: "Western Districts VIC", state: "VIC" },
  { id: "south-west-vic", label: "South West VIC", state: "VIC" },
  { id: "goulburn-vic", label: "Goulburn VIC", state: "VIC" },
  { id: "north-east-vic", label: "North East VIC", state: "VIC" },
  { id: "northern-country-vic", label: "Northern Country VIC", state: "VIC" },
  { id: "wimmera", label: "Wimmera", state: "VIC" },
  { id: "mallee-vic", label: "Mallee VIC", state: "VIC" },
  { id: "central-vic", label: "Central VIC", state: "VIC" },

  // QLD ----------------------------------------------------------------
  { id: "se-qld", label: "SE QLD", state: "QLD" },
  { id: "darling-downs", label: "Darling Downs", state: "QLD" },
  { id: "burnett", label: "Burnett QLD", state: "QLD" },
  { id: "wide-bay-qld", label: "Wide Bay QLD", state: "QLD" },
  { id: "maranoa", label: "Maranoa", state: "QLD" },
  { id: "central-qld", label: "Central QLD", state: "QLD" },
  { id: "central-west-qld", label: "Central West QLD", state: "QLD" },
  { id: "channel-country", label: "Channel Country QLD", state: "QLD" },
  { id: "north-qld", label: "North QLD", state: "QLD" },
  { id: "north-west-qld", label: "North West QLD", state: "QLD" },
  { id: "far-north-qld", label: "Far North QLD", state: "QLD" },
  { id: "cape-york", label: "Cape York", state: "QLD" },

  // SA -----------------------------------------------------------------
  { id: "limestone-coast", label: "Limestone Coast", state: "SA" },
  { id: "adelaide-hills", label: "Adelaide Hills", state: "SA" },
  { id: "fleurieu-peninsula", label: "Fleurieu Peninsula", state: "SA" },
  { id: "barossa-sa", label: "Barossa SA", state: "SA" },
  { id: "lower-north-sa", label: "Lower North SA", state: "SA" },
  { id: "mid-north-sa", label: "Mid North SA", state: "SA" },
  { id: "yorke-peninsula", label: "Yorke Peninsula", state: "SA" },
  { id: "eyre-peninsula", label: "Eyre Peninsula", state: "SA" },
  { id: "murray-mallee-sa", label: "Murray Mallee SA", state: "SA" },
  { id: "riverland-sa", label: "Riverland SA", state: "SA" },
  { id: "outback-sa", label: "Outback SA", state: "SA" },

  // WA -----------------------------------------------------------------
  { id: "south-west-wa", label: "South West WA", state: "WA" },
  { id: "great-southern-wa", label: "Great Southern WA", state: "WA" },
  { id: "wheatbelt-wa", label: "Wheatbelt WA", state: "WA" },
  { id: "perth-hills", label: "Perth Hills", state: "WA" },
  { id: "mid-west-wa", label: "Mid West WA", state: "WA" },
  { id: "gascoyne", label: "Gascoyne", state: "WA" },
  { id: "pilbara", label: "Pilbara", state: "WA" },
  { id: "kimberley", label: "Kimberley", state: "WA" },
  { id: "goldfields-wa", label: "Goldfields WA", state: "WA" },

  // TAS ----------------------------------------------------------------
  { id: "southern-tas", label: "Southern Tasmania", state: "TAS" },
  { id: "midlands-tas", label: "Midlands Tasmania", state: "TAS" },
  { id: "northern-tas", label: "Northern Tasmania", state: "TAS" },
  { id: "north-west-tas", label: "North West Tasmania", state: "TAS" },
  { id: "west-coast-tas", label: "West Coast Tasmania", state: "TAS" },
  { id: "east-coast-tas", label: "East Coast Tasmania", state: "TAS" },
  { id: "king-island", label: "King Island", state: "TAS" },
  { id: "flinders-island", label: "Flinders Island", state: "TAS" },

  // NT -----------------------------------------------------------------
  { id: "top-end", label: "Top End", state: "NT" },
  { id: "katherine", label: "Katherine", state: "NT" },
  { id: "barkly", label: "Barkly", state: "NT" },
  { id: "alice-springs", label: "Alice Springs", state: "NT" },

  // ACT ----------------------------------------------------------------
  { id: "act", label: "ACT", state: "ACT" },
];

/** Quick lookups. Built once at import time; ids and labels are stable. */
export const regionsById: Record<string, Region> = Object.fromEntries(
  regions.map((region) => [region.id, region])
);
export const regionsByLabel: Record<string, Region> = Object.fromEntries(
  regions.map((region) => [region.label, region])
);

/**
 * Default ordered list of states for the picker. Driven by population /
 * agistment activity (NSW first, ACT last) so the most common regions
 * are reachable without scrolling.
 */
export const stateOrder: AustralianState[] = [
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
];

/** Groups regions under their state, in the canonical state + within-state order. */
export function regionsGroupedByState(): {
  state: AustralianState;
  label: string;
  regions: Region[];
}[] {
  const buckets = new Map<AustralianState, Region[]>();
  for (const state of stateOrder) buckets.set(state, []);
  for (const region of regions) {
    buckets.get(region.state)?.push(region);
  }
  return stateOrder.map((state) => ({
    state,
    label: australianStateLabel[state],
    regions: buckets.get(state) ?? [],
  }));
}

/**
 * Resolve a label or id to the canonical Region, falling back to undefined
 * when neither matches. Used by the picker to round-trip legacy values.
 */
export function findRegion(value: string | undefined): Region | undefined {
  if (!value) return undefined;
  return regionsById[value] ?? regionsByLabel[value];
}
