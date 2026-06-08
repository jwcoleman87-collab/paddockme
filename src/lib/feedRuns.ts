export type FeedRunStatus = "new" | "accepted" | "in_transit" | "completed";

export type FeedRun = {
  id: string;
  status: FeedRunStatus;
  commodity: "Hay" | "Silage";
  pickupTown: string;
  destinationTown: string;
  owner: string;
  load: string;
  summary: string;
  distanceKm: number;
  driveTime: string;
  fee: number;
  month: string;
  href: string;
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
};

export const feedRuns: FeedRun[] = [
  {
    id: "FEED-2601",
    status: "new",
    commodity: "Hay",
    pickupTown: "Forbes",
    destinationTown: "Cowra",
    owner: "Livestock owner",
    load: "28 round bales",
    summary: "Forbes hay shed to Cowra holding paddock",
    distanceKm: 92,
    driveTime: "1h 30m",
    fee: 680,
    month: "Jun",
    href: "/transport/jobs?work=feed",
    origin: { lat: -33.384, lng: 148.008, label: "Forbes" },
    destination: { lat: -33.835, lng: 148.697, label: "Cowra" },
  },
  {
    id: "FEED-2602",
    status: "accepted",
    commodity: "Silage",
    pickupTown: "Gundagai",
    destinationTown: "Bungendore",
    owner: "Landowner",
    load: "36 wrapped silage bales",
    summary: "Gundagai silage stack to Bungendore agistment block",
    distanceKm: 154,
    driveTime: "2h 20m",
    fee: 920,
    month: "Jun",
    href: "/transport/jobs?work=feed",
    origin: { lat: -35.066, lng: 148.105, label: "Gundagai" },
    destination: { lat: -35.254, lng: 149.441, label: "Bungendore" },
  },
  {
    id: "FEED-2603",
    status: "new",
    commodity: "Hay",
    pickupTown: "Yass",
    destinationTown: "Braidwood",
    owner: "Horse owner",
    load: "18 small squares and lick blocks",
    summary: "Yass feed merchant to Braidwood horse paddock",
    distanceKm: 118,
    driveTime: "1h 55m",
    fee: 540,
    month: "Jun",
    href: "/transport/jobs?work=feed",
    origin: { lat: -34.842, lng: 148.91, label: "Yass" },
    destination: { lat: -35.441, lng: 149.799, label: "Braidwood" },
  },
];
