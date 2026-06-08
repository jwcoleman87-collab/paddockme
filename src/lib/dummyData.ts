import { mapCoordinates, type Coordinate } from "@/lib/mapCoordinates";

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
  verificationStatus: "Verified provider" | "Pending verification";
  availabilityWindow: string;
  guideTerms: string;
  summary: string;
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
  farmerAId: string;
  farmerBId: string;
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

export const farmers: Farmer[] = [
  {
    id: "farmer-a",
    name: "Livestock Owner",
    role: "Livestock Owner",
    region: "Central West NSW",
    location: mapCoordinates.dale,
    verified: true,
    tagline: "Cattle and sheep producer, crisis-mode user.",
    bio: "Mid-size family operation, third-generation. Uses agistment reactively when his country runs dry.",
    mobileVerified: true,
    preparednessScore: 72,
    avatarUrl: "/avatars/dale.jpg",
    livestock: {
      stockTypes: ["Cattle", "Sheep"],
      headCount: 850,
      pic: "NA123456",
      nlisRegistered: true,
      vaccinationCurrent: true,
      treatmentNotes: "5-in-1 current. Drenched 14 days prior to last move.",
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 281" },
      { label: "PIC of origin", status: "Verified", detail: "NA123456" },
      { label: "ABN", status: "Pending", detail: "Verification placeholder" },
      { label: "NLIS account", status: "Verified" },
    ],
    readiness: [
      { label: "NLIS tags ready for next move", complete: true },
      { label: "Vaccination records uploaded", complete: true },
      { label: "Crush and yards photographed", complete: true },
      { label: "Insurance documents to upload", complete: false },
    ],
  },
  {
    id: "farmer-tash",
    name: "Horse Owner",
    role: "Livestock Owner",
    region: "Hunter NSW",
    location: mapCoordinates.tash,
    verified: true,
    tagline: "Off-farm horse owner, continuous-use user.",
    bio: "Owns 2 horses, no land. Uses agistment as everyday operating mode within 45 minutes of home.",
    mobileVerified: true,
    preparednessScore: 64,
    livestock: {
      stockTypes: ["Horses"],
      headCount: 2,
      pic: "Pending",
      nlisRegistered: false,
      vaccinationCurrent: true,
      treatmentNotes: "Strangles current. Annual dental booked.",
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 944" },
      { label: "PIC of origin", status: "Not started", detail: "Town address - PIC may not apply" },
      { label: "EA membership", status: "Verified", detail: "Equestrian Australia, current" },
      { label: "Insurance", status: "Pending" },
    ],
    readiness: [
      { label: "Strangles vaccinations current", complete: true },
      { label: "Float / transport contact saved", complete: true },
      { label: "Vet records uploaded", complete: false },
      { label: "Worming schedule shared with agistment host", complete: false },
    ],
  },
  {
    id: "farmer-b",
    name: "Landowner",
    role: "Landowner",
    region: "Southern NSW",
    location: mapCoordinates.brett,
    verified: true,
    tagline: "Active farmer with spare paddocks in good seasons.",
    bio: "Third-generation 1,800ha mixed farming operation. Agist out 6-8 months when his own season is kind.",
    mobileVerified: true,
    preparednessScore: 81,
    avatarUrl: "/avatars/brett.jpg",
    property: {
      propertyName: "Glenbarra River Paddocks",
      acres: 280,
      suitableStock: ["Cattle", "Sheep"],
      feedStatus: "Excellent",
      waterStatus: "Permanent",
      fencingStatus: "Secure",
      biosecurityRegistered: true,
      yards: "Loading race + head bail, B-double access from sealed road.",
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 117" },
      { label: "PIC of origin", status: "Verified", detail: "NB987654" },
      { label: "ABN", status: "Verified", detail: "Verification placeholder" },
      { label: "LPA accreditation", status: "Verified" },
      { label: "Biosecurity declaration", status: "Verified", detail: "Last updated 2 weeks ago" },
    ],
    readiness: [
      { label: "Paddock photos current", complete: true },
      { label: "Water points photographed", complete: true },
      { label: "Fencing inspection recent", complete: true },
      { label: "Gate access photos uploaded", complete: true },
      { label: "Biosecurity declaration current", complete: true },
    ],
  },
  {
    id: "farmer-lyn",
    name: "Spare Paddock Owner",
    role: "Landowner",
    region: "Northern Tablelands NSW",
    location: mapCoordinates.lyn,
    verified: true,
    tagline: "Semi-retired with idle paddocks, looking for stable agistment.",
    bio: "320ha family farm, sold the breeding herd 4 years ago. Wants long-term, predictable agistment without managing stock day to day.",
    mobileVerified: true,
    preparednessScore: 58,
    property: {
      propertyName: "Whitfield Family Block",
      acres: 320,
      suitableStock: ["Cattle", "Sheep"],
      feedStatus: "Excellent",
      waterStatus: "Permanent",
      fencingStatus: "Good",
      biosecurityRegistered: false,
      yards: "Older yards, suitable for B-double with manual loading.",
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 326" },
      { label: "PIC of origin", status: "Verified", detail: "NA445566" },
      { label: "ABN", status: "Pending", detail: "Re-registered after sale of herd" },
      { label: "LPA accreditation", status: "Not started", detail: "Was current under late husband's name" },
      { label: "Biosecurity declaration", status: "Not started" },
    ],
    readiness: [
      { label: "Paddock photos current", complete: false },
      { label: "Water points photographed", complete: true },
      { label: "Fencing inspection recent", complete: false },
      { label: "Yards photographed", complete: false },
      { label: "Indicative weekly rate set", complete: false },
    ],
  },
  {
    id: "driver-1",
    name: "Carrier",
    role: "Transport Provider",
    region: "Riverina NSW",
    location: mapCoordinates.wayne,
    verified: true,
    tagline: "Owner-operator, single B-double, backloads matter.",
    bio: "Works direct producer to feedlot and saleyard runs. Empty backloads are the structural pain.",
    mobileVerified: true,
    preparednessScore: 76,
    avatarUrl: "/avatars/wayne.jpg",
    transport: {
      abn: "Verified",
      fleetSize: 1,
      driverCount: 1,
      subContractorsAllowed: false,
      accreditations: {
        lbca: "Verified",
        truckSafe: "Verified",
        nhvas: "Pending",
      },
      vehicles: [
        {
          rego: "WH B-D 01",
          config: "Kenworth K200 + B-double, double-deck",
          driver: "Carrier",
        },
      ],
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 488" },
      { label: "ABN", status: "Verified" },
      { label: "Heavy vehicle licence (MC)", status: "Verified", detail: "Renews 2027" },
      { label: "LBCA accreditation", status: "Verified" },
      { label: "TruckSafe accreditation", status: "Verified" },
      { label: "NHVAS mass management", status: "Pending", detail: "Module application lodged" },
      { label: "Public liability + cargo insurance", status: "Verified" },
    ],
    readiness: [
      { label: "Current journey plan templates", complete: true },
      { label: "NVD intake workflow saved", complete: true },
      { label: "Backload availability shared", complete: false },
    ],
  },
  {
    id: "driver-2",
    name: "Fleet Carrier",
    role: "Transport Provider",
    region: "Goondiwindi QLD",
    location: mapCoordinates.sharon,
    verified: true,
    tagline: "Multi-truck family business, fleet utilisation is the game.",
    bio: "12-truck operation, depot in Goondiwindi. Same app surface - profile carries the difference (fleet, drivers, accreditations).",
    mobileVerified: true,
    preparednessScore: 88,
    transport: {
      abn: "Verified",
      fleetSize: 12,
      driverCount: 18,
      subContractorsAllowed: true,
      accreditations: {
        lbca: "Verified",
        truckSafe: "Verified",
        nhvas: "Verified",
      },
      vehicles: [
        { rego: "SM B-T 01", config: "Kenworth T610 + B-triple", driver: "Mackie senior" },
        { rego: "SM B-D 04", config: "Volvo FH + B-double", driver: "Jase Mackie" },
        { rego: "SM RT 02", config: "Western Star + road train", driver: "Curtis Walker" },
        { rego: "SM B-D 07", config: "Kenworth K200 + B-double", driver: "Sub-contractor pool" },
      ],
    },
    verifications: [
      { label: "Mobile verified", status: "Verified", detail: "04xx xxx 612" },
      { label: "ABN", status: "Verified" },
      { label: "Heavy vehicle licences (fleet)", status: "Verified", detail: "18 drivers, current" },
      { label: "LBCA accreditation (business)", status: "Verified" },
      { label: "TruckSafe accreditation (business)", status: "Verified" },
      { label: "NHVAS mass management", status: "Verified", detail: "All modules current" },
      { label: "Public liability + cargo insurance", status: "Verified" },
      { label: "Sub-contractor settlement terms", status: "Verified" },
    ],
    readiness: [
      { label: "Fleet capacity calendar synced", complete: true },
      { label: "Driver fatigue records digital", complete: true },
      { label: "Sub-contractor settlement on time", complete: true },
      { label: "Forward bookings published", complete: false },
    ],
  },
];

