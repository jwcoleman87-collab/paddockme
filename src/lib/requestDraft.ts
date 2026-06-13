import { animalOptions, type StockType } from "@/lib/dummyData";
import type { GeocodedLocation } from "@/lib/locationGeocode";

/**
 * Shared draft for the 2-step "new agistment request" flow
 * (Screen 3 — Stock, Screen 4 — Requirements). Held in sessionStorage so
 * Step 2 can read what Step 1 collected, and "Back" returns to a filled-in
 * Step 1 without re-entering anything.
 */
export type RequestDraft = {
  stockType: StockType;
  breed: string;
  headCount: number;
  originAddress: string;
  confirmedOrigin: GeocodedLocation | null;
  duration: string;
  preferredRegionIds: string[];
  budget: string;
  specialRequirements: string;
};

const STORAGE_KEY = "pm-request-draft";

export const DEFAULT_REQUEST_DRAFT: RequestDraft = {
  stockType: "Cattle",
  breed: animalOptions.Cattle[0],
  headCount: 100,
  originAddress: "",
  confirmedOrigin: null,
  duration: "3-6 months",
  preferredRegionIds: ["southern-nsw"],
  budget: "",
  specialRequirements: "",
};

export function loadRequestDraft(): RequestDraft {
  if (typeof window === "undefined") return DEFAULT_REQUEST_DRAFT;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REQUEST_DRAFT;
    return { ...DEFAULT_REQUEST_DRAFT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REQUEST_DRAFT;
  }
}

export function saveRequestDraft(patch: Partial<RequestDraft>) {
  if (typeof window === "undefined") return;
  const current = loadRequestDraft();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
}

export function clearRequestDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
