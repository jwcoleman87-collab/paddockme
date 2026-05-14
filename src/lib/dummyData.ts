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
  verified: boolean;
  tagline: string;
  bio: string;
  mobileVerified: boolean;
  preparednessScore: number;
  livestock?: LivestockSubProfile;
  property?: PropertySubProfile;
  transport?: TransportSubProfile;
  verifications: VerificationCheck[];
  readiness: ReadinessItem[];
};

export type AustralianState = "NSW" | "QLD" | "VIC" | "SA" | "WA" | "TAS" | "NT" | "ACT";

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
  byParty: "Farmer A" | "Farmer B" | "System";
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
  /** Visible to farmers only - hidden from driver per the driver-visibility rule. */
  agreementContext: {
    duration: string;
    weeksRemaining: number;
    agreementStatus: string;
  };
  sections: TransportSection[];
  artefacts: TransportArtefact[];
  timeline: TransportTimelineEntry[];
};

export const farmers: Farmer[] = [
  {
    id: "farmer-a",
    name: "Dale Morgan",
    role: "Livestock Owner",
    region: "Central West NSW",
    verified: true,
    tagline: "Cattle and sheep producer, crisis-mode user.",
    bio: "Mid-size family operation, third-generation. Uses agistment reactively when his country runs dry.",
    mobileVerified: true,
    preparednessScore: 72,
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
    name: "Tash Reilly",
    role: "Livestock Owner",
    region: "Hunter NSW",
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
    name: "Brett Donnelly",
    role: "Landowner",
    region: "Southern NSW",
    verified: true,
    tagline: "Active farmer with spare paddocks in good seasons.",
    bio: "Third-generation 1,800ha mixed farming operation. Agist out 6-8 months when his own season is kind.",
    mobileVerified: true,
    preparednessScore: 81,
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
    name: "Lyn Whitfield",
    role: "Landowner",
    region: "Northern Tablelands NSW",
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
    name: "Wayne Hayes",
    role: "Transport Provider",
    region: "Riverina NSW",
    verified: true,
    tagline: "Owner-operator, single B-double, backloads matter.",
    bio: "Works direct producer to feedlot and saleyard runs. Empty backloads are the structural pain.",
    mobileVerified: true,
    preparednessScore: 76,
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
          driver: "Wayne Hayes",
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
    name: "Sharon Mackie",
    role: "Transport Provider",
    region: "Goondiwindi QLD",
    verified: true,
    tagline: "Multi-truck family business, fleet utilisation is the game.",
    bio: "12-truck operation, depot in Goondiwindi. Same app as Wayne - profile carries the difference (fleet, drivers, accreditations).",
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
        byParty: "Farmer A",
        note: "Request matched to Glenbarra River Paddocks.",
      },
      {
        at: "Mon 12 May, 4:11 PM",
        from: "Draft",
        to: "Negotiating",
        byParty: "Farmer B",
        note: "Brett opened the workspace and added paddock detail.",
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
    destination: "Glenbarra River Paddocks, Southern NSW",
    livestockCount: "100 cattle",
    preferredDate: "Friday 22 May",
    driver: "Wayne Hayes",
    status: "Loading",
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
        summary: "Dale Morgan property, Friday 22 May from 7 AM",
        status: "Confirmed",
        confirmations: { farmerA: true, farmerB: false, driver: true },
        detail: [
          { label: "Property", value: "Dale Morgan, Central West NSW" },
          { label: "Loading window", value: "Friday 22 May, from 7:00 AM" },
          { label: "Yards", value: "Loading race + head bail, B-double access" },
          { label: "On-site contact", value: "Dale Morgan, 04xx xxx xxx" },
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
        summary: "Glenbarra North gate, Brett on site",
        status: "Pending",
        confirmations: { farmerA: false, farmerB: true, driver: false },
        detail: [
          { label: "Property", value: "Glenbarra River Paddocks" },
          { label: "Gate", value: "North gate (B-double compatible)" },
          { label: "On-site contact", value: "Brett Donnelly, 04xx xxx xxx" },
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
        detail: "Wayne accepted the load on Tuesday.",
        complete: true,
      },
      {
        title: "Loading scheduled",
        detail: "Friday 22 May, 7 AM at Dale's yards.",
        complete: true,
      },
      {
        title: "In transit",
        detail: "Departure pending confirmation from Brett at delivery gate.",
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

export function getTransportJobForAgreement(agreementId: string) {
  return transportJobs.find((job) => job.agreementId === agreementId);
}

export function getMessages(threadId: string) {
  return workspaceMessages.filter((message) => message.threadId === threadId);
}

export function getTransportMessages(threadId: string) {
  return transportMessages.filter((message) => message.threadId === threadId);
}
