export type Farmer = {
  id: string;
  name: string;
  role: "Livestock Owner" | "Landowner" | "Transport Provider";
  region: string;
  verified: boolean;
};

export type AustralianState = "NSW" | "QLD" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

export type TruckClass = "medium-rigid" | "heavy-rigid" | "b-double" | "road-train";

export type TruckCapacity = {
  cattle: number;
  sheep: number;
  horses: number;
};

export type Truck = {
  id: string;
  ownerId: string;
  rego: string;
  label: string;
  class: TruckClass;
  capacity: TruckCapacity;
  serviceRegions: string[];
  preferredRadiusKm: number;
};

export const TRUCK_CLASS_LABEL: Record<TruckClass, string> = {
  "medium-rigid": "Medium rigid",
  "heavy-rigid": "Heavy rigid",
  "b-double": "B-double",
  "road-train": "Road train",
};

export type PaddockListing = {
  id: string;
  title: string;
  ownerId: string;
  location: string;
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
};

export type Agreement = {
  id: string;
  listingId: string;
  requestId: string;
  farmerAId: string;
  farmerBId: string;
  status: "Negotiating" | "Ready to finalise" | "Active";
  livestock: string;
  duration: string;
  feed: string;
  water: string;
  fencing: string;
  transportRequired: boolean;
  weeksRemaining: number;
  lastUpdate: string;
  readinessChecklist: { label: string; complete: boolean }[];
  sections: AgreementSection[];
  artefacts: AgreementArtefact[];
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  time: string;
  sectionId?: string;
};

export type TransportSize = "small" | "medium" | "large";

export type TransportState = "open" | "assigned" | "in-progress" | "complete";

export type TransportStockType = "Cattle" | "Sheep" | "Horses" | "Goats";

export type TransportJob = {
  id: string;
  agreementId?: string;
  farmerAId?: string;
  farmerBId?: string;
  driverId?: string;
  pickup: string;
  pickupRegion: string;
  destination: string;
  destinationRegion: string;
  livestockCount: string;
  stockType: TransportStockType;
  headCount: number;
  size: TransportSize;
  preferredDate: string;
  driver?: string;
  state: TransportState;
  status: "Open" | "Loading" | "In Transit" | "Arrived";
  routeSummary: string;
  distanceKm: number;
  estimatedDuration: string;
};

export const farmers: Farmer[] = [
  {
    id: "farmer-a",
    name: "Dale Morgan",
    role: "Livestock Owner",
    region: "Central West NSW",
    verified: true,
  },
  {
    id: "farmer-b",
    name: "Brett Donnelly",
    role: "Landowner",
    region: "Southern NSW",
    verified: true,
  },
  {
    id: "driver-1",
    name: "Wayne Hayes",
    role: "Transport Provider",
    region: "Riverina",
    verified: true,
  },
  {
    id: "driver-2",
    name: "Trav Henderson",
    role: "Transport Provider",
    region: "Central West NSW",
    verified: true,
  },
  {
    id: "driver-3",
    name: "Sharon Whittaker",
    role: "Transport Provider",
    region: "Northern NSW",
    verified: true,
  },
];