/**
 * Sample role records surfaced in the prototype shell. Named research
 * archetypes stay out of the product UI so real accounts feel like real users.
 */
export const featuredFarmers: Farmer[] = farmers.filter((farmer) =>
  ["farmer-a", "farmer-b", "driver-1"].includes(farmer.id)
);

export const paddockListings: PaddockListing[] = [
  {
    id: "paddock-glenbarra",
    title: "Glenbarra River Paddocks",
    ownerId: "farmer-b",
    location: "Near Gundagai, NSW",
    coordinates: mapCoordinates.gundagai,
    region: "Southern NSW",
    state: "NSW",
    regionLabel: "Southern NSW",
    mapPlaceLabel: "Gundagai",
    mapDot: { x: 66, y: 72 },
    mapNearbyPlaces: [
      { label: "Wagga", x: 56, y: 78 },
      { label: "Tumut", x: 74, y: 75 },
      { label: "Yass", x: 75, y: 60 },
    ],
    acres: 280,
    suitableLivestock: ["Cattle", "Sheep", "Goats"],
    feedStatus: "Excellent",
    waterStatus: "Permanent",
    fencingStatus: "Secure",
    verificationStatus: "Verified provider",
    availabilityWindow: "Available from 18 May",
    guideTerms: "Discuss terms",
    summary:
      "River flats with strong autumn feed, permanent troughs, and laneway access suitable for truck loading.",
  },
  {
    id: "paddock-wattle-creek",
    title: "Wattle Creek Holding Block",
    ownerId: "farmer-b",
    location: "Cowra, NSW",
    coordinates: mapCoordinates.cowra,
    region: "Central West",
    state: "NSW",
    regionLabel: "Central West",
    mapPlaceLabel: "Cowra",
    mapDot: { x: 58, y: 52 },
    mapNearbyPlaces: [
      { label: "Orange", x: 45, y: 42 },
      { label: "Forbes", x: 48, y: 57 },
      { label: "Young", x: 66, y: 66 },
    ],
    acres: 145,
    suitableLivestock: ["Sheep", "Goats", "Alpacas", "Pigs", "Poultry"],
    feedStatus: "Good",
    waterStatus: "Tank",
    fencingStatus: "Good",
    verificationStatus: "Pending verification",
    availabilityWindow: "Two weeks notice",
    guideTerms: "Guide only",
    summary:
      "Useful short-term holding block with reliable tank water and simple yard access.",
  },
  {
    id: "paddock-hillview",
    title: "Hillview Improved Pasture",
    ownerId: "farmer-b",
    location: "Gippsland, VIC",
    coordinates: mapCoordinates.gippsland,
    region: "Gippsland",
    state: "VIC",
    regionLabel: "Gippsland",
    mapPlaceLabel: "Sale",
    mapDot: { x: 72, y: 54 },
    mapNearbyPlaces: [
      { label: "Traralgon", x: 56, y: 55 },
      { label: "Maffra", x: 68, y: 43 },
      { label: "Bairnsdale", x: 82, y: 50 },
    ],
    acres: 420,
    suitableLivestock: ["Cattle", "Horses", "Deer", "Bees"],
    feedStatus: "Good",
    waterStatus: "Permanent",
    fencingStatus: "Secure",
    verificationStatus: "Verified provider",
    availabilityWindow: "June to September",
    guideTerms: "Discuss terms",
    summary:
      "Improved pasture paddocks with permanent water, shade lines, and good wet-weather access.",
  },
];

