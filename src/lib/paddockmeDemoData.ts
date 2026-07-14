/**
 * Demo / mock data for the PaddockME guided-workflow MVP.
 *
 * The rebuild brief prioritises the clean guided workflow over backend
 * wiring. Every new screen reads from this file so the whole 12-screen
 * flow works end-to-end without auth or Supabase. Swap these reads for
 * real queries later without touching layout code.
 */
import { paddockmeImages } from "./paddockmeImages";

/*
 * Evergreen demo agreement window: the demo always proposes an agistment
 * starting on the first of next month and running 90 days. Every date a
 * screen shows derives from this one window, so the flow stays internally
 * consistent with the real current date (no "accepted in 2026, ran in
 * 2025"). Labels only change at month rollover, which keeps SSR and
 * client renders matching.
 */
const DEMO_TIME_ZONE = "Australia/Sydney";

function firstOfNextMonth(): Date {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: DEMO_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  // `month` is 1-based, which intentionally points Date.UTC at next month.
  return new Date(Date.UTC(year, month, 1));
}

function formatAu(d: Date, month: "short" | "long"): string {
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateInput(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromAgreementStart(offsetDays: number): Date {
  const date = new Date(agreementStart);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date;
}

const agreementStart = firstOfNextMonth();
const agreementEnd = (() => {
  const d = new Date(agreementStart);
  d.setUTCDate(d.getUTCDate() + 90);
  return d;
})();

/** e.g. "1 August 2026" — long form for workspace/transport surfaces. */
export const demoStartDateLabel = formatAu(agreementStart, "long");
/** e.g. "30 Oct 2026" — short form end of the agistment window. */
export const demoEndDateLabel = formatAu(agreementEnd, "short");
/** ISO date used by the request form so its default matches the agreement. */
export const demoEndDateInput = formatDateInput(agreementEnd);
/** e.g. "1 Aug 2026 – 30 Oct 2026" — the negotiation dates offer. */
export const demoDatesRangeLabel = `${formatAu(agreementStart, "short")} – ${demoEndDateLabel}`;
/** e.g. "1 August" — for conversational demo copy. */
export const demoStartDayMonth = agreementStart.toLocaleDateString("en-AU", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export const demoLivestockOwner = {
  name: "James Coleman",
  location: "Dubbo NSW",
  memberSince: "2024",
  avatar: paddockmeImages.avatarJames,
};

export const demoLandowner = {
  name: "John Smith",
  memberSince: "2021",
  rating: 4.8,
  avatar: paddockmeImages.avatarJohn,
};

export const demoRequest = {
  id: "1023",
  livestock: "120 Angus Cattle",
  livestockType: "Cattle",
  headCount: 120,
  currentLocation: "Dubbo NSW",
  targetLocation: "Bungendore NSW",
  duration: "90 Days",
  durationLabel: "For 90 days",
  startDate: demoStartDateLabel,
  endDate: demoEndDateLabel,
  needFeedUntil: agreementEnd.toLocaleDateString("en-AU", { timeZone: "UTC" }),
  distanceKm: "350 km",
};

/**
 * Conversational mob description derived from what the visitor actually
 * entered — "120 cattle", "40 sheep", "6 horses" — so seeded chat always
 * talks about the same animals as the rest of the flow.
 */
export function describeMob(headCount: number, livestockType: string): string {
  const type = livestockType.trim().toLowerCase();
  const noun = type === "other" || type === "" ? "head of stock" : type;
  return `${headCount} ${noun}`;
}

export type DemoProperty = {
  slug: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  acres: string;
  badges: string[];
  image: string;
};

export const demoProperties: DemoProperty[] = [
  {
    slug: "green-hills-farm",
    name: "Green Hills Farm",
    location: "Bungendore NSW",
    distance: "320 km",
    rating: 4.8,
    acres: "120 Acres",
    badges: ["Permanent Water", "Excellent Fencing"],
    image: paddockmeImages.matchesPaddockCard,
  },
  {
    slug: "riverbend-grazing",
    name: "Riverbend Grazing",
    location: "Tarago NSW",
    distance: "340 km",
    rating: 4.9,
    acres: "250 Acres",
    badges: ["Loading Ramp", "Good Water"],
    image: paddockmeImages.matchesRiverbendCard,
  },
];

export const demoPropertyDetail = {
  slug: "green-hills-farm",
  name: "Green Hills Farm",
  location: "Bungendore NSW",
  rating: 4.8,
  mainImage: paddockmeImages.propertyMain,
  gallery: [
    paddockmeImages.propertyGalleryOne,
    paddockmeImages.propertyGalleryTwo,
    paddockmeImages.propertyGalleryThree,
    paddockmeImages.propertyGalleryFour,
  ],
  extraPhotoCount: 8,
  facts: [
    { label: "Feed Quality", value: "Excellent", icon: "wheat" },
    { label: "Water", value: "Permanent Creek", icon: "droplets" },
    { label: "Fencing", value: "Excellent", icon: "fence" },
    { label: "Truck Access", value: "Road Train Suitable", icon: "truck" },
    { label: "Property Size", value: "120 Acres", icon: "landPlot" },
  ],
  owner: demoLandowner,
};

export const demoWorkspace = {
  id: "1023",
  title: "Agistment #1023",
  status: "Active",
  parties: "James & John",
  checklist: [
    { label: "Connected", done: true },
    { label: "Livestock Reviewed", done: true },
    { label: "Property Reviewed", done: true },
    { label: "Agree Price", done: false, current: true },
    { label: "Arrange Transport", done: false },
    { label: "Complete", done: false },
  ],
  targetStartDate: demoStartDateLabel,
  duration: "90 days",
};

export const demoAgreementChecklist = [
  { label: "Stock Numbers", done: true },
  { label: "Property Details", done: true },
  { label: "Price", done: false, current: true },
  { label: "Dates", done: false },
  { label: "Payment Terms", done: false },
  { label: "Transport", done: false },
];

export const demoConversation = [
  { sender: "James", time: "10:15 AM", text: "Would $12/head/week work?" },
  { sender: "John", time: "10:17 AM", text: "Could do $13." },
  { sender: "James", time: "10:18 AM", text: "Meet in the middle at $12.50?" },
  { sender: "John", time: "10:19 AM", text: "Sounds good. $12.50 it is." },
];

export type DemoTransportQuote = {
  company: string;
  rating: number;
  reviews: number;
  price: string;
  badges: string[];
  /** Driver headshot (owner-operators) or company logo (larger carriers). */
  avatar: string;
};

export const demoTransportQuotes: DemoTransportQuote[] = [
  {
    company: "Wayne Transport",
    rating: 4.9,
    reviews: 24,
    price: "$2,200",
    badges: ["Road Train", "NVD Accredited", "Fully Insured"],
    avatar: paddockmeImages.avatarWayne,
  },
  {
    company: "Rural Freight Co.",
    rating: 4.7,
    reviews: 18,
    price: "$2,450",
    badges: ["Road Train", "NVD Accredited", "Fully Insured"],
    avatar: paddockmeImages.logoRuralFreight,
  },
];

/**
 * A Request For Transport (RFT). Once the two farmers accept the agreement,
 * the livestock owner sends this to the transport side of PaddockME — it is
 * what truckies would see on their RFT map and quote against.
 */
export type TransportRft = {
  id: string;
  agreementId: string;
  pickup: string;
  destination: string;
  distanceKm: number;
  livestock: string;
  preferredDate: string;
  access: string;
  status: "open_for_quotes";
};

export const demoTransportRft: TransportRft = {
  id: "rft-1023",
  agreementId: "1023",
  pickup: "Dubbo NSW",
  destination: "Green Hills Farm, Bungendore NSW",
  distanceKm: 320,
  livestock: "120 Cattle",
  preferredDate: demoStartDateLabel,
  access: "Road train suitable",
  status: "open_for_quotes",
};

/**
 * Transporter-facing presentation data layered over the canonical RFT facts.
 * The primary job deliberately spreads `demoTransportRft`, so the transporter
 * and farmer journeys cannot drift on route, livestock, distance or date.
 */
export type DemoTransportJob = TransportRft & {
  headCount: number;
  livestockType: string;
  pickupRegion: string;
  destinationRegion: string;
  dateFlexibility: string;
  pickupAccess: string;
  deliveryAccess: string;
  loadingArrangements: string;
  unloadingArrangements: string;
  equipmentRequirement: string;
  quoteCloses: string;
  discussionCount: number;
  commercialDetails: string;
  outstandingQuestions: string[];
  featured: boolean;
};

export const demoPrimaryTransportJob: DemoTransportJob = {
  ...demoTransportRft,
  headCount: demoRequest.headCount,
  livestockType: demoRequest.livestockType,
  pickupRegion: "Dubbo district",
  destinationRegion: "Bungendore district",
  dateFlexibility: "Pickup time flexible by 2 hours",
  pickupAccess: "All-weather gravel access to steel cattle yards",
  deliveryAccess: "Use the western gate; full-size stock crate access confirmed",
  loadingArrangements: "James will have the cattle yarded and drafted before 6:30 AM",
  unloadingArrangements: "John will meet the truck at the western gate and open the receiving yards",
  equipmentRequirement: "Full-size stock crate suitable for 120 cattle",
  quoteCloses: "Quotes close today at 5:00 PM",
  discussionCount: 7,
  commercialDetails: "Quote the complete movement including GST; no overnight holding required",
  outstandingQuestions: [],
  featured: true,
};

export const demoTransportJobs: DemoTransportJob[] = [
  demoPrimaryTransportJob,
  {
    id: "rft-2047",
    agreementId: "2047",
    pickup: "Orange NSW",
    destination: "Yass NSW",
    distanceKm: 265,
    livestock: "86 Hereford Cattle",
    preferredDate: formatAu(dateFromAgreementStart(3), "long"),
    access: "B-double suitable",
    status: "open_for_quotes",
    headCount: 86,
    livestockType: "Cattle",
    pickupRegion: "Orange district",
    destinationRegion: "Yass district",
    dateFlexibility: "Flexible by 1 day",
    pickupAccess: "Sealed road to the property entrance; firm gravel to the yards",
    deliveryAccess: "B-double access with a wide turnaround beside the yards",
    loadingArrangements: "Vendor will yard and draft the mob before arrival",
    unloadingArrangements: "Receiver and stock agent will meet the carrier",
    equipmentRequirement: "Cattle crate with two secure compartments",
    quoteCloses: "Quotes close tomorrow at 12:00 PM",
    discussionCount: 2,
    commercialDetails: "Flat-rate quote including GST",
    outstandingQuestions: ["Confirm the preferred morning loading window"],
    featured: false,
  },
  {
    id: "rft-3108",
    agreementId: "3108",
    pickup: "Mudgee NSW",
    destination: "Cowra NSW",
    distanceKm: 235,
    livestock: "42 Angus Cattle",
    preferredDate: formatAu(dateFromAgreementStart(6), "long"),
    access: "Single trailer recommended",
    status: "open_for_quotes",
    headCount: 42,
    livestockType: "Cattle",
    pickupRegion: "Mudgee district",
    destinationRegion: "Cowra district",
    dateFlexibility: "Flexible across a 2-day window",
    pickupAccess: "Short unsealed approach; dry-weather access confirmed",
    deliveryAccess: "Single trailer can reverse directly to the unloading ramp",
    loadingArrangements: "Cattle will be held overnight in the pickup yards",
    unloadingArrangements: "Receiver available from 1:00 PM",
    equipmentRequirement: "Single cattle trailer; no road train required",
    quoteCloses: "Quotes close in 2 days",
    discussionCount: 0,
    commercialDetails: "Quote including GST and one hour loading allowance",
    outstandingQuestions: ["Confirm road condition after forecast rain"],
    featured: false,
  },
];

export type TransportConfirmedDetail = {
  id: string;
  label: string;
  value: string;
  confirmedBy: string;
};

/** The practical outcomes Wayne can rely on when preparing his quote. */
export const demoTransportConfirmedDetails: TransportConfirmedDetail[] = [
  {
    id: "pickup-date",
    label: "Pickup date confirmed",
    value: `${demoStartDateLabel} at 6:30 AM`,
    confirmedBy: "James and Wayne",
  },
  {
    id: "receiving-window",
    label: "Receiving window confirmed",
    value: "12:30 PM to 2:00 PM",
    confirmedBy: "John",
  },
  {
    id: "western-gate",
    label: "Western gate access confirmed",
    value: "All-weather approach directly to the receiving yards",
    confirmedBy: "John",
  },
  {
    id: "loading-ramp",
    label: "Loading ramp confirmed",
    value: "Steel cattle yards and loading ramp ready before pickup",
    confirmedBy: "James",
  },
  {
    id: "full-size-crate",
    label: "Full-size stock crate confirmed",
    value: "Gate, approach and turnaround suit Wayne's full-size crate",
    confirmedBy: "John and Wayne",
  },
];

/**
 * Three-way transport coordination room for Agistment #1023 — the livestock
 * owner, the landowner and the chosen transporter sorting out the practical
 * detail (access, yards, NVDs, timing) before the quote is accepted.
 */
export const demoTransportRoomParticipants = [
  {
    name: "James Coleman",
    role: "Livestock owner",
    initials: "JC",
    avatar: paddockmeImages.avatarJames,
  },
  {
    name: "John — Green Hills Farm",
    role: "Landowner",
    initials: "GH",
    avatar: paddockmeImages.avatarJohn,
  },
  {
    name: "Wayne Transport",
    role: "Transporter",
    initials: "WT",
    avatar: paddockmeImages.avatarWayne,
  },
];

export type TransportRoomMessage = {
  sender: string;
  role: "owner" | "landowner" | "transporter";
  time: string;
  text: string;
};

/** What the seeded conversations need to know about the visitor's request. */
export type MobDetails = {
  headCount: number;
  livestockType: string;
  location: string;
};

/**
 * Seeded workspace conversation — the enquiry-stage backstory between the
 * livestock owner and the landowner. Derived from the visitor's actual
 * request so the chat never contradicts the deal on screen.
 */
export function workspaceSeedMessages(mob: MobDetails): TransportRoomMessage[] {
  const mobText = describeMob(mob.headCount, mob.livestockType);
  return [
    {
      sender: demoLivestockOwner.name,
      role: "owner",
      time: "8:42 AM",
      text: `G'day John — I've got ${mobText} at ${mob.location} needing agistment from ${demoStartDayMonth}. Green Hills looks ideal.`,
    },
    {
      sender: "John — Green Hills Farm",
      role: "landowner",
      time: "8:51 AM",
      text: `Morning James. The front paddocks have good cover and the creek's permanent — happy to take ${mob.headCount} head for the season.`,
    },
    {
      sender: "John — Green Hills Farm",
      role: "landowner",
      time: "8:52 AM",
      text: "Work through the agreement steps when you're ready and we'll lock in price and dates.",
    },
  ];
}

/**
 * Seeded transport coordination backstory — access, yards, NVDs, timing —
 * derived from the visitor's actual request.
 */
export function transportRoomSeedMessages(
  mob: MobDetails,
): TransportRoomMessage[] {
  const mobText = describeMob(mob.headCount, mob.livestockType);
  return [
    {
      sender: "Wayne Transport",
      role: "transporter",
      time: "9:02 AM",
      text: "G'day James and John. Can a full-size stock crate get through to the Green Hills yards, and which gate gives me the safest approach?",
    },
    {
      sender: "John — Green Hills Farm",
      role: "landowner",
      time: "9:08 AM",
      text: "Use the western gate. It's an all-weather approach straight to the receiving yards, and the turnaround comfortably takes a full-size crate.",
    },
    {
      sender: "Wayne Transport",
      role: "transporter",
      time: "9:11 AM",
      text: `Thanks John. Can we lock pickup at 6:30am on ${demoStartDayMonth}? That keeps the run inside your receiving window.`,
    },
    {
      sender: demoLivestockOwner.name,
      role: "owner",
      time: "9:15 AM",
      text: `Confirmed. I'll have the ${mobText} yarded and drafted the afternoon before, with the steel loading ramp ready for 6:30am.`,
    },
    {
      sender: "Wayne Transport",
      role: "transporter",
      time: "9:18 AM",
      text: "John, will a 12:30pm to 2:00pm arrival work for unloading if traffic runs to plan?",
    },
    {
      sender: "John — Green Hills Farm",
      role: "landowner",
      time: "9:20 AM",
      text: "Yes, that receiving window is confirmed. I'll meet you at the western gate and have the unloading yards open.",
    },
    {
      sender: "Wayne Transport",
      role: "transporter",
      time: "9:23 AM",
      text: `Perfect. Access, loading and timing are clear. I'll quote the ${mob.location} to Green Hills movement on that confirmed plan.`,
    },
  ];
}

export type DemoTransporterMovementStep =
  | "heading_to_pickup"
  | "arrived_at_pickup"
  | "livestock_loaded"
  | "departed"
  | "en_route"
  | "arrived_at_property"
  | "unloaded"
  | "delivery_complete";

export type TransporterSharedUpdate = {
  sender: string;
  role: TransportRoomMessage["role"];
  text: string;
};

/**
 * Wayne's fine-grained road updates. The transporter room appends these to
 * the same `transport-room-1023` thread used by both farmers, so one update
 * informs all three parties and remains part of the completed job record.
 */
export function transporterMovementUpdateMessages(
  mob: MobDetails,
): Record<DemoTransporterMovementStep, TransporterSharedUpdate[]> {
  const mobText = describeMob(mob.headCount, mob.livestockType);
  return {
    heading_to_pickup: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `Heading to the ${mob.location} pickup now. ETA 6:20am, ten minutes ahead of the confirmed loading time.`,
      },
    ],
    arrived_at_pickup: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: "Arrived at pickup. Access is clear and James has the mob ready in the yards.",
      },
    ],
    livestock_loaded: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `${mobText} loaded in good order. Head count checked and NVDs are travelling with the truck.`,
      },
    ],
    departed: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: "Departed pickup. The load is settled and our current ETA at Green Hills is 1:10pm.",
      },
    ],
    en_route: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: "En route and making good time. No route issues; I'll update again when we're thirty minutes out.",
      },
    ],
    arrived_at_property: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: "Arrived at Green Hills. John has opened the western gate and I'm moving through to the receiving yards.",
      },
    ],
    unloaded: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `${mobText} unloaded into the receiving yards. John and I are completing the final count and handover.`,
      },
    ],
    delivery_complete: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `Delivery complete — ${mobText} off-loaded into the yards at Green Hills Farm in good order. Final count confirmed.`,
      },
      {
        sender: "John — Green Hills Farm",
        role: "landowner",
        text: "Arrival confirmed. The mob is settled, water and feed are checked, and the shared movement record is complete.",
      },
    ],
  };
}