export const trucks: Truck[] = [
  {
    id: "truck-wayne-bdouble",
    ownerId: "driver-1",
    rego: "NSW-18BD",
    label: "Wayne's B-double",
    class: "b-double",
    capacity: { cattle: 60, sheep: 400, horses: 16 },
    serviceRegions: ["Riverina", "Southern NSW", "Central West", "Northern Victoria"],
    preferredRadiusKm: 900,
  },
  {
    id: "truck-trav-rigid-1",
    ownerId: "driver-2",
    rego: "CW-42MR",
    label: "Trav's 12-head rigid",
    class: "medium-rigid",
    capacity: { cattle: 12, sheep: 80, horses: 4 },
    serviceRegions: ["Central West", "Northern NSW", "New England"],
    preferredRadiusKm: 220,
  },
  {
    id: "truck-trav-rigid-2",
    ownerId: "driver-2",
    rego: "CW-44MR",
    label: "Trav's second rigid",
    class: "medium-rigid",
    capacity: { cattle: 10, sheep: 70, horses: 4 },
    serviceRegions: ["Central West", "Southern NSW"],
    preferredRadiusKm: 180,
  },
  {
    id: "truck-sharon-roadtrain",
    ownerId: "driver-3",
    rego: "NW-90RT",
    label: "Sharon's road train",
    class: "road-train",
    capacity: { cattle: 180, sheep: 1200, horses: 36 },
    serviceRegions: ["Northern NSW", "New England", "SE QLD", "Riverina"],
    preferredRadiusKm: 1100,
  },
  {
    id: "truck-sharon-bdouble",
    ownerId: "driver-3",
    rego: "NW-21BD",
    label: "Sharon's B-double",
    class: "b-double",
    capacity: { cattle: 70, sheep: 450, horses: 18 },
    serviceRegions: ["Northern NSW", "Central West", "New England"],
    preferredRadiusKm: 700,
  },
  {
    id: "truck-sharon-heavy",
    ownerId: "driver-3",
    rego: "NW-12HR",
    label: "Sharon's local rigid",
    class: "heavy-rigid",
    capacity: { cattle: 24, sheep: 160, horses: 8 },
    serviceRegions: ["Northern NSW", "New England"],
    preferredRadiusKm: 260,
  },
];

export const paddockListings: PaddockListing[] = [
  {
    id: "paddock-glenbarra",
    title: "Glenbarra River Paddocks",
    ownerId: "farmer-b",
    location: "Near Gundagai, NSW",
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
    suitableLivestock: ["Cattle", "Sheep"],
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
    suitableLivestock: ["Sheep", "Goats"],
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
    suitableLivestock: ["Cattle", "Horses"],
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
    preferredRegions: ["Southern NSW", "Central West"],
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
    feed: "Excellent",
    water: "Permanent",
    fencing: "Secure",
    transportRequired: true,
    weeksRemaining: 12,
    lastUpdate: "Brett updated feed and water details 18 minutes ago",
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
        summary: "Dale Morgan and Brett Donnelly",
        detail: [
          { label: "Livestock owner", value: "Dale Morgan, Central West NSW" },
          { label: "Landowner", value: "Brett Donnelly, Southern NSW" },
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
        summary: "B-double pickup tentatively booked with Wayne Hayes",
        detail: [
          { label: "Pickup", value: "Dale Morgan property, Central West" },
          { label: "Destination", value: "Glenbarra River Paddocks" },
          { label: "Operator", value: "Wayne Hayes (single B-double)" },
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
      },
      {
        id: "art-water-photo",
        label: "Water point",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "Permanent trough, gravity-fed",
      },
      {
        id: "art-gate-photo",
        label: "Gate and yards",
        kind: "photo",
        uploadedBy: "farmerB",
        description: "North gate, B-double compatible",
      },
      {
        id: "art-nlis-doc",
        label: "NLIS records",
        kind: "document",
        uploadedBy: "farmerA",
        description: "100 head, IDs uploaded",
      },
      {
        id: "art-vaccination-doc",
        label: "Vaccination records",
        kind: "document",
        uploadedBy: "farmerA",
        description: "5-in-1 current, drench schedule",
      },
      {
        id: "art-property-map",
        label: "Property map",
        kind: "map",
        uploadedBy: "farmerB",
        description: "Paddock boundaries and access lanes",
      },
    ],
  },
];