export const livestockRequests: LivestockRequest[] = [
  {
    id: "request-100-cattle",
    requesterId: "farmer-a",
    stockType: "Cattle",
    breed: "Angus",
    headCount: 100,
    duration: "3 months",
    originLocation: mapCoordinates.dale,
    preferredRegions: ["Southern NSW", "Central West"],
    transportRequired: "Yes",
  },
  {
    id: "request-tash-horses",
    requesterId: "farmer-tash",
    stockType: "Horses",
    breed: "Mixed thoroughbred",
    headCount: 8,
    duration: "6+ months",
    originLocation: mapCoordinates.tash,
    preferredRegions: ["Hunter NSW", "Southern NSW"],
    transportRequired: "No",
  },
  {
    id: "request-dale-weaners",
    requesterId: "farmer-a",
    stockType: "Cattle",
    breed: "Hereford weaners",
    headCount: 220,
    duration: "9 months",
    originLocation: mapCoordinates.dale,
    preferredRegions: ["Central West", "Northern Tablelands NSW"],
    transportRequired: "Yes",
  },
];

export const agreements: Agreement[] = [
  {
    id: "agreement-glenbarra",
    listingId: "paddock-glenbarra",
    requestId: "request-100-cattle",
    farmerAId: "farmer-a",
    farmerBId: "farmer-b",
    status: "Negotiating",
    livestock: "100 cattle",
    duration: "3 months",
    pickupLocation: mapCoordinates.dale,
    destinationLocation: mapCoordinates.gundagai,
    feed: "Excellent",
    water: "Permanent",
    fencing: "Secure",
    transportRequired: true,
    weeksRemaining: 12,
    lastUpdate: "Landowner updated feed and water details 18 minutes ago",
    readinessChecklist: [
      { label: "NLIS tagged", complete: true },
      { label: "Vaccination records uploaded", complete: true },
      { label: "PIC verified", complete: true },
      { label: "Transport ready", complete: false },
    ],
    sections: [
      {
        id: "parties",
        label: "Parties",
        summary: "Livestock owner and landowner",
        detail: [
          { label: "Livestock owner", value: "Central West NSW" },
          { label: "Landowner", value: "Southern NSW" },
        ],
        agreedByA: true,
        agreedByB: true,
      },
      {
        id: "stock",
        label: "Stock",
        summary: "100 Angus cattle, NLIS tagged",
        detail: [
          { label: "Type", value: "100 Angus cattle" },
          { label: "Identification", value: "NLIS tagged" },
          { label: "Vaccination", value: "Current (5-in-1)" },
          { label: "PIC of origin", value: "Verified" },
        ],
        agreedByA: true,
        agreedByB: false,
      },
      {
        id: "paddock",
        label: "Paddock",
        summary: "Glenbarra River Paddocks, 280 acres",
        detail: [
          { label: "Property", value: "Glenbarra River Paddocks" },
          { label: "Location", value: "Near Gundagai, NSW" },
          { label: "Size", value: "280 acres" },
          { label: "Feed", value: "Excellent" },
          { label: "Water", value: "Permanent" },
          { label: "Fencing", value: "Secure" },
        ],
        agreedByA: true,
        agreedByB: true,
      },
      {
        id: "dates",
        label: "Dates and duration",
        summary: "Three months from 18 May 2026",
        detail: [
          { label: "Start", value: "18 May 2026" },
          { label: "Duration", value: "3 months" },
          { label: "Return move", value: "Tentative" },
        ],
        agreedByA: true,
        agreedByB: true,
      },
      {
        id: "terms",
        label: "Rate and terms",
        summary: "Weekly rate still being agreed",
        detail: [
          { label: "Rate", value: "Discuss terms - guide only" },
          { label: "Feed top-up", value: "Landowner provides hay as needed" },
          { label: "Water responsibility", value: "Landowner" },
          { label: "Fencing responsibility", value: "Landowner" },
        ],
        agreedByA: false,
        agreedByB: false,
      },
      {
        id: "transport",
        label: "Transport",
        summary: "B-double pickup tentatively booked with carrier",
        detail: [
          { label: "Pickup", value: "Central West property" },
          { label: "Destination", value: "Glenbarra River Paddocks" },
          { label: "Operator", value: "Carrier (single B-double)" },
          { label: "Preferred date", value: "Friday 22 May" },
        ],
        agreedByA: true,
        agreedByB: false,
      },
    ],
    artefacts: [
      {
        id: "art-paddock-photo",
        label: "Paddock view",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "River-flat paddocks, autumn feed",
        sectionId: "paddock",
      },
      {
        id: "art-water-photo",
        label: "Water point",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "Permanent trough, gravity-fed",
        sectionId: "paddock",
      },
      {
        id: "art-gate-photo",
        label: "Gate and yards",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "North gate, B-double compatible",
        sectionId: "transport",
      },
      {
        id: "art-nlis-doc",
        label: "NLIS records",
        kind: "document",
        uploadedBy: "farmerA",
        description: "100 head, IDs uploaded",
        sectionId: "stock",
      },
      {
        id: "art-vaccination-doc",
        label: "Vaccination records",
        kind: "document",
        uploadedBy: "farmerA",
        description: "5-in-1 current, drench schedule",
        sectionId: "stock",
      },
      {
        id: "art-property-map",
        label: "Property map",
        kind: "map",
        uploadedBy: "farmerB",
        description: "Paddock boundaries and access lanes",
        sectionId: "paddock",
      },
    ],
    lifecycleHistory: [
      {
        at: "Mon 12 May, 8:42 AM",
        from: null,
        to: "Draft",
        byParty: "Livestock owner",
        note: "Request matched to Glenbarra River Paddocks.",
      },
      {
        at: "Mon 12 May, 4:11 PM",
        from: "Draft",
        to: "Negotiating",
        byParty: "Landowner",
        note: "Landowner opened the workspace and added paddock detail.",
      },
    ],
  },
];

