/**
 * Domain types and livestock reference data for PaddockME.
 *
 * Legacy filename: this module once carried demo personas and seed records
 * (retired per PADDOCKME_MASTER_SPEC v1.1 / DEMO-RETIRE-01). It now exports
 * TYPES and static livestock reference options only - no business data.
 * Renaming the module is logged in SPEC_DRIFT.md as follow-up debt.
 */
import type { Coordinate } from "@/lib/mapCoordinates";

export type ProfileRole =
  | "Livestock Owner"
  | "Landowner"
  | "Transport Provider";

export type VerificationStatus = "Verified" | "Pending" | "Not started";

export type VerificationCheck = {
  label: string;
  status: VerificationStatus;
  detail?: string;
};

export type ReadinessItem = {
  label: string;
  complete: boolean;
  helper?: string;
};

export type LivestockSubProfile = {
  stockTypes: string[];
  headCount: number;
  pic: string;
  nlisRegistered: boolean;
  vaccinationCurrent: boolean;
  treatmentNotes?: string;
};

export type PropertySubProfile = {
  propertyName: string;
  acres: number;
  suitableStock: string[];
  feedStatus: PaddockListing["feedStatus"];
  waterStatus: PaddockListing["waterStatus"];
  fencingStatus: PaddockListing["fencingStatus"];
  biosecurityRegistered: boolean;
  yards: string;
};

export type TransportVehicle = {
  rego: string;
  config: string;
  driver: string;
};

export type TransportSubProfile = {
  abn: string;
  fleetSize: number;
  driverCount: number;
  subContractorsAllowed: boolean;
  accreditations: {
    lbca: VerificationStatus;
    truckSafe: VerificationStatus;
    nhvas: VerificationStatus;
  };
  vehicles: TransportVehicle[];
};

export type Farmer = {
  id: string;
  name: string;
  role: ProfileRole;
  region: string;
  location?: Coordinate;
  verified: boolean;
  tagline: string;
  bio: string;
  mobileVerified: boolean;
  preparednessScore: number;
  /** Path to a square profile image in /public. Falls back to initials when absent. */
  avatarUrl?: string;
  livestock?: LivestockSubProfile;
  property?: PropertySubProfile;
  transport?: TransportSubProfile;
  verifications: VerificationCheck[];
  readiness: ReadinessItem[];
};

export const animalOptions = {
  Cattle: [
    "Angus",
    "Hereford",
    "Brahman",
    "Charolais",
    "Murray Grey",
    "Shorthorn",
    "Limousin",
    "Simmental",
    "Wagyu",
    "Droughtmaster",
    "Santa Gertrudis",
    "Brangus",
    "Friesian",
    "Jersey",
    "Mixed cattle",
    "Other cattle",
  ],
  Sheep: [
    "Merino",
    "Poll Merino",
    "Dohne Merino",
    "Border Leicester",
    "White Suffolk",
    "Poll Dorset",
    "Dorper",
    "Australian White",
    "Corriedale",
    "Romney",
    "Southdown",
    "Wiltipoll",
    "Composite sheep",
    "Mixed sheep",
    "Other sheep",
  ],
  Horses: [
    "Thoroughbred",
    "Standardbred",
    "Quarter Horse",
    "Australian Stock Horse",
    "Warmblood",
    "Arabian",
    "Appaloosa",
    "Paint Horse",
    "Clydesdale",
    "Percheron",
    "Welsh Pony",
    "Shetland Pony",
    "Brumby",
    "Miniature Horse",
    "Mixed horses",
    "Other horses",
  ],
  Goats: [
    "Boer",
    "Rangeland",
    "Kalahari Red",
    "Savanna",
    "Saanen",
    "Toggenburg",
    "British Alpine",
    "Anglo-Nubian",
    "Nigerian Dwarf",
    "Pygmy",
    "Cashmere",
    "Angora",
    "Dairy goats",
    "Meat goats",
    "Mixed goats",
    "Other goats",
  ],
  Bees: [
    "Italian honey bees",
    "Carniolan honey bees",
    "Caucasian honey bees",
    "Buckfast bees",
    "Australian commercial honey bees",
    "Native stingless bees",
    "Queen rearing hives",
    "Pollination hives",
    "Honey production hives",
    "Mixed apiary",
    "Other bees",
  ],
  Alpacas: [
    "Huacaya",
    "Suri",
    "Wethers",
    "Breeding females",
    "Males",
    "Mixed alpacas",
    "Other alpacas",
  ],
  Deer: [
    "Red deer",
    "Fallow deer",
    "Rusa deer",
    "Sambar deer",
    "Chital deer",
    "Mixed deer",
    "Other deer",
  ],
  Pigs: [
    "Large White",
    "Landrace",
    "Duroc",
    "Berkshire",
    "Hampshire",
    "Tamworth",
    "Wessex Saddleback",
    "Growers",
    "Sows",
    "Mixed pigs",
    "Other pigs",
  ],
  Poultry: [
    "Layer hens",
    "Broilers",
    "Free-range chickens",
    "Ducks",
    "Geese",
    "Turkeys",
    "Guinea fowl",
    "Mixed poultry",
    "Other poultry",
  ],
} as const;