export const workspaceMessages: Message[] = [
  {
    id: "msg-1",
    threadId: "agreement-glenbarra",
    senderId: "farmer-a",
    senderName: "Dale",
    senderRole: "Livestock owner",
    body: "The cattle can be ready by next Friday. Are the yards suitable for a B-double pickup?",
    time: "9:12 AM",
    sectionId: "transport",
  },
  {
    id: "msg-2",
    threadId: "agreement-glenbarra",
    senderId: "farmer-b",
    senderName: "Brett",
    senderRole: "Landowner",
    body: "The main lane is fine. Wet-weather access is best from the north gate. I added that note to the agreement.",
    time: "9:19 AM",
    sectionId: "paddock",
  },
  {
    id: "msg-3",
    threadId: "agreement-glenbarra",
    senderId: "farmer-a",
    senderName: "Dale",
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
    pickup: "Dale Morgan, Central West NSW",
    pickupRegion: "Central West",
    destination: "Glenbarra River Paddocks, Southern NSW",
    destinationRegion: "Southern NSW",
    livestockCount: "100 cattle",
    stockType: "Cattle",
    headCount: 100,
    size: "large",
    preferredDate: "Friday 22 May",
    driver: "Wayne Hayes",
    state: "assigned",
    status: "Loading",
    routeSummary: "Central West to Gundagai via Wagga corridor",
    distanceKm: 420,
    estimatedDuration: "5 h 45 min",
  },
  {
    id: "job-bathurst-horses",
    pickup: "Bathurst spelling yards",
    pickupRegion: "Central West",
    destination: "Mudgee lifestyle block",
    destinationRegion: "Central West",
    livestockCount: "2 retired thoroughbreds",
    stockType: "Horses",
    headCount: 2,
    size: "small",
    preferredDate: "Wednesday 27 May",
    state: "open",
    status: "Open",
    routeSummary: "Bathurst to Mudgee via Sofala",
    distanceKm: 150,
    estimatedDuration: "2 h 10 min",
  },
  {
    id: "job-forbes-ewes",
    pickup: "Forbes saleyards",
    pickupRegion: "Central West",
    destination: "Cowra holding block",
    destinationRegion: "Central West",
    livestockCount: "80 crossbred ewes",
    stockType: "Sheep",
    headCount: 80,
    size: "medium",
    preferredDate: "Monday 1 June",
    state: "open",
    status: "Open",
    routeSummary: "Forbes to Cowra direct run",
    distanceKm: 70,
    estimatedDuration: "1 h 20 min",
  },
  {
    id: "job-coonamble-weaners",
    pickup: "Coonamble district property",
    pickupRegion: "Northern NSW",
    destination: "Tamworth backgrounding paddocks",
    destinationRegion: "New England",
    livestockCount: "40 Angus weaners",
    stockType: "Cattle",
    headCount: 40,
    size: "medium",
    preferredDate: "Thursday 4 June",
    state: "open",
    status: "Open",
    routeSummary: "Coonamble to Tamworth via Gunnedah",
    distanceKm: 310,
    estimatedDuration: "4 h 30 min",
  },
  {
    id: "job-walgett-feedlot",
    pickup: "Walgett north yards",
    pickupRegion: "Northern NSW",
    destination: "Wagga agistment block",
    destinationRegion: "Riverina",
    livestockCount: "180 feeder steers",
    stockType: "Cattle",
    headCount: 180,
    size: "large",
    preferredDate: "Friday 5 June",
    state: "open",
    status: "Open",
    routeSummary: "Walgett to Wagga long-haul run",
    distanceKm: 760,
    estimatedDuration: "9 h 40 min",
  },
];

export const transportMessages: Message[] = [
  {
    id: "transport-msg-1",
    threadId: "transport-glenbarra",
    senderId: "driver-1",
    senderName: "Wayne",
    senderRole: "Driver",
    body: "I can load Friday morning if yards are ready by 7 AM.",
    time: "10:03 AM",
  },
  {
    id: "transport-msg-2",
    threadId: "transport-glenbarra",
    senderId: "farmer-a",
    senderName: "Dale",
    senderRole: "Livestock owner",
    body: "Works for us. I will have the first mob in the yards Thursday afternoon.",
    time: "10:08 AM",
  },
  {
    id: "transport-msg-3",
    threadId: "transport-glenbarra",
    senderId: "farmer-b",
    senderName: "Brett",
    senderRole: "Landowner",
    body: "North gate is the best entry. Please avoid the creek crossing if it rains.",
    time: "10:14 AM",
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

export function getDrivers() {
  return farmers.filter((farmer) => farmer.role === "Transport Provider");
}

export function getTrucksForDriver(driverId: string) {
  return trucks.filter((truck) => truck.ownerId === driverId);
}

export function getOpenTransportJobs() {
  return transportJobs.filter((job) => job.state === "open");
}

export function getMessages(threadId: string) {
  return workspaceMessages.filter((message) => message.threadId === threadId);
}

export function getTransportMessages(threadId: string) {
  return transportMessages.filter((message) => message.threadId === threadId);
}