export const workspaceMessages: Message[] = [
  {
    id: "msg-1",
    threadId: "agreement-glenbarra",
    senderId: "farmer-a",
    senderName: "Livestock owner",
    senderRole: "Livestock owner",
    body: "The cattle can be ready by next Friday. Are the yards suitable for a B-double pickup?",
    time: "9:12 AM",
    sectionId: "transport",
  },
  {
    id: "msg-2",
    threadId: "agreement-glenbarra",
    senderId: "farmer-b",
    senderName: "Landowner",
    senderRole: "Landowner",
    body: "The main lane is fine. Wet-weather access is best from the north gate. I added that note to the agreement.",
    time: "9:19 AM",
    sectionId: "paddock",
  },
  {
    id: "msg-3",
    threadId: "agreement-glenbarra",
    senderId: "farmer-a",
    senderName: "Livestock owner",
    senderRole: "Livestock owner",
    body: "Good. I still want to talk through the weekly terms before we finalise.",
    time: "9:26 AM",
    sectionId: "terms",
  },
];

export const transportJobs: TransportJob[] = [
  {
    id: "transport-glenbarra",
    agreementId: "agreement-glenbarra",
    farmerAId: "farmer-a",
    farmerBId: "farmer-b",
    driverId: "driver-1",
    pickup: "Central West property",
    destination: "Glenbarra River Paddocks, Southern NSW",
    pickupLocation: mapCoordinates.dale,
    destinationLocation: mapCoordinates.gundagai,
    currentLocation: mapCoordinates.wayne,
    pickupRegion: "Central West NSW",
    destinationRegion: "Southern NSW",
    livestockCount: "100 cattle",
    preferredDate: "Friday 22 May",
    driver: "Carrier",
    status: "accepted",
    routeSummary: "Central West to Gundagai via Wagga corridor",
    agreementContext: {
      duration: "3 months",
      weeksRemaining: 12,
      agreementStatus: "Negotiating",
    },
    sections: [
      {
        id: "pickup",
        label: "Pickup",
        summary: "Central West property, Friday 22 May from 7 AM",
        status: "Confirmed",
        confirmations: { farmerA: true, farmerB: false, driver: true },
        detail: [
          { label: "Property", value: "Central West NSW" },
          { label: "Loading window", value: "Friday 22 May, from 7:00 AM" },
          { label: "Yards", value: "Loading race + head bail, B-double access" },
          { label: "On-site contact", value: "Livestock owner, 04xx xxx xxx" },
        ],
      },
      {
        id: "manifest",
        label: "Stock manifest",
        summary: "100 Angus cattle, ~380 kg head, NLIS tagged",
        status: "Pending",
        confirmations: { farmerA: true, farmerB: false, driver: false },
        detail: [
          { label: "Stock", value: "100 Angus cattle" },
          { label: "Average weight", value: "~380 kg head, ~38 t total" },
          { label: "Identification", value: "NLIS tagged, list attached" },
          {
            label: "Welfare notes",
            value: "Drenched 14 days prior, last fed 4 h before load",
          },
        ],
      },
      {
        id: "route",
        label: "Route",
        summary: "Central West to Gundagai via Wagga, ~280 km",
        status: "Confirmed",
        confirmations: { farmerA: true, farmerB: true, driver: true },
        detail: [
          { label: "Corridor", value: "Central West to Gundagai via Wagga" },
          { label: "Distance", value: "~280 km" },
          { label: "ETA", value: "5 to 6 hours including spell" },
          { label: "Mandatory spell", value: "30 min at Cootamundra" },
        ],
      },
      {
        id: "delivery",
        label: "Delivery",
        summary: "Glenbarra North gate, landowner on site",
        status: "Pending",
        confirmations: { farmerA: false, farmerB: true, driver: false },
        detail: [
          { label: "Property", value: "Glenbarra River Paddocks" },
          { label: "Gate", value: "North gate (B-double compatible)" },
          { label: "On-site contact", value: "Landowner, 04xx xxx xxx" },
          { label: "Wet weather", value: "Avoid creek crossing" },
        ],
      },
      {
        id: "return",
        label: "Return move",
        summary: "To be scheduled when agistment ends",
        status: "Pending",
        confirmations: { farmerA: false, farmerB: false, driver: false },
        detail: [
          { label: "Status", value: "Placeholder - book at end of agistment" },
          { label: "Anchor date", value: "End of agreement (around 22 Aug)" },
        ],
      },
    ],
    artefacts: [
      {
        id: "transport-nvd",
        label: "NVD (vendor declaration)",
        kind: "document",
        uploadedBy: "farmerA",
        description: "Signed declaration covering 100 head, current.",
        sectionId: "manifest",
      },
      {
        id: "transport-journey-plan",
        label: "Journey plan",
        kind: "document",
        uploadedBy: "driver",
        description: "Wagga corridor route, Cootamundra spell, ETA 1:30 PM.",
        sectionId: "route",
      },
      {
        id: "transport-manifest-doc",
        label: "Loading manifest",
        kind: "document",
        uploadedBy: "farmerA",
        description: "100 head, NLIS list, mob notes.",
        sectionId: "manifest",
      },
      {
        id: "transport-gate-photo",
        label: "North gate photo",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "B-double access from sealed road, no creek crossing.",
        sectionId: "delivery",
      },
      {
        id: "transport-route-map",
        label: "Route map",
        kind: "map",
        uploadedBy: "driver",
        description: "Central West to Gundagai via Wagga corridor.",
        sectionId: "route",
      },
    ],
    timeline: [
      {
        title: "Job booked",
        detail: "Carrier accepted the load on Tuesday.",
        complete: true,
      },
      {
        title: "Loading scheduled",
        detail: "Friday 22 May, 7 AM at the pickup yards.",
        complete: true,
      },
      {
        title: "In transit",
        detail: "Departure pending confirmation from the landowner at delivery gate.",
        complete: false,
      },
      {
        title: "Arrived",
        detail: "Head count off-truck recorded at Glenbarra.",
        complete: false,
      },
      {
        title: "Return move scheduled",
        detail: "Booked at end of agistment (around 22 Aug).",
        complete: false,
      },
    ],
    quotes: [
      {
        id: "quote-glenbarra-1",
        transportJobId: "transport-glenbarra",
        proposedBy: "driver",
        basis: "per_head",
        amount: 8.5,
        currency: "AUD",
        paymentTerms: "Net 14 after delivery",
        status: "accepted",
        acceptedAt: "Tue 13 May, 11:24 AM",
        at: "Tue 13 May, 11:02 AM",
        note: "Standard B-double rate, Wagga corridor. Fuel surcharge included.",
      },
    ],
    acceptedQuoteId: "quote-glenbarra-1",
  },
];

