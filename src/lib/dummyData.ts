export type Farmer = {
  id: string;
  name: string;
  role: "Livestock Owner" | "Landowner" | "Transport Provider";
  region: string;
  verified: boolean;
};

export type PaddockListing = {
  id: string;
  title: string;
  ownerId: string;
  location: string;
  region: string;
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

export type AgreementAlignment = {
  label: string;
  status: "matched" | "attention";
  detail: string;
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
  alignment: AgreementAlignment[];
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  time: string;
};

export type TransportJob = {
  id: string;
  agreementId: string;
  farmerAId: string;
  farmerBId: string;
  driverId: string;
  pickup: string;
  destination: string;
  livestockCount: string;
  preferredDate: string;
  driver: string;
  status: "Loading" | "In Transit" | "Arrived";
  routeSummary: string;
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
    name: "Ros Robinson",
    role: "Landowner",
    region: "Southern NSW",
    verified: true,
  },
  {
    id: "driver-1",
    name: "Sam Keating",
    role: "Transport Provider",
    region: "Riverina",
    verified: false,
  },
];

export const paddockListings: PaddockListing[] = [
  {
    id: "paddock-glenbarra",
    title: "Glenbarra River Paddocks",
    ownerId: "farmer-b",
    location: "Near Gundagai, NSW",
    region: "Southern NSW",
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
    lastUpdate: "Ros updated feed and water details 18 minutes ago",
    readinessChecklist: [
      { label: "NLIS tagged", complete: true },
      { label: "Vaccination records uploaded", complete: true },
      { label: "PIC verified", complete: true },
      { label: "Transport ready", complete: false },
    ],
    alignment: [
      {
        label: "Livestock type",
        status: "matched",
        detail: "Cattle accepted by listing",
      },
      {
        label: "Duration",
        status: "matched",
        detail: "3 months fits availability window",
      },
      {
        label: "Water and fencing",
        status: "matched",
        detail: "Permanent water and secure fencing confirmed",
      },
      {
        label: "Price and special terms",
        status: "attention",
        detail: "Discuss terms before finalising",
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
  },
  {
    id: "msg-2",
    threadId: "agreement-glenbarra",
    senderId: "farmer-b",
    senderName: "Ros",
    senderRole: "Landowner",
    body: "The main lane is fine. Wet-weather access is best from the north gate. I added that note to the agreement.",
    time: "9:19 AM",
  },
  {
    id: "msg-3",
    threadId: "agreement-glenbarra",
    senderId: "farmer-a",
    senderName: "Dale",
    senderRole: "Livestock owner",
    body: "Good. I still want to talk through the weekly terms before we finalise.",
    time: "9:26 AM",
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
    destination: "Glenbarra River Paddocks, Southern NSW",
    livestockCount: "100 cattle",
    preferredDate: "Friday 22 May",
    driver: "Sam Keating",
    status: "Loading",
    routeSummary: "Central West to Gundagai via Wagga corridor",
  },
];

export const transportMessages: Message[] = [
  {
    id: "transport-msg-1",
    threadId: "transport-glenbarra",
    senderId: "driver-1",
    senderName: "Sam",
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
    senderName: "Ros",
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

export function getMessages(threadId: string) {
  return workspaceMessages.filter((message) => message.threadId === threadId);
}

export function getTransportMessages(threadId: string) {
  return transportMessages.filter((message) => message.threadId === threadId);
}
