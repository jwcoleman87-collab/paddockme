"use client";

import {
  agreements,
  farmers,
  livestockRequests,
  paddockListings,
  transportJobs,
  type Agreement,
  type AgreementLifecycleEvent,
  type LivestockRequest,
  type PaddockListing,
  type TransportJob,
  type TransportJobStatus,
} from "@/lib/dummyData";
import { coordinateForRegion, mapCoordinates } from "@/lib/mapCoordinates";

export type PersonaId = "farmer-a" | "farmer-b" | "driver-1" | "driver-2";

export type PrototypeTimelineEntry = {
  id: string;
  at: string;
  title: string;
  detail: string;
  href?: string;
};

export type PrototypeState = {
  selectedPersona: PersonaId;
  livestockRequests: LivestockRequest[];
  paddockListings: PaddockListing[];
  agreements: Agreement[];
  transportJobs: TransportJob[];
  timelineEntries: PrototypeTimelineEntry[];
};

const STORE_KEY = "paddockme.prototype.state.v1";
const PERSONA_KEY = "paddockme.profile.persona";

export const personaNames: Record<PersonaId, string> = {
  "farmer-a": "Dale",
  "farmer-b": "Brett",
  "driver-1": "Wayne",
  "driver-2": "Sharon",
};

export const personaRoles: Record<PersonaId, string> = {
  "farmer-a": "Farmer A / livestock owner",
  "farmer-b": "Farmer B / landowner",
  "driver-1": "Transport driver",
  "driver-2": "Fleet operator",
};

export function createInitialPrototypeState(): PrototypeState {
  return {
    selectedPersona: "farmer-a",
    livestockRequests,
    paddockListings,
    agreements,
    transportJobs,
    timelineEntries: [
      {
        id: "seed-timeline-request",
        at: nowLabel(),
        title: "Agreement workflow ready",
        detail: "Dale, Brett and Wayne records are loaded.",
        href: "/agreements",
      },
    ],
  };
}

export function loadPrototypeState(): PrototypeState {
  if (typeof window === "undefined") return createInitialPrototypeState();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const storedPersona = window.localStorage.getItem(PERSONA_KEY);
    if (!raw) {
      const initial = createInitialPrototypeState();
      if (isPersonaId(storedPersona)) initial.selectedPersona = storedPersona;
      savePrototypeState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<PrototypeState>;
    const merged: PrototypeState = {
      ...createInitialPrototypeState(),
      ...parsed,
      livestockRequests: mergeById(livestockRequests, parsed.livestockRequests),
      paddockListings: mergeById(paddockListings, parsed.paddockListings),
      agreements: mergeById(agreements, parsed.agreements),
      transportJobs: mergeById(transportJobs, parsed.transportJobs),
      timelineEntries: parsed.timelineEntries ?? [],
      selectedPersona: isPersonaId(parsed.selectedPersona)
        ? parsed.selectedPersona
        : "farmer-a",
    };
    if (isPersonaId(storedPersona)) merged.selectedPersona = storedPersona;
    return merged;
  } catch {
    return createInitialPrototypeState();
  }
}

export function savePrototypeState(state: PrototypeState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  window.localStorage.setItem(PERSONA_KEY, state.selectedPersona);
  window.localStorage.setItem("paddockme.agreements.persona", state.selectedPersona);
  document.cookie = `paddockme_persona=${encodeURIComponent(state.selectedPersona)}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("paddockme:prototype-change"));
  window.dispatchEvent(new CustomEvent("paddockme:persona-change"));
}

export function setPrototypePersona(persona: PersonaId) {
  const state = loadPrototypeState();
  state.selectedPersona = persona;
  savePrototypeState(state);
  return state;
}

export function addTimeline(
  state: PrototypeState,
  title: string,
  detail: string,
  href?: string
): PrototypeState {
  return {
    ...state,
    timelineEntries: [
      {
        id: `timeline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowLabel(),
        title,
        detail,
        href,
      },
      ...state.timelineEntries,
    ].slice(0, 20),
  };
}

export function createLivestockRequest(input: {
  stockType: string;
  breed: string;
  headCount: number;
  duration: string;
  preferredRegions: string[];
  transportRequired: LivestockRequest["transportRequired"];
}): { state: PrototypeState; request: LivestockRequest } {
  const request: LivestockRequest = {
    id: `request-${Date.now()}`,
    requesterId: "farmer-a",
    originLocation: mapCoordinates.dale,
    ...input,
  };
  let state = loadPrototypeState();
  state = {
    ...state,
    selectedPersona: "farmer-a",
    livestockRequests: [request, ...state.livestockRequests],
  };
  state = addTimeline(
    state,
    "Livestock request created",
    `${request.headCount} ${request.breed} ${request.stockType} looking for ${request.preferredRegions.join(", ")}.`,
    "/listings"
  );
  savePrototypeState(state);
  return { state, request };
}

