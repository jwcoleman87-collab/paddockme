"use client";

import {
  agreements,
  farmers,
  getMessages,
  getTransportMessages,
  paddockListings,
  transportJobs,
  type Agreement,
  type AgreementArtefact,
  type Farmer,
  type LivestockRequest,
  type Message,
  type PaddockListing,
  type TransportArtefact,
  type TransportJob,
  type TransportJobStatus,
} from "@/lib/dummyData";
import {
  createLivestockRequest,
  createPaddockListing,
  loadPrototypeState,
  openAgreementForListing,
  requestTransportForAgreement,
  setPrototypePersona,
  updateTransportStatus,
  type PersonaId,
  type PrototypeState,
} from "@/lib/prototypeStore";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Tables } from "@/lib/types/database";

export async function repositoryMode(): Promise<"supabase" | "demo"> {
  return (await getAuthedClient()) ? "supabase" : "demo";
}

export async function listProfiles(): Promise<Farmer[]> {
  return farmers;
}

export function selectPersona(persona: PersonaId): PrototypeState {
  return setPrototypePersona(persona);
}

export async function listLivestockRequests(): Promise<LivestockRequest[]> {
  return loadPrototypeState().livestockRequests;
}

export async function createLivestockRequestRecord(input: {
  stockType: string;
  breed: string;
  headCount: number;
  duration: string;
  preferredRegions: string[];
  transportRequired: LivestockRequest["transportRequired"];
}) {
  return createLivestockRequest(input);
}

export async function listPaddockListings(): Promise<PaddockListing[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return loadPrototypeState().paddockListings;

  const { data, error } = await supabase
    .from("paddocks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return loadPrototypeState().paddockListings;

  const mapped = data.map(mapPaddockRow);
  return mergeListings(mapped, loadPrototypeState().paddockListings);
}

export async function createPaddockListingRecord(input: {
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
}) {
  return createPaddockListing(input);
}

export async function getPaddockListing(id: string): Promise<PaddockListing | undefined> {
  const listings = await listPaddockListings();
  return listings.find((listing) => listing.id === id);
}

export async function listAgreements(): Promise<Agreement[]> {
  return loadPrototypeState().agreements;
}

export async function getAgreementRecord(id: string): Promise<Agreement | undefined> {
  return loadPrototypeState().agreements.find((agreement) => agreement.id === id);
}

export async function openAgreementWorkspace(listingId: string) {
  return openAgreementForListing(listingId);
}

export async function listAgreementSections(agreementId: string) {
  const agreement = await getAgreementRecord(agreementId);
  return agreement?.sections ?? [];
}

export async function listAgreementMessages(agreementId: string): Promise<Message[]> {
  return getMessages(agreementId);
}

export async function listAgreementArtefacts(
  agreementId: string
): Promise<AgreementArtefact[]> {
  const agreement = await getAgreementRecord(agreementId);
  return agreement?.artefacts ?? [];
}

export async function listTransportJobs(): Promise<TransportJob[]> {
  return loadPrototypeState().transportJobs;
}

export async function listAvailableTransportJobs(): Promise<TransportJob[]> {
  return (await listTransportJobs()).filter((job) => job.status === "available");
}

export async function listAcceptedTransportJobs(): Promise<TransportJob[]> {
  return (await listTransportJobs()).filter(
    (job) => job.status !== "available" && job.status !== "cancelled"
  );
}

export async function getTransportJobRecord(
  id: string
): Promise<TransportJob | undefined> {
  return loadPrototypeState().transportJobs.find((job) => job.id === id);
}

export async function requestTransportJob(agreementId: string) {
  return requestTransportForAgreement(agreementId);
}

export async function updateTransportJobStatus(
  jobId: string,
  status: TransportJobStatus
) {
  return updateTransportStatus(jobId, status);
}

export async function listTransportMessages(jobId: string): Promise<Message[]> {
  return getTransportMessages(jobId);
}

export async function listTransportArtefacts(
  jobId: string
): Promise<TransportArtefact[]> {
  const job = await getTransportJobRecord(jobId);
  return job?.artefacts ?? [];
}

export async function listTransportStatusEvents(jobId: string) {
  const job = await getTransportJobRecord(jobId);
  return job?.timeline ?? [];
}

async function getAuthedClient() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? supabase : null;
  } catch {
    return null;
  }
}

function mapPaddockRow(row: Tables<"paddocks">): PaddockListing {
  const stockType = row.capacity_stock_type ?? "Cattle";
  const feedStatus = normaliseFeed(row.pasture_type);
  const waterStatus = normaliseWater(row.water_type?.[0]);

  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    location: row.region,
    region: row.region,
    state: normaliseState(row.state),
    regionLabel: row.region,
    mapPlaceLabel: row.region,
    mapDot: { x: 50, y: 50 },
    mapNearbyPlaces: [],
    acres: row.acres,
    suitableLivestock: [stockType],
    feedStatus,
    waterStatus,
    fencingStatus: row.yards ? "Secure" : "Good",
    verificationStatus: "Verified provider",
    availabilityWindow: row.available_from ?? "Available now",
    guideTerms: row.rate_per_head_week
      ? `$${row.rate_per_head_week}/head/week`
      : "Discuss terms",
    summary: row.description ?? `${row.acres} acres available in ${row.region}.`,
  };
}

function mergeListings(
  primary: PaddockListing[],
  fallback: PaddockListing[]
): PaddockListing[] {
  const byId = new Map<string, PaddockListing>();
  for (const listing of fallback) byId.set(listing.id, listing);
  for (const listing of primary) byId.set(listing.id, listing);
  return Array.from(byId.values());
}

function normaliseFeed(value: string | null): PaddockListing["feedStatus"] {
  if (value === "Excellent" || value === "Good" || value === "Tight") return value;
  return "Good";
}

function normaliseWater(value: string | null | undefined): PaddockListing["waterStatus"] {
  if (value === "Permanent" || value === "Seasonal" || value === "Tank") return value;
  return "Permanent";
}

function normaliseState(value: string): PaddockListing["state"] {
  if (["NSW", "QLD", "VIC", "SA", "WA", "TAS", "NT", "ACT"].includes(value)) {
    return value as PaddockListing["state"];
  }
  return "NSW";
}
