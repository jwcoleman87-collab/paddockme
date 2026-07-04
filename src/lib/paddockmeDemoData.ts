/**
 * Demo / mock data for the PaddockME guided-workflow MVP.
 *
 * The rebuild brief prioritises the clean guided workflow over backend
 * wiring. Every new screen reads from this file so the whole 12-screen
 * flow works end-to-end without auth or Supabase. Swap these reads for
 * real queries later without touching layout code.
 */
import { paddockmeImages } from "./paddockmeImages";

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
  startDate: "1 June 2025",
  endDate: "30 Aug 2025",
  needFeedUntil: "30/06/2025",
  distanceKm: "300 km",
};

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
    distance: "120 km",
    rating: 4.8,
    acres: "120 Acres",
    badges: ["Permanent Water", "Excellent Fencing"],
    image: paddockmeImages.matchesPaddockCard,
  },
  {
    slug: "riverbend-grazing",
    name: "Riverbend Grazing",
    location: "Tarago NSW",
    distance: "150 km",
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
  targetStartDate: "1 June 2025",
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

export const demoLiveAgreement = {
  livestock: "120 Angus Cattle",
  duration: "90 Days",
  rate: "$12.50 / head / week",
  property: "Green Hills Farm",
  transport: "Pending",
  lastUpdated: "10:19 AM",
};

export const demoAgreementReview = {
  livestock: "120 Angus Cattle",
  property: "Green Hills Farm, Bungendore NSW",
  duration: "90 Days",
  dates: "1 Jun 2025 – 30 Aug 2025",
  rate: "$12.50 / head / week",
  paymentTerms: "Monthly in advance",
  transport: "Required",
};

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
  preferredDate: "1 June 2025",
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

/**
 * Two-party workspace backstory for Agistment #1023 — James and John just
 * connected off the match and are sizing each other up before locking terms
 * in the agreement. Seeded BEFORE the RFT stage, so no transporter appears.
 */
export const demoWorkspaceIntroMessages: TransportRoomMessage[] = [
  {
    sender: "James Coleman",
    role: "owner",
    time: "Yesterday 4:05 PM",
    text: "G'day John, thanks for accepting the request. We're right out of feed at Dubbo - I'm looking to agist 120 Angus steers for roughly 90 days from 1 June. Your place looks ideal.",
  },
  {
    sender: "John — Green Hills Farm",
    role: "landowner",
    time: "Yesterday 4:12 PM",
    text: "G'day James. We've had a good autumn break down here - improved pasture and plenty of standing feed. I'd comfortably carry 120 head through winter.",
  },
  {
    sender: "James Coleman",
    role: "owner",
    time: "Yesterday 4:18 PM",
    text: "Good to hear. How are you set up for water and fencing?",
  },
  {
    sender: "John — Green Hills Farm",
    role: "landowner",
    time: "Yesterday 4:26 PM",
    text: "Stock water off the creek plus two troughs on a bore that's never let us down. Boundary fencing is near new, and there are steel cattle yards by the road if you need to work them.",
  },
  {
    sender: "James Coleman",
    role: "owner",
    time: "Yesterday 4:31 PM",
    text: "Sounds spot on. Happy to talk numbers - I'll put a rate through in the agreement so we can lock the terms in properly.",
  },
  {
    sender: "John — Green Hills Farm",
    role: "landowner",
    time: "Yesterday 4:38 PM",
    text: "Righto, send it through and I'll have a look tonight. Sing out in here any time if a question comes up.",
  },
];

export const demoTransportRoomMessages: TransportRoomMessage[] = [
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
    text: "Yep — road train suitable, all-weather access right to the yards and plenty of room to turn around. Loading ramp's rated for cattle.",
  },
  {
    sender: "James Coleman",
    role: "owner",
    time: "9:15 AM",
    text: "I'll have the 120 head yarded and drafted the afternoon before so they're ready for an early pickup.",
  },
  {
    sender: "Wayne Transport",
    role: "transporter",
    time: "9:21 AM",
    text: "Perfect. I'll have the truck at Dubbo for a 6:30am pickup on 1 June. NVDs travelling with the mob and we'll be right to go.",
  },
];

export const demoRecentActivity = [
  { icon: "cattle", headline: "120 head", detail: "seeking feed near Dubbo NSW" },
  { icon: "land", headline: "80 acres", detail: "available near Wagga Wagga" },
  { icon: "truck", headline: "Transport available", detail: "Sydney → Tamworth" },
];