export const transportMessages: Message[] = [
  {
    id: "transport-msg-1",
    threadId: "transport-glenbarra",
    senderId: "driver-1",
    senderName: "Carrier",
    senderRole: "Driver",
    body: "I can load Friday morning if yards are ready by 7 AM.",
    time: "10:03 AM",
  },
  {
    id: "transport-msg-2",
    threadId: "transport-glenbarra",
    senderId: "farmer-a",
    senderName: "Livestock owner",
    senderRole: "Livestock owner",
    body: "Works for us. I will have the first mob in the yards Thursday afternoon.",
    time: "10:08 AM",
  },
  {
    id: "transport-msg-3",
    threadId: "transport-glenbarra",
    senderId: "farmer-b",
    senderName: "Landowner",
    senderRole: "Landowner",
    body: "North gate is the best entry. Please avoid the creek crossing if it rains.",
    time: "10:14 AM",
  },
];

/**
 * A run-of-truck a driver has publicly available - origin to destination,
 * date window, capacity. Lives in /transport/available, parallel to /listings
 * for paddocks. Visible to all farmers (no privacy wall - this is marketplace
 * discovery), but only the owning driver can edit / withdraw.
 */
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

export const transportCapacities: TransportCapacity[] = [
  {
    id: "cap-wayne-wagga-toowoomba",
    driverId: "driver-1",
    truckLabel: "B-double, double-deck",
    originRegion: "Riverina NSW",
    destinationRegion: "Darling Downs QLD",
    earliestDate: "Fri 12 Jun",
    latestDate: "Sat 13 Jun",
    earliestDateIso: "2026-06-12",
    latestDateIso: "2026-06-13",
    headCapacity: 56,
    stockTypes: ["Cattle", "Sheep"],
    rateBasis: "per_head",
    rateAmount: 8.5,
    notes: "Returning from Glenbarra drop. Backload preferred to keep the truck full.",
    status: "published",
    postedAt: "Tue 13 May, 9:14 AM",
  },
  {
    id: "cap-sharon-toowoomba-tamworth",
    driverId: "driver-2",
    truckLabel: "B-triple, SM B-T 01",
    originRegion: "Darling Downs QLD",
    destinationRegion: "Northern Tablelands NSW",
    earliestDate: "Mon 25 May",
    latestDate: "Wed 27 May",
    earliestDateIso: "2026-05-25",
    latestDateIso: "2026-05-27",
    headCapacity: 84,
    stockTypes: ["Cattle"],
    rateBasis: "per_head",
    rateAmount: 7.2,
    notes: "Full deck. Crate config locked - can't take sheep on this run.",
    status: "published",
    postedAt: "Mon 12 May, 4:32 PM",
  },
  {
    id: "cap-sharon-goondiwindi-roma",
    driverId: "driver-2",
    truckLabel: "Road train, SM RT 02",
    originRegion: "Darling Downs QLD",
    destinationRegion: "Maranoa QLD",
    earliestDate: "Thu 28 May",
    latestDate: "Sat 30 May",
    earliestDateIso: "2026-05-28",
    latestDateIso: "2026-05-30",
    headCapacity: 120,
    stockTypes: ["Cattle"],
    rateBasis: "per_km",
    rateAmount: 4.6,
    notes: "Long-haul, road-train rated only on permitted routes.",
    status: "published",
    postedAt: "Wed 14 May, 7:48 AM",
  },
  {
    id: "cap-wayne-tamworth-armidale",
    driverId: "driver-1",
    truckLabel: "B-double, double-deck",
    originRegion: "Northern Tablelands NSW",
    destinationRegion: "Hunter NSW",
    earliestDate: "Mon 1 Jun",
    latestDate: "Wed 3 Jun",
    earliestDateIso: "2026-06-01",
    latestDateIso: "2026-06-03",
    headCapacity: 56,
    stockTypes: ["Cattle", "Sheep", "Horses"],
    rateBasis: "flat",
    rateAmount: 1850,
    notes: "Flat rate for the whole truck. Happy to split load if needed.",
    status: "published",
    postedAt: "Wed 14 May, 3:21 PM",
  },
];

