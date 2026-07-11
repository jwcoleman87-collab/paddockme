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
};

export const demoLandowner = {
  name: "John Smith",
  memberSince: "2021",
  rating: 4.8,
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
};

export const demoTransportQuotes: DemoTransportQuote[] = [
  {
    company: "Wayne Transport",
    rating: 4.9,
    reviews: 24,
    price: "$2,200",
    badges: ["Road Train", "NVD Accredited", "Fully Insured"],
  },
  {
    company: "Rural Freight Co.",
    rating: 4.7,
    reviews: 18,
    price: "$2,450",
    badges: ["Road Train", "NVD Accredited", "Fully Insured"],
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
 * Three-way transport coordination room for Agistment #1023 — the livestock
 * owner, the landowner and the chosen transporter sorting out the practical
 * detail (access, yards, NVDs, timing) before the quote is accepted.
 */
export const demoTransportRoomParticipants = [
  { name: "James Coleman", role: "Livestock owner", initials: "JC" },
  { name: "John — Green Hills Farm", role: "Landowner", initials: "GH" },
  { name: "Wayne Transport", role: "Transporter", initials: "WT" },
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
      text: "G'day all. Is Green Hills road-train accessible, and is there room to turn an A-double around near the yards?",
    },
    {
      sender: "John — Green Hills Farm",
      role: "landowner",
      time: "9:08 AM",
      text: "Yep — road train suitable, all-weather access right to the yards and plenty of room to turn around. Ramp and yards will handle the mob no worries.",
    },
    {
      sender: demoLivestockOwner.name,
      role: "owner",
      time: "9:15 AM",
      text: `I'll have the ${mobText} yarded and drafted the afternoon before so they're ready for an early pickup.`,
    },
    {
      sender: "Wayne Transport",
      role: "transporter",
      time: "9:21 AM",
      text: `Perfect. I'll have the truck at ${mob.location} for a 6:30am pickup on ${demoStartDayMonth}. NVDs travelling with the mob and we'll be right to go.`,
    },
  ];
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
