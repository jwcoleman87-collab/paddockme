import {
  getDrivers,
  getOpenTransportJobs,
  getTrucksForDriver,
  type Farmer,
  type TransportJob,
  type TransportStockType,
  type Truck,
  TRUCK_CLASS_LABEL,
} from "@/lib/dummyData";

export type MatchTier = "strong" | "good" | "limited";

export type MatchReason = {
  label: string;
  detail: string;
  positive: boolean;
};

export type DriverJobMatch = {
  driver: Farmer;
  job: TransportJob;
  bestTruck: Truck | null;
  score: number;
  tier: MatchTier;
  summary: string;
  reasons: MatchReason[];
};

const STOCK_CAPACITY_KEY: Record<TransportStockType, keyof Truck["capacity"]> = {
  Cattle: "cattle",
  Sheep: "sheep",
  Horses: "horses",
  Goats: "sheep",
};

function capacityForJob(truck: Truck, stockType: TransportStockType) {
  return truck.capacity[STOCK_CAPACITY_KEY[stockType]];
}

function tierFromScore(score: number): MatchTier {
  if (score >= 78) return "strong";
  if (score >= 56) return "good";
  return "limited";
}

export function tierLabel(tier: MatchTier) {
  return tier === "strong"
    ? "Strong match"
    : tier === "good"
      ? "Good match"
      : "Limited match";
}

function scoreTruck(job: TransportJob, truck: Truck, driver: Farmer) {
  const capacity = capacityForJob(truck, job.stockType);
  const fitsLoad = capacity >= job.headCount;
  const servesPickup = truck.serviceRegions.includes(job.pickupRegion);
  const servesDestination = truck.serviceRegions.includes(job.destinationRegion);
  const servesRun = servesPickup || servesDestination;
  const withinRadius = job.distanceKm <= truck.preferredRadiusKm;
  const utilisation = capacity > 0 ? job.headCount / capacity : 0;
  const wellSized = utilisation >= 0.25 && utilisation <= 1;

  let score = 0;
  if (fitsLoad) score += 32;
  if (servesPickup) score += 16;
  if (servesDestination) score += 12;
  if (servesRun) score += 8;
  if (withinRadius) score += 18;
  if (wellSized) score += 8;
  if (driver.verified) score += 6;

  const reasons: MatchReason[] = [
    {
      label: "Truck fit",
      detail: fitsLoad
        ? `${TRUCK_CLASS_LABEL[truck.class]} handles ${capacity} ${job.stockType.toLowerCase()} head`
        : `${TRUCK_CLASS_LABEL[truck.class]} capacity is ${capacity} head`,
      positive: fitsLoad,
    },
    {
      label: "Region",
      detail: servesRun
        ? `Covers ${servesPickup ? job.pickupRegion : job.destinationRegion}`
        : `Not usually running ${job.pickupRegion} or ${job.destinationRegion}`,
      positive: servesRun,
    },
    {
      label: "Run length",
      detail: withinRadius
        ? `${job.distanceKm} km is inside preferred radius`
        : `${job.distanceKm} km is outside preferred radius`,
      positive: withinRadius,
    },
  ];

  return { truck, score, reasons };
}

export function matchDriverToJob(driver: Farmer, job: TransportJob): DriverJobMatch {
  const scored = getTrucksForDriver(driver.id)
    .map((truck) => scoreTruck(job, truck, driver))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const score = best?.score ?? (driver.verified ? 6 : 0);
  const tier = tierFromScore(score);
  const bestTruck = best?.truck ?? null;

  return {
    driver,
    job,
    bestTruck,
    score,
    tier,
    summary: bestTruck
      ? `${tierLabel(tier)} with ${bestTruck.label}`
      : "No truck profile available yet",
    reasons:
      best?.reasons ??
      [
        {
          label: "Truck profile",
          detail: "Add truck capacity and service areas to match jobs.",
          positive: false,
        },
      ],
  };
}

export function findJobsForDriver(driverId: string) {
  const driver = getDrivers().find((candidate) => candidate.id === driverId);

  if (!driver) {
    return [];
  }

  return getOpenTransportJobs()
    .map((job) => matchDriverToJob(driver, job))
    .sort((a, b) => b.score - a.score);
}