export const regionalInsights = [
  { region: "Southern NSW", availability: 78, feed: "Strong", pressure: "Low" },
  { region: "Central West", availability: 54, feed: "Patchy", pressure: "Medium" },
  { region: "Northern NSW", availability: 43, feed: "Tight", pressure: "High" },
  { region: "Gippsland", availability: 69, feed: "Good", pressure: "Low" },
  { region: "SE QLD", availability: 37, feed: "Tight", pressure: "High" },
];

export function getFarmer(id: string) {
  return farmers.find((farmer) => farmer.id === id);
}

export function getListing(id: string) {
  return paddockListings.find((listing) => listing.id === id) ?? paddockListings[0];
}

export function getAgreement(id: string) {
  return agreements.find((agreement) => agreement.id === id) ?? agreements[0];
}

export function getTransportJob(id: string) {
  return transportJobs.find((job) => job.id === id) ?? transportJobs[0];
}

export function getTransportJobForAgreement(agreementId: string) {
  return transportJobs.find((job) => job.agreementId === agreementId);
}

export function getAgreementForListing(listingId: string) {
  return agreements.find((agreement) => agreement.listingId === listingId);
}

export function getMessages(threadId: string) {
  return workspaceMessages.filter((message) => message.threadId === threadId);
}

export function getTransportMessages(threadId: string) {
  return transportMessages.filter((message) => message.threadId === threadId);
}