/**
 * The scripted updates the transporter (and landowner, on arrival) post as
 * the movement progresses. Keyed by the status just reached.
 */
export function transportStatusUpdateMessages(
  mob: MobDetails,
): Record<
  "picked_up" | "en_route" | "delivered",
  { sender: string; role: TransportRoomMessage["role"]; text: string }[]
> {
  const mobText = describeMob(mob.headCount, mob.livestockType);
  return {
    picked_up: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `On the truck — ${mobText} loaded at ${mob.location} in good order. NVDs sighted and travelling with us.`,
      },
    ],
    en_route: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: "En route and making good time. I'll ring ahead when we're half an hour out from Green Hills.",
      },
    ],
    delivered: [
      {
        sender: "Wayne Transport",
        role: "transporter",
        text: `Delivered — ${mobText} off-loaded into the yards at Green Hills Farm in good order. John's signed off the arrival.`,
      },
      {
        sender: "John — Green Hills Farm",
        role: "landowner",
        text: "Mob's settled into the front paddock — water and feed all checked. All good here, James.",
      },
    ],
  };
}

export const demoRecentActivity = [
  { icon: "cattle", headline: "120 head", detail: "seeking feed near Dubbo NSW" },
  { icon: "land", headline: "80 acres", detail: "available near Wagga Wagga" },
  { icon: "truck", headline: "Transport available", detail: "Sydney → Tamworth" },
];