export type StockType = keyof typeof animalOptions;

export const stockTypes = Object.keys(animalOptions) as StockType[];

export type AustralianState = "NSW" | "QLD" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type PaddockListing = {
  id: string;
  title: string;
  ownerId: string;
  location: string;
  coordinates?: Coordinate;
  region: string;
  state: AustralianState;
  regionLabel: string;
  mapPlaceLabel: string;
  mapDot: {
    x: number;
    y: number;
  };
  mapNearbyPlaces: {
    label: string;
    x: number;
    y: number;
  }[];
  acres: number;
  suitableLivestock: string[];
  feedStatus: "Excellent" | "Good" | "Tight";
  waterStatus: "Permanent" | "Seasonal" | "Tank";
  fencingStatus: "Secure" | "Good" | "Needs inspection";
  feedNote?: string;
  waterNote?: string;
  fencingNote?: string;
  verificationStatus: "Verified provider" | "Pending verification";
  availabilityWindow: string;
  guideTerms: string;
  summary: string;
  /** Photo URLs (or data URLs in the prototype). First photo is the
   * hero image used on cards and detail pages. */
  photos?: string[];
};

export type LivestockRequest = {
  id: string;
  requesterId: string;
  stockType: string;
  breed: string;
  headCount: number;
  duration: string;
  originLocation?: Coordinate;
  preferredRegions: string[];
  transportRequired: "Yes" | "No" | "Unsure";
};

export type AgreementSectionDetail = {
  label: string;
  value: string;
};

export type AgreementSection = {
  id: string;
  label: string;
  summary: string;
  detail: AgreementSectionDetail[];
  agreedByA: boolean;
  agreedByB: boolean;
};

export type AgreementArtefact = {
  id: string;
  label: string;
  kind: "photo" | "document" | "map";
  uploadedBy: "farmerA" | "farmerB";
  description: string;
  sectionId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
};

export type AgreementLifecycleState =
  | "Draft"
  | "Negotiating"
  | "Ready to finalise"
  | "Active"
  | "Completed"
  | "Cancelled";

export type AgreementLifecycleEvent = {
  at: string;
  from: AgreementLifecycleState | null;
  to: AgreementLifecycleState;
  byParty: "Livestock owner" | "Landowner" | "System";
  note?: string;
};

export type Agreement = {
  id: string;
  listingId: string;
  requestId: string;
  listingTitle?: string;
  listingLocation?: string;
  farmerAId: string;
  farmerBId: string;
  farmerAName?: string;
  farmerBName?: string;
  status: AgreementLifecycleState;
  livestock: string;
  duration: string;
  pickupLocation?: Coordinate;
  destinationLocation?: Coordinate;
  feed: string;
  water: string;
  fencing: string;
  transportRequired: boolean;
  weeksRemaining: number;
  lastUpdate: string;
  readinessChecklist: { label: string; complete: boolean }[];
  sections: AgreementSection[];
  artefacts: AgreementArtefact[];
  lifecycleHistory: AgreementLifecycleEvent[];
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatarUrl?: string;
  body: string;
  time: string;
  sectionId?: string;
};