export function getTransportCapacity(id: string) {
  return transportCapacities.find((capacity) => capacity.id === id);
}

export function listTransportCapacities() {
  const todayIso = new Date().toISOString().slice(0, 10);
  return transportCapacities.filter((capacity) => {
    if (capacity.status !== "published") return false;
    // Hide rows whose window has already closed. Rows without an ISO date
    // (legacy / display-only seed) stay visible.
    if (capacity.latestDateIso && capacity.latestDateIso < todayIso) return false;
    return true;
  });
}

/**
 * Geographic adjacency map. A region is "near" another when its capacity
 * row can plausibly chain off the other's destination - same broad area,
 * road-network reachable in a reasonable backload window.
 *
 * Hand-curated for the seed regions; real data should drive this off a
 * geo-lookup later. Symmetric by construction (regions appear in each
 * other's neighbour lists).
 */
const regionAdjacency: Record<string, string[]> = {
  "Southern NSW": ["Riverina NSW", "Central West NSW"],
  "Riverina NSW": ["Southern NSW", "Central West NSW", "Western VIC"],
  "Central West NSW": [
    "Southern NSW",
    "Riverina NSW",
    "Northern Tablelands NSW",
    "Northern NSW",
  ],
  "Northern NSW": ["Central West NSW", "Northern Tablelands NSW", "Darling Downs QLD"],
  "Northern Tablelands NSW": [
    "Hunter NSW",
    "Northern NSW",
    "Central West NSW",
    "Darling Downs QLD",
  ],
  "Hunter NSW": ["Northern Tablelands NSW", "Central West NSW"],
  "Darling Downs QLD": [
    "Northern Tablelands NSW",
    "Northern NSW",
    "Maranoa QLD",
    "SE QLD",
  ],
  "Maranoa QLD": ["Darling Downs QLD"],
  "SE QLD": ["Darling Downs QLD"],
  "Gippsland VIC": ["Western VIC"],
  "Western VIC": ["Gippsland VIC", "Riverina NSW"],
};

export function regionsNear(region: string): string[] {
  return [region, ...(regionAdjacency[region] ?? [])];
}

/**
 * Possible-backload lookup for a driver. Returns the driver's own published
 * capacity rows that could chain off the supplied region.
 *
 * When `nearRegion` is supplied, only capacities whose origin is in that
 * region or its adjacency set are returned - so a job ending in Southern
 * NSW surfaces backloads originating in Riverina but not in Hunter.
 *
 * When no anchor region is supplied (or it's unknown), returns all of the
 * driver's published rows - safer fallback than silently empty.
 */
export function getDriverBackloads(driverId: string, nearRegion?: string) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const all = transportCapacities.filter(
    (capacity) =>
      capacity.driverId === driverId &&
      capacity.status === "published" &&
      (!capacity.latestDateIso || capacity.latestDateIso >= todayIso)
  );
  if (!nearRegion || !regionAdjacency[nearRegion]) return all;
  const neighbours = new Set(regionsNear(nearRegion));
  return all.filter((capacity) => neighbours.has(capacity.originRegion));
}