export function createPaddockListing(input: {
  title: string;
  location: string;
  region: string;
  acres: number;
  suitableLivestock: string[];
  feedStatus: PaddockListing["feedStatus"];
  waterStatus: PaddockListing["waterStatus"];
  fencingStatus: PaddockListing["fencingStatus"];
  availabilityWindow: string;
  guideTerms: string;
  summary: string;
}): { state: PrototypeState; listing: PaddockListing } {
  const listing: PaddockListing = {
    id: `listing-${Date.now()}`,
    ownerId: "farmer-b",
    state: stateForRegion(input.region),
    regionLabel: input.region,
    coordinates: coordinateForRegion(input.region),
    mapPlaceLabel: input.location.replace(/^Near\s+/i, "").split(",")[0] ?? input.region,
    mapDot: { x: 56, y: 58 },
    mapNearbyPlaces: [],
    verificationStatus: "Verified provider",
    ...input,
  };
  let state = loadPrototypeState();
  state = {
    ...state,
    selectedPersona: "farmer-b",
    paddockListings: [listing, ...state.paddockListings],
  };
  state = addTimeline(
    state,
    "Paddock listing published",
    `${listing.title} is available in ${listing.regionLabel}.`,
    `/listings/${listing.id}`
  );
  savePrototypeState(state);
  return { state, listing };
}

export function openAgreementForListing(listingId: string): {
  state: PrototypeState;
  agreement: Agreement;
} {
  let state = loadPrototypeState();
  const existing = state.agreements.find((agreement) => agreement.listingId === listingId);
  if (existing) return { state, agreement: existing };
  const listing =
    state.paddockListings.find((item) => item.id === listingId) ??
    state.paddockListings[0];
  const request =
    state.livestockRequests.find((item) => item.requesterId === "farmer-a") ??
    state.livestockRequests[0];
  const agreement = createAgreement(listing, request);
  state = {
    ...state,
    agreements: [agreement, ...state.agreements],
  };
  state = addTimeline(
    state,
    "Agreement workspace opened",
    `Dale and Brett opened a workspace for ${listing.title}.`,
    `/workspace/${agreement.id}`
  );
  savePrototypeState(state);
  return { state, agreement };
}

/**
 * Landowner-initiated agreement: Brett picks one of his paddocks to offer
 * against a livestock owner's open request. Mirrors openAgreementForListing
 * but starts from the request side.
 */
export function openAgreementForRequest(
  requestId: string,
  listingId: string
): { state: PrototypeState; agreement: Agreement } {
  let state = loadPrototypeState();
  const existing = state.agreements.find(
    (agreement) =>
      agreement.requestId === requestId && agreement.listingId === listingId
  );
  if (existing) return { state, agreement: existing };
  const listing =
    state.paddockListings.find((item) => item.id === listingId) ??
    state.paddockListings[0];
  const request =
    state.livestockRequests.find((item) => item.id === requestId) ??
    state.livestockRequests[0];
  const agreement = createAgreement(listing, request);
  state = {
    ...state,
    agreements: [agreement, ...state.agreements],
  };
  state = addTimeline(
    state,
    "Paddock offered against open request",
    `${listing.title} offered for ${request.headCount} ${request.breed} ${request.stockType}.`,
    `/workspace/${agreement.id}`
  );
  savePrototypeState(state);
  return { state, agreement };
}

export function requestTransportForAgreement(agreementId: string): {
  state: PrototypeState;
  job: TransportJob;
} {
  let state = loadPrototypeState();
  const existing = state.transportJobs.find((job) => job.agreementId === agreementId);
  if (existing) return { state, job: existing };
  const agreement =
    state.agreements.find((item) => item.id === agreementId) ?? state.agreements[0];
  const listing =
    state.paddockListings.find((item) => item.id === agreement.listingId) ??
    state.paddockListings[0];
  const job = createTransportJob(agreement, listing);
  state = {
    ...state,
    transportJobs: [job, ...state.transportJobs],
  };
  state = addTimeline(
    state,
    "Transport requested",
    `Wayne can now accept ${job.livestockCount} from ${job.pickupRegion ?? job.pickup}.`,
    "/transport/jobs"
  );
  savePrototypeState(state);
  return { state, job };
}