export type TransportRole = "farmerA" | "farmerB" | "driver";

export type TransportSectionDetail = {
  label: string;
  value: string;
  /** When true, this row is hidden from the Driver role (commercial / contract detail). */
  privateFromDriver?: boolean;
};

export type TransportSectionStatus =
  | "Pending"
  | "Confirmed"
  | "In progress"
  | "Done";

export type TransportSection = {
  id: string;
  label: string;
  summary: string;
  detail: TransportSectionDetail[];
  status: TransportSectionStatus;
  confirmations: {
    farmerA: boolean;
    farmerB: boolean;
    driver: boolean;
  };
};

export type TransportArtefact = {
  id: string;
  label: string;
  kind: "photo" | "document" | "map";
  uploadedBy: TransportRole;
  description: string;
  sectionId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
};

export type TransportTimelineEntry = {
  title: string;
  detail: string;
  complete: boolean;
};

export type TransportQuoteBasis = "per_head" | "per_km" | "flat";

export type TransportQuoteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered";

/**
 * A single price proposal in the transport pricing chain.
 *
 * Visibility: rows are visible only to the two commercial parties on the
 * transport job - Livestock owner (livestock owner, pays) and the driver (paid).
 * Landowner (landowner) never appears in the SELECT scope. This is the
 * landowner-visibility wall, mirror-image of the driver-visibility wall
 * that excludes drivers from the agreement rate.
 */
export type TransportQuote = {
  id: string;
  transportJobId: string;
  proposedBy: Extract<TransportRole, "farmerA" | "driver">;
  basis: TransportQuoteBasis;
  amount: number;
  currency: string;
  paymentTerms: string;
  status: TransportQuoteStatus;
  /** Links a counter-offer to the quote it replaced. */
  previousQuoteId?: string;
  at: string;
  acceptedAt?: string;
  note?: string;
};

export type TransportJobStatus =
  | "available"
  | "accepted"
  | "loading"
  | "in_transit"
  | "arrived"
  | "completed"
  | "cancelled";

export type TransportJob = {
  id: string;
  agreementId: string;
  farmerAId: string;
  farmerBId: string;
  farmerAName?: string;
  farmerBName?: string;
  driverId: string;
  pickup: string;
  destination: string;
  pickupLocation?: Coordinate;
  destinationLocation?: Coordinate;
  currentLocation?: Coordinate;
  /** Structured pickup region for backload matching. Free-text `pickup` stays the display. */
  pickupRegion?: string;
  /** Structured destination region for backload matching. */
  destinationRegion?: string;
  livestockCount: string;
  preferredDate: string;
  driver: string;
  status: TransportJobStatus;
  routeSummary: string;
  /** Visible to farmers only - hidden from driver per the driver-visibility rule. */
  agreementContext: {
    duration: string;
    weeksRemaining: number;
    agreementStatus: string;
  };
  sections: TransportSection[];
  artefacts: TransportArtefact[];
  timeline: TransportTimelineEntry[];
  /** Commercial pricing chain. Visible to Livestock owner and Driver only. */
  quotes: TransportQuote[];
  /** Pointer to the accepted quote in the chain, if any. */
  acceptedQuoteId?: string;
};


export type TransportCapacityStatus = "published" | "booked" | "withdrawn" | "expired";

export type TransportCapacity = {
  id: string;
  driverId: string;
  /** Display label for the truck. Null when irrelevant (single-truck operator). */
  truckLabel: string | null;
  originRegion: string;
  destinationRegion: string;
  /** Human-readable date for display, e.g. "Fri 22 May". */
  earliestDate: string;
  latestDate: string;
  /**
   * ISO date (YYYY-MM-DD) used for expiry filtering. Optional so the prototype
   * remains backwards compatible with seed rows that pre-date this field.
   */
  earliestDateIso?: string;
  latestDateIso?: string;
  headCapacity: number;
  stockTypes: string[];
  /** Indicative rate. Quote chain is still the source of truth for the agreed price. */
  rateBasis: TransportQuoteBasis | null;
  rateAmount: number | null;
  notes: string | null;
  status: TransportCapacityStatus;
  /** Display string for "posted X minutes ago" feel. */
  postedAt: string;
};