export function updateTransportStatus(
  jobId: string,
  status: TransportJobStatus
): { state: PrototypeState; job?: TransportJob } {
  let state = loadPrototypeState();
  let updated: TransportJob | undefined;
  state = {
    ...state,
    transportJobs: state.transportJobs.map((job) => {
      if (job.id !== jobId) return job;
      updated = { ...job, status };
      return updated;
    }),
  };
  if (updated) {
    state = addTimeline(
      state,
      "Transport status updated",
      `${updated.driver} marked ${updated.livestockCount} as ${formatTransportStatus(status)}.`,
      `/transport/${updated.id}`
    );
    savePrototypeState(state);
  }
  return { state, job: updated };
}

export function formatTransportStatus(status: TransportJobStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createAgreement(listing: PaddockListing, request: LivestockRequest): Agreement {
  const id = `agreement-${Date.now()}`;
  const history: AgreementLifecycleEvent[] = [
    {
      at: nowLabel(),
      from: null,
      to: "Draft",
      byParty: "System",
      note: "Created from paddock match.",
    },
  ];
  return {
    id,
    listingId: listing.id,
    requestId: request.id,
    farmerAId: request.requesterId,
    farmerBId: listing.ownerId,
    status: "Draft",
    livestock: `${request.headCount} ${request.breed} ${request.stockType}`,
    duration: request.duration,
    pickupLocation: request.originLocation ?? mapCoordinates.dale,
    destinationLocation: listing.coordinates ?? coordinateForRegion(listing.regionLabel),
    feed: listing.feedStatus,
    water: listing.waterStatus,
    fencing: listing.fencingStatus,
    transportRequired: request.transportRequired !== "No",
    weeksRemaining: 12,
    lastUpdate: "Workspace opened just now",
    readinessChecklist: [
      { label: "NLIS tagged", complete: true },
      { label: "Vaccination records uploaded", complete: true },
      { label: "PIC verified", complete: true },
      { label: "Transport ready", complete: false },
    ],
    sections: [
      section("parties", "Parties", "Dale Morgan and Brett Donnelly", "Dale Morgan", "Brett Donnelly"),
      section("stock", "Stock", `${request.headCount} ${request.breed} ${request.stockType}`, `${request.headCount} ${request.breed}`, `${request.headCount} ${request.stockType}`),
      section("paddock", "Paddock", `${listing.title}, ${listing.acres} acres`, listing.title, listing.title),
      section("dates", "Dates", request.duration, request.duration, request.duration),
      section("terms", "Rate / Terms", listing.guideTerms, "Discuss terms", listing.guideTerms),
      section("transport", "Transport", request.transportRequired, request.transportRequired, "Driver to be confirmed"),
    ],
    artefacts: [],
    lifecycleHistory: history,
  };
}

function section(
  id: string,
  label: string,
  summary: string,
  farmerAValue: string,
  farmerBValue: string
) {
  return {
    id,
    label,
    summary,
    detail: [
      { label: "Farmer A value", value: farmerAValue },
      { label: "Farmer B value", value: farmerBValue },
    ],
    agreedByA: farmerAValue === farmerBValue,
    agreedByB: farmerAValue === farmerBValue,
  };
}

function createTransportJob(agreement: Agreement, listing: PaddockListing): TransportJob {
  return {
    ...transportJobs[0],
    id: `transport-${Date.now()}`,
    agreementId: agreement.id,
    farmerAId: agreement.farmerAId,
    farmerBId: agreement.farmerBId,
    driverId: "driver-1",
    pickup: "Dale Morgan property, Central West NSW",
    destination: `${listing.title}, ${listing.regionLabel}`,
    pickupLocation: agreement.pickupLocation ?? mapCoordinates.dale,
    destinationLocation: agreement.destinationLocation ?? listing.coordinates,
    currentLocation: mapCoordinates.wayne,
    pickupRegion: "Central West NSW",
    destinationRegion: listing.regionLabel,
    livestockCount: agreement.livestock,
    preferredDate: "Next available Friday",
    driver: "Wayne Hayes",
    status: "available",
    routeSummary: `Central West NSW to ${listing.regionLabel}`,
    agreementContext: {
      duration: agreement.duration,
      weeksRemaining: agreement.weeksRemaining,
      agreementStatus: agreement.status,
    },
    quotes: [],
    acceptedQuoteId: undefined,
  };
}

function mergeById<T extends { id: string }>(seed: T[], stored?: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of seed) byId.set(item.id, item);
  for (const item of stored ?? []) byId.set(item.id, item);
  return Array.from(byId.values());
}

function stateForRegion(region: string): PaddockListing["state"] {
  if (region.includes("QLD")) return "QLD";
  if (region.includes("VIC") || region === "Gippsland") return "VIC";
  return "NSW";
}

function isPersonaId(value: unknown): value is PersonaId {
  return (
    value === "farmer-a" ||
    value === "farmer-b" ||
    value === "driver-1" ||
    value === "driver-2"
  );
}

function nowLabel(): string {
  return new Date().toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
