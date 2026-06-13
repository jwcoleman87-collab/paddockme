"use client";

import {
  type Agreement,
  type AgreementArtefact,
  type AgreementLifecycleEvent,
  type AgreementLifecycleState,
  type AgreementSection,
  type Farmer,
  type LivestockRequest,
  type Message,
  type PaddockListing,
  type TransportArtefact,
  type TransportJob,
  type TransportJobStatus,
} from "@/lib/dummyData";
import {
  coordinateForRegion,
  mapCoordinates,
  parseCoordinate,
  pointToWkt,
  type Coordinate,
} from "@/lib/mapCoordinates";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

export type RepositoryState = {
  livestockRequests: LivestockRequest[];
  paddockListings: PaddockListing[];
  agreements: Agreement[];
  transportJobs: TransportJob[];
  timelineEntries: Array<{
    id: string;
    at: string;
    title: string;
    detail: string;
    href?: string;
  }>;
};

function emptyRepositoryState(): RepositoryState {
  return {
    livestockRequests: [],
    paddockListings: [],
    agreements: [],
    transportJobs: [],
    timelineEntries: [],
  };
}

export async function listProfiles(): Promise<Farmer[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];
  // Real accounts only ever see real profiles - no demo persona merging.
  const { data, error } = await supabase.from("profiles").select("*");
  if (error || !data) return [];
  return data.map(mapProfileRow);
}

function mapProfileRow(row: Tables<"profiles">): Farmer {
  return {
    id: row.id,
    name: row.full_name ?? "PaddockME user",
    region: row.regions?.[0] ?? "Australia",
    location: parseCoordinate(row.location, coordinateForRegion(row.regions?.[0])),
    role: row.account_types?.includes("Transport Provider")
      ? "Transport Provider"
      : row.account_types?.includes("Landowner")
        ? "Landowner"
        : "Livestock Owner",
    verified: !!row.id_verified,
    // Use the user's own name as a default tagline rather than the literal
    // string "Supabase profile" - the latter showed up in every agreement
    // participant card and looked like a placeholder bug. Bio stays empty
    // until the profile editor is wired (avoiding the same leak).
    tagline: row.full_name ?? "PaddockME member",
    bio: "",
    mobileVerified: !!row.phone,
    preparednessScore: row.id_verified ? 70 : 35,
    verifications: [],
    readiness: [],
  };
}

export async function listLivestockRequests(): Promise<LivestockRequest[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("agistment_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRequestRow);
}

export async function createLivestockRequestRecord(input: {
  stockType: string;
  breed: string;
  headCount: number;
  duration: string;
  preferredRegions: string[];
  transportRequired: LivestockRequest["transportRequired"];
  originAddress?: string;
  originLatitude?: number;
  originLongitude?: number;
  originPlaceId?: string | null;
  /**
   * Free-text "Budget" + "Special requirements" from Screen 4, stored in the
   * otherwise-unused `required_pasture` column to avoid a schema migration.
   */
  requiredPasture?: string | null;
}): Promise<{ state: RepositoryState; request: LivestockRequest } | null> {
  const supabase = await getAuthedClient();
  if (!supabase) return null;

  // Real accounts write to Supabase only - never to browser fallback state, and a
  // failed insert surfaces as null instead of silently returning demo data.
  const user = await getCurrentUser(supabase);
  if (!user) return null;
  await ensureProfile(supabase, user);

  const { data, error } = await supabase
    .from("agistment_requests")
    .insert({
      requester_id: user.id,
      stock_type: input.stockType,
      breed: input.breed,
      head_count: input.headCount,
      duration: input.duration,
      preferred_regions: input.preferredRegions,
      origin_address: input.originAddress ?? null,
      origin_place_id: input.originPlaceId ?? null,
      required_pasture: input.requiredPasture ?? null,
      location: pointToWkt(coordinateFromLatLng(input)),
      status: "open",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return { state: emptyRepositoryState(), request: mapRequestRow(data) };
}

export async function listPaddockListings(): Promise<PaddockListing[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("paddocks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapPaddockRow);
}

/**
 * Strictly Supabase-backed paddock listings, no prototype fallback. Used by
 * surfaces gated behind a real signed-in account (e.g. `/listings`) where we
 * never want to leak retired demo-seed paddocks to a live customer.
 */
export async function listSupabasePaddockListings(): Promise<PaddockListing[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("paddocks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapPaddockRow);
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
  feedNote?: string;
  waterNote?: string;
  fencingNote?: string;
  availabilityWindow: string;
  guideTerms: string;
  summary: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  placeId?: string | null;
}): Promise<{ state: RepositoryState; listing: PaddockListing } | null> {
  const supabase = await getAuthedClient();
  if (!supabase) return null;

  // Real accounts write to Supabase only - never to browser fallback state, and a
  // failed insert surfaces as null instead of silently returning demo data.
  const user = await getCurrentUser(supabase);
  if (!user) return null;
  await ensureProfile(supabase, user);

  const { data, error } = await supabase
    .from("paddocks")
    .insert({
      owner_id: user.id,
      title: input.title,
      address: input.location,
      description: serializePaddockDescription(input),
      region: input.region,
      state: stateForRegion(input.region),
      location: pointToWkt(coordinateFromLatLng(input)),
      place_id: input.placeId ?? null,
      acres: input.acres,
      capacity_stock_type: input.suitableLivestock[0] ?? null,
      pasture_type: input.feedStatus,
      water_type: [input.waterStatus],
      yards: input.summary.toLowerCase().includes("yard"),
      loading_ramp: input.summary.toLowerCase().includes("loading"),
      photos: input.photos && input.photos.length > 0 ? input.photos : null,
      status: "published",
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return { state: emptyRepositoryState(), listing: mapPaddockRow(data) };
}

export async function getPaddockListing(id: string): Promise<PaddockListing | undefined> {
  const listings = await listPaddockListings();
  return listings.find((listing) => listing.id === id);
}

export async function updatePaddockListingRecord(
  listingId: string,
  input: {
    title: string;
    location: string;
    region: string;
    acres: number;
    suitableLivestock: string[];
    feedStatus: PaddockListing["feedStatus"];
    waterStatus: PaddockListing["waterStatus"];
    fencingStatus: PaddockListing["fencingStatus"];
    feedNote?: string;
    waterNote?: string;
    fencingNote?: string;
    availabilityWindow: string;
    guideTerms: string;
    summary: string;
    photos?: string[];
    latitude?: number;
    longitude?: number;
    placeId?: string | null;
  }
): Promise<{ listing: PaddockListing } | null> {
  const supabase = await getAuthedClient();
  if (!supabase) return null;
  const user = await getCurrentUser(supabase);
  if (!user) return null;

  const { data, error } = await supabase
    .from("paddocks")
    .update({
      title: input.title,
      address: input.location,
      description: serializePaddockDescription(input),
      region: input.region,
      state: stateForRegion(input.region),
      location: pointToWkt(coordinateFromLatLng(input)),
      place_id: input.placeId ?? null,
      acres: input.acres,
      capacity_stock_type: input.suitableLivestock[0] ?? null,
      pasture_type: input.feedStatus,
      water_type: [input.waterStatus],
      yards: input.summary.toLowerCase().includes("yard"),
      loading_ramp: input.summary.toLowerCase().includes("loading"),
      photos: input.photos && input.photos.length > 0 ? input.photos : null,
    })
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .select("*")
    .single();

  if (error || !data) return null;
  return { listing: mapPaddockRow(data) };
}

export async function deletePaddockListingRecord(
  listingId: string
): Promise<boolean> {
  const supabase = await getAuthedClient();
  if (!supabase) return false;
  const user = await getCurrentUser(supabase);
  if (!user) return false;
  const { error } = await supabase
    .from("paddocks")
    .delete()
    .eq("id", listingId)
    .eq("owner_id", user.id);
  return !error;
}

export async function listAgreements(): Promise<Agreement[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return Promise.all(data.map((row) => mapAgreementRow(supabase, row)));
}

export async function getAgreementRecord(id: string): Promise<Agreement | undefined> {
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real accounts never fall back to prototype agreements - an unknown id
    // must show "not found", not a demo workspace.
    if (!isUuid(id)) return undefined;
    const { data, error } = await supabase
      .from("agreements")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return mapAgreementRow(supabase, data);
    return undefined;
  }
  return undefined;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await getAuthedClient();
  if (!supabase) return null;
  const user = await getCurrentUser(supabase);
  return user?.id ?? null;
}

export async function openAgreementWorkspace(
  listingId: string,
  requestId?: string
): Promise<{ state: RepositoryState; agreement: Agreement | null }> {
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real (signed-in) account: only ever return a genuine Supabase agreement.
    // Never fall back to a prototype id - those can't be reopened later, which
    // is exactly what produced the dead "agreement-..." workspaces.
    if (isUuid(listingId) && requestId && isUuid(requestId)) {
      const created = await createSupabaseAgreementForListing(
        supabase,
        listingId,
        requestId
      );
      if (created) return { state: emptyRepositoryState(), agreement: created };
    }
    return { state: emptyRepositoryState(), agreement: null };
  }
  return { state: emptyRepositoryState(), agreement: null };
}

/**
 * Landowner offers one of their paddocks against an open livestock request.
 *
 * Signed-in accounts create (or reuse) a genuine Supabase agreement so BOTH
 * parties open the exact same workspace. We never fall back to a prototype
 * agreement for real users - those are browser-only fallback records,
 * so the livestock owner could never see them (each side ended up on a
 * different "workspace" with different content and a dead chat).
 */
export async function offerPaddockForRequest(
  requestId: string,
  listingId: string
): Promise<{ state: RepositoryState; agreement: Agreement | null }> {
  const supabase = await getAuthedClient();
  if (supabase) {
    if (isUuid(requestId) && isUuid(listingId)) {
      const created = await createSupabaseAgreementForRequestOffer(
        supabase,
        requestId,
        listingId
      );
      if (created) return { state: emptyRepositoryState(), agreement: created };
    }
    return { state: emptyRepositoryState(), agreement: null };
  }
  return { state: emptyRepositoryState(), agreement: null };
}

export async function listAgreementSections(agreementId: string) {
  const agreement = await getAgreementRecord(agreementId);
  return agreement?.sections ?? [];
}

export async function listAgreementMessages(agreementId: string): Promise<Message[]> {
  const supabase = await getAuthedClient();
  if (supabase) {
    if (!isUuid(agreementId)) return [];
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("agreement_id", agreementId)
      .order("created_at", { ascending: true });
    if (!error && data) return data.map((row) => mapMessageRow(row, agreementId));
    return [];
  }
  return [];
}

export async function listAgreementArtefacts(
  agreementId: string
): Promise<AgreementArtefact[]> {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(agreementId)) {
    const [{ data, error }, { data: agreement }] = await Promise.all([
      supabase
        .from("agreement_artefacts")
        .select("*")
        .eq("agreement_id", agreementId)
        .order("created_at", { ascending: true }),
      supabase
        .from("agreements")
        .select("livestock_owner_id, landowner_id")
        .eq("id", agreementId)
        .maybeSingle(),
    ]);
    if (!error && data) {
      return data.map((row) =>
        mapAgreementArtefactRow(row, agreement ?? undefined)
      );
    }
  }
  const agreement = await getAgreementRecord(agreementId);
  return agreement?.artefacts ?? [];
}

export async function createAgreementArtefact(input: {
  agreementId: string;
  label: string;
  description: string;
  kind: AgreementArtefact["kind"];
  sectionId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
}): Promise<AgreementArtefact | null> {
  const supabase = await getAuthedClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user || !isUuid(input.agreementId)) return null;

  const { data, error } = await supabase
    .from("agreement_artefacts")
    .insert({
      agreement_id: input.agreementId,
      uploaded_by: user.id,
      label: input.label,
      description: input.description,
      kind: input.kind,
      section_key: input.sectionId ?? null,
      metadata: {
        source: "workspace_upload",
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        fileDataUrl: input.fileDataUrl,
      },
      storage_path: input.fileName ?? null,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  const { data: agreement } = await supabase
    .from("agreements")
    .select("livestock_owner_id, landowner_id")
    .eq("id", input.agreementId)
    .maybeSingle();
  return mapAgreementArtefactRow(data, agreement ?? undefined);
}

export async function listTransportJobs(): Promise<TransportJob[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transport_jobs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return Promise.all(data.map((row) => mapTransportJobRow(supabase, row)));
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
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real accounts never fall back to prototype transport jobs.
    if (!isUuid(id)) return undefined;
    const { data, error } = await supabase
      .from("transport_jobs")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return mapTransportJobRow(supabase, data);
    return undefined;
  }
  return undefined;
}

export async function requestTransportJob(
  agreementId: string
): Promise<{ state: RepositoryState; job: TransportJob | null }> {
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real accounts only create genuine Supabase transport jobs.
    if (isUuid(agreementId)) {
      const created = await createSupabaseTransportJob(supabase, agreementId);
      if (created) return { state: emptyRepositoryState(), job: created };
    }
    return { state: emptyRepositoryState(), job: null };
  }
  return { state: emptyRepositoryState(), job: null };
}

export async function updateTransportJobStatus(
  jobId: string,
  status: TransportJobStatus
): Promise<{ state: RepositoryState; job: TransportJob | null }> {
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real accounts never mutate prototype transport state.
    if (!isUuid(jobId)) return { state: emptyRepositoryState(), job: null };
    const user = await getCurrentUser(supabase);
    const existing = await getTransportJobRecord(jobId);
    const update: TablesUpdate<"transport_jobs"> = { status };
    if (status === "accepted") {
      if (!user) return { state: emptyRepositoryState(), job: existing ?? null };
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, account_types")
        .eq("id", user.id)
        .maybeSingle();
      if (
        !profile?.account_types?.includes("Transport Provider") ||
        isRemovedTestProfileName(profile.full_name)
      ) {
        return { state: emptyRepositoryState(), job: existing ?? null };
      }
      update.driver_id = user.id;
    }
    const { data, error } = await supabase
      .from("transport_jobs")
      .update(update)
      .eq("id", jobId)
      .select("*")
      .single();
    if (!error && data && user) {
      await ensureTransportMilestones(supabase, data);
      await autoPassMilestonesForStatus(supabase, data.id, status, user.id);
      await supabase.from("transport_status_events").insert({
        transport_job_id: jobId,
        from_status: existing?.status ?? null,
        to_status: status,
        changed_by: user.id,
        note: `Status changed to ${formatStatus(status)}.`,
      });
      return { state: emptyRepositoryState(), job: await mapTransportJobRow(supabase, data) };
    }
    return { state: emptyRepositoryState(), job: existing ?? null };
  }
  return { state: emptyRepositoryState(), job: null };
}

export async function listTransportMessages(jobId: string): Promise<Message[]> {
  const supabase = await getAuthedClient();
  if (supabase) {
    if (!isUuid(jobId)) return [];
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("transport_job_id", jobId)
      .order("created_at", { ascending: true });
    if (!error && data) return data.map((row) => mapMessageRow(row, jobId));
    return [];
  }
  return [];
}

export async function listTransportArtefacts(
  jobId: string
): Promise<TransportArtefact[]> {
  const job = await getTransportJobRecord(jobId);
  return job?.artefacts ?? [];
}

export async function listTransportStatusEvents(jobId: string) {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(jobId)) {
    const { data, error } = await supabase
      .from("transport_status_events")
      .select("*")
      .eq("transport_job_id", jobId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      return data.map((event) => ({
        title: formatStatus(event.to_status as TransportJobStatus),
        detail: event.note ?? `Status changed to ${formatStatus(event.to_status as TransportJobStatus)}.`,
        complete: true,
      }));
    }
  }
  const job = await getTransportJobRecord(jobId);
  return job?.timeline ?? [];
}

export type TransportMilestone = {
  id: string;
  label: string;
  description: string;
  sortOrder: number;
  status: "pending" | "passed";
  passedAt: string | null;
};

export async function listTransportMilestones(
  jobId: string
): Promise<TransportMilestone[]> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(jobId)) return [];
  const { data, error } = await (supabase as any)
    .from("transport_milestones")
    .select("*")
    .eq("transport_job_id", jobId)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map(mapTransportMilestoneRow);
}

export async function passTransportMilestone(input: {
  jobId: string;
  milestoneId: string;
}): Promise<TransportMilestone | null> {
  const supabase = await getAuthedClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user || !isUuid(input.jobId) || !isUuid(input.milestoneId)) {
    return null;
  }

  const { data: milestone } = await (supabase as any)
    .from("transport_milestones")
    .select("*")
    .eq("id", input.milestoneId)
    .eq("transport_job_id", input.jobId)
    .maybeSingle();
  if (!milestone || milestone.status === "passed") {
    return milestone ? mapTransportMilestoneRow(milestone) : null;
  }

  const passedAt = new Date().toISOString();
  const { data, error } = await (supabase as any)
    .from("transport_milestones")
    .update({
      status: "passed",
      passed_at: passedAt,
      passed_by: user.id,
    })
    .eq("id", input.milestoneId)
    .select("*")
    .single();
  if (error || !data) return null;

  const job = await getTransportJobRecord(input.jobId);
  await supabase.from("transport_status_events").insert({
    transport_job_id: input.jobId,
    from_status: job?.status ?? null,
    to_status: job?.status ?? "in_transit",
    changed_by: user.id,
    note: `Milestone passed: ${data.label}.`,
  });
  return mapTransportMilestoneRow(data);
}

export type AgreementSettlementSummary = {
  id: string;
  agreementId: string;
  transportJobId: string | null;
  status: "awaiting_payment" | "payment_recorded" | string;
  amountCents: number;
  currency: string;
  description: string;
  payerProfileId: string;
  payeeProfileId: string;
  createdAt: string;
  updatedAt: string;
};

export async function getAgreementSettlementForTransportJob(
  jobId: string
): Promise<AgreementSettlementSummary | null> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(jobId)) return null;
  const { data: job } = await supabase
    .from("transport_jobs")
    .select("agreement_id")
    .eq("id", jobId)
    .maybeSingle();
  if (!job?.agreement_id) return null;
  const { data, error } = await (supabase as any)
    .from("payables")
    .select("*")
    .eq("agreement_id", job.agreement_id)
    .eq("kind", "agistment")
    .maybeSingle();
  if (error || !data) return null;
  return mapSettlementRow(data);
}

export async function createAgreementMessage(input: {
  agreementId: string;
  body: string;
  sectionId?: string;
}): Promise<Message | null> {
  const supabase = await getAuthedClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user || !isUuid(input.agreementId)) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      agreement_id: input.agreementId,
      sender_id: user.id,
      section_id: input.sectionId,
      body: input.body,
    })
    .select("*, profiles(full_name)")
    .single();
  if (error || !data) return null;
  return mapMessageRow(data, input.agreementId);
}

export async function createTransportMessage(input: {
  transportJobId: string;
  body: string;
  sectionId?: string;
}): Promise<Message | null> {
  const supabase = await getAuthedClient();
  const user = supabase ? await getCurrentUser(supabase) : null;
  if (!supabase || !user || !isUuid(input.transportJobId)) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      transport_job_id: input.transportJobId,
      sender_id: user.id,
      section_id: input.sectionId,
      body: input.body,
    })
    .select("*, profiles(full_name)")
    .single();
  if (error || !data) return null;
  return mapMessageRow(data, input.transportJobId);
}

/**
 * Persist a lifecycle change (Draft -> Negotiating -> ... -> Completed /
 * Cancelled) so the other party sees the same stage. Previously this state
 * lived only in component memory and reset on every page load.
 */
export async function updateAgreementStatusRecord(
  agreementId: string,
  status: AgreementLifecycleState
): Promise<boolean> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(agreementId)) return false;
  const { error } = await supabase
    .from("agreements")
    .update({ status })
    .eq("id", agreementId);
  return !error;
}

export type AgreementLiveState = {
  status: AgreementLifecycleState;
  sections: {
    id: string;
    agreedByA: boolean;
    agreedByB: boolean;
    valueA: string;
    valueB: string;
  }[];
};

/**
 * Light read of the bits of workspace state the other party can change:
 * lifecycle status + per-section agree flags. Polled by the workspace so
 * both farmers stay in sync without a manual refresh.
 */
export async function getAgreementLiveState(
  agreementId: string
): Promise<AgreementLiveState | null> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(agreementId)) return null;
  const [{ data: agreement }, { data: sections }] = await Promise.all([
    supabase
      .from("agreements")
      .select("status")
      .eq("id", agreementId)
      .maybeSingle(),
    supabase
      .from("agreement_sections")
      .select("section_key, agreed_by_a, agreed_by_b, farmer_a_value, farmer_b_value")
      .eq("agreement_id", agreementId),
  ]);
  if (!agreement) return null;
  return {
    status: normaliseAgreementStatus(agreement.status),
    sections: (sections ?? []).map((row) => ({
      id: row.section_key,
      agreedByA: row.agreed_by_a,
      agreedByB: row.agreed_by_b,
      valueA: jsonValueToText(row.farmer_a_value),
      valueB: jsonValueToText(row.farmer_b_value),
    })),
  };
}

/**
 * One party edits their side of a section (dates, pickup address, terms...).
 * Any change resets BOTH agree ticks - new wording needs fresh agreement
 * from both sides.
 */
export async function updateAgreementSectionValue(input: {
  agreementId: string;
  sectionId: string;
  party: "A" | "B";
  value: string;
}): Promise<boolean> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(input.agreementId)) return false;
  const patch: TablesUpdate<"agreement_sections"> = {
    agreed_by_a: false,
    agreed_by_b: false,
    status: "pending",
  };
  if (input.party === "A") patch.farmer_a_value = { value: input.value };
  else patch.farmer_b_value = { value: input.value };
  const { error } = await supabase
    .from("agreement_sections")
    .update(patch)
    .eq("agreement_id", input.agreementId)
    .eq("section_key", input.sectionId);
  return !error;
}

export async function updateAgreementSectionAgreement(input: {
  agreementId: string;
  sectionId: string;
  agreedByA: boolean;
  agreedByB: boolean;
}): Promise<void> {
  const supabase = await getAuthedClient();
  if (!supabase || !isUuid(input.agreementId)) return;
  await supabase
    .from("agreement_sections")
    .update({
      agreed_by_a: input.agreedByA,
      agreed_by_b: input.agreedByB,
      status: input.agreedByA && input.agreedByB ? "agreed" : "pending",
    })
    .eq("agreement_id", input.agreementId)
    .eq("section_key", input.sectionId);
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

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof getAuthedClient>>>;

async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function ensureProfile(supabase: SupabaseClient, user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) return;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email ?? "PaddockME user",
    },
    { onConflict: "id" }
  );
}

function mapRequestRow(row: Tables<"agistment_requests">): LivestockRequest {
  return {
    id: row.id,
    requesterId: row.requester_id,
    stockType: row.stock_type,
    breed: row.breed ?? "Mixed",
    headCount: row.head_count,
    duration: row.duration,
    originLocation: parseCoordinate(
      row.location,
      coordinateForRegion(row.preferred_regions?.[0])
    ),
    preferredRegions: row.preferred_regions ?? [],
    transportRequired: "Unsure",
  };
}

function mapPaddockRow(row: Tables<"paddocks">): PaddockListing {
  const stockType = row.capacity_stock_type ?? "Cattle";
  const feedStatus = normaliseFeed(row.pasture_type);
  const waterStatus = normaliseWater(row.water_type?.[0]);
  const coordinates = parseCoordinate(row.location, coordinateForRegion(row.region));
  const description = parsePaddockDescription(row.description);

  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    location: row.address ?? row.region,
    coordinates,
    region: row.region,
    state: normaliseState(row.state),
    regionLabel: row.region,
    mapPlaceLabel: row.address ?? row.region,
    mapDot: { x: 50, y: 50 },
    mapNearbyPlaces: [],
    acres: row.acres,
    suitableLivestock: [stockType],
    feedStatus,
    waterStatus,
    fencingStatus: row.yards ? "Secure" : "Good",
    feedNote: description.feedNote,
    waterNote: description.waterNote,
    fencingNote: description.fencingNote,
    verificationStatus: "Verified provider",
    availabilityWindow: row.available_from ?? "Available now",
    guideTerms: row.rate_per_head_week
      ? `$${row.rate_per_head_week}/head/week`
      : "Discuss terms",
    summary: description.summary ?? `${row.acres} acres available in ${row.region}.`,
    photos: row.photos ?? undefined,
  };
}

type PaddockDescriptionInput = {
  summary: string;
  feedNote?: string;
  waterNote?: string;
  fencingNote?: string;
};

type PaddockDescriptionPayload = {
  version: 1;
  summary: string;
  tileNotes?: {
    feed?: string;
    water?: string;
    fencing?: string;
  };
};

function serializePaddockDescription(input: PaddockDescriptionInput): string {
  const payload: PaddockDescriptionPayload = {
    version: 1,
    summary: input.summary,
    tileNotes: {
      feed: cleanOptionalText(input.feedNote),
      water: cleanOptionalText(input.waterNote),
      fencing: cleanOptionalText(input.fencingNote),
    },
  };
  return JSON.stringify(payload);
}

function parsePaddockDescription(value: string | null): {
  summary?: string;
  feedNote?: string;
  waterNote?: string;
  fencingNote?: string;
} {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Partial<PaddockDescriptionPayload>;
    if (parsed && typeof parsed === "object" && parsed.version === 1) {
      return {
        summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
        feedNote: cleanOptionalText(parsed.tileNotes?.feed),
        waterNote: cleanOptionalText(parsed.tileNotes?.water),
        fencingNote: cleanOptionalText(parsed.tileNotes?.fencing),
      };
    }
  } catch {
    // Existing rows store description as plain text.
  }
  return { summary: value };
}

function cleanOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

async function createSupabaseAgreementForListing(
  supabase: SupabaseClient,
  listingId: string,
  requestId?: string
): Promise<Agreement | null> {
  const user = await getCurrentUser(supabase);
  if (!user) return null;
  await ensureProfile(supabase, user);

  const { data: listing } = await supabase
    .from("paddocks")
    .select("*")
    .eq("id", listingId)
    .single();
  if (!listing) return null;

  if (!requestId || !isUuid(requestId)) return null;
  const { data: request } = await supabase
    .from("agistment_requests")
    .select("*")
    .eq("id", requestId)
    .eq("requester_id", user.id)
    .maybeSingle();
  if (!request) return null;

  return findOrCreateSupabaseAgreement(supabase, request, listing);
}

/**
 * Landowner side of workspace creation: the signed-in user owns the paddock
 * and is offering it against someone else's open livestock request.
 */
async function createSupabaseAgreementForRequestOffer(
  supabase: SupabaseClient,
  requestId: string,
  listingId: string
): Promise<Agreement | null> {
  const user = await getCurrentUser(supabase);
  if (!user) return null;
  await ensureProfile(supabase, user);

  // The paddock being offered must belong to the signed-in landowner.
  const { data: listing } = await supabase
    .from("paddocks")
    .select("*")
    .eq("id", listingId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!listing) return null;

  const { data: request } = await supabase
    .from("agistment_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (!request) return null;

  return findOrCreateSupabaseAgreement(supabase, request, listing);
}

/**
 * Shared find-or-create for the request<->paddock pairing. Both entry points
 * (livestock owner opening from a listing, landowner offering against a
 * request) funnel through here so both parties always land on the SAME
 * agreement row.
 *
 * Note: this deliberately selects-then-inserts rather than upserting. The
 * `matches` table has insert + select RLS policies but no update policy, so
 * an upsert hitting an existing row failed with an RLS error for whichever
 * party arrived second - which is how the two farmers ended up on different
 * workspaces.
 */
async function findOrCreateSupabaseAgreement(
  supabase: SupabaseClient,
  request: Tables<"agistment_requests">,
  listing: Tables<"paddocks">
): Promise<Agreement | null> {
  let match: Tables<"matches"> | null = null;
  const { data: existingMatch } = await supabase
    .from("matches")
    .select("*")
    .eq("request_id", request.id)
    .eq("paddock_id", listing.id)
    .maybeSingle();
  match = existingMatch ?? null;

  if (!match) {
    const { data: insertedMatch, error: matchError } = await supabase
      .from("matches")
      .insert({
        request_id: request.id,
        paddock_id: listing.id,
        match_score: 85,
        match_reasons: { source: "mvp_build_03" },
        status: "selected",
      })
      .select("*")
      .single();
    if (matchError || !insertedMatch) return null;
    match = insertedMatch;
  }

  // Reuse an existing agreement for this pairing instead of creating duplicates
  // when the button is clicked more than once (or by the other party).
  const { data: existingAgreement } = await supabase
    .from("agreements")
    .select("*")
    .eq("match_id", match.id)
    .maybeSingle();
  if (existingAgreement) return mapAgreementRow(supabase, existingAgreement);

  const { data: agreement, error: agreementError } = await supabase
    .from("agreements")
    .insert({
      match_id: match.id,
      livestock_owner_id: request.requester_id,
      landowner_id: listing.owner_id,
      head_count: request.head_count,
      duration_months: durationMonths(request.duration),
      rate_per_head_week: listing.rate_per_head_week,
      transport_required: true,
      pickup_address: request.origin_address ?? "Pickup address to confirm",
      destination_address: listing.address ?? listing.title,
      pickup_location: pointToWkt(parseCoordinate(request.location, mapCoordinates.cowra)),
      destination_location: pointToWkt(parseCoordinate(listing.location, coordinateForRegion(listing.region))),
      status: "Draft",
      alignment_state: { source: "mvp_build_03" },
    })
    .select("*")
    .single();
  if (agreementError || !agreement) return null;

  const sections = buildAgreementSections(agreement.id, request, listing);
  await supabase.from("agreement_sections").insert(sections);
  return mapAgreementRow(supabase, agreement);
}

async function createSupabaseTransportJob(
  supabase: SupabaseClient,
  agreementId: string
): Promise<TransportJob | null> {
  const { data: agreement } = await supabase
    .from("agreements")
    .select("*")
    .eq("id", agreementId)
    .single();
  if (!agreement) return null;

  const existing = await supabase
    .from("transport_jobs")
    .select("*")
    .eq("agreement_id", agreementId)
    .maybeSingle();
  if (existing.data) return mapTransportJobRow(supabase, existing.data);

  const { data: match } = await supabase
    .from("matches")
    .select("request_id, paddock_id")
    .eq("id", agreement.match_id)
    .maybeSingle();
  if (!match) return null;

  const [{ data: request }, { data: listing }, { data: sections }] =
    await Promise.all([
      supabase
        .from("agistment_requests")
        .select("origin_address, location, stock_type, breed, head_count, duration")
        .eq("id", match.request_id)
        .maybeSingle(),
      supabase
        .from("paddocks")
        .select("title, address, region, location")
        .eq("id", match.paddock_id)
        .maybeSingle(),
      supabase
        .from("agreement_sections")
        .select("section_key, farmer_a_value, farmer_b_value, agreed_by_a, agreed_by_b")
        .eq("agreement_id", agreement.id),
    ]);
  if (!request || !listing) return null;

  const pickupAddress = confirmedAddress(
    agreement.pickup_address ?? request.origin_address
  );
  const destinationAddress = confirmedAddress(
    agreement.destination_address ?? listing.address ?? listing.title
  );
  const pickupCoordinate = parseCoordinate(agreement.pickup_location);
  const destinationCoordinate = parseCoordinate(agreement.destination_location);
  const startDate =
    confirmedAgreementSectionValue(sections ?? [], "start_date") ??
    confirmedAddress(agreement.start_date);

  if (!pickupAddress || !destinationAddress || !pickupCoordinate || !destinationCoordinate || !startDate) {
    return null;
  }

  const distanceKm = distanceInKm(pickupCoordinate, destinationCoordinate);
  const livestockCount = `${request.head_count} ${request.breed ?? ""} ${request.stock_type}`.trim();
  const routeSummary = `${Math.round(distanceKm)} km: ${pickupAddress} to ${destinationAddress}`;

  const { data, error } = await supabase
    .from("transport_jobs")
    .insert({
      agreement_id: agreement.id,
      livestock_owner_id: agreement.livestock_owner_id,
      landowner_id: agreement.landowner_id,
      pickup_address: pickupAddress,
      destination_address: destinationAddress,
      livestock_count: livestockCount,
      pickup_location: pointToWkt(pickupCoordinate),
      destination_location: pointToWkt(destinationCoordinate),
      current_location: pointToWkt(pickupCoordinate),
      preferred_date: startDate,
      route_summary: routeSummary,
      status: "available",
      coordination_state: {
        source: "rft_v1",
        route_distance_km: Math.round(distanceKm),
        pickup_confirmed: true,
        destination_confirmed: true,
        timing_confirmed: true,
        load_confirmed: true,
      },
    })
    .select("*")
    .single();
  if (error || !data) return null;
  await ensureTransportMilestones(supabase, data);
  return mapTransportJobRow(supabase, data);
}

async function ensureTransportMilestones(
  supabase: SupabaseClient,
  job: Pick<
    Tables<"transport_jobs">,
    "id" | "pickup_address" | "destination_address" | "pickup_location" | "destination_location"
  >
) {
  const { data: existing } = await (supabase as any)
    .from("transport_milestones")
    .select("id")
    .eq("transport_job_id", job.id)
    .limit(1);
  if (existing?.length) return;

  const pickup = job.pickup_address ?? "pickup";
  const destination = job.destination_address ?? "destination";
  const milestones = [
    ["loaded", "Loaded", `Stock loaded at ${pickup}.`],
    ["departed", "Departed", `Truck has left ${pickup}.`],
    ["quarter", "Quarter way", "First quarter of the run has been passed."],
    ["halfway", "Halfway", "Truck has passed the halfway point."],
    ["three-quarter", "Three-quarter way", "Final quarter of the run is coming up."],
    ["arriving", "Arriving", `Truck is approaching ${destination}.`],
    ["delivered", "Delivered", `Stock delivered at ${destination}.`],
  ] as const;

  await (supabase as any).from("transport_milestones").insert(
    milestones.map(([, label, description], index) => ({
      transport_job_id: job.id,
      label,
      description,
      sort_order: index + 1,
      status: "pending",
    }))
  );
}

async function autoPassMilestonesForStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: TransportJobStatus,
  userId: string
) {
  const maxSortOrder =
    status === "loading"
      ? 1
      : status === "in_transit"
        ? 2
        : status === "arrived"
          ? 6
          : status === "completed"
            ? 7
            : 0;
  if (maxSortOrder === 0) return;

  const passedAt = new Date().toISOString();
  await (supabase as any)
    .from("transport_milestones")
    .update({
      status: "passed",
      passed_at: passedAt,
      passed_by: userId,
    })
    .eq("transport_job_id", jobId)
    .lte("sort_order", maxSortOrder)
    .eq("status", "pending");
}

async function mapAgreementRow(
  supabase: SupabaseClient,
  row: Tables<"agreements">
): Promise<Agreement> {
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", row.match_id)
    .maybeSingle();

  const { data: request } = match?.request_id
    ? await supabase
        .from("agistment_requests")
        .select("*")
        .eq("id", match.request_id)
        .maybeSingle()
    : { data: null };

  const { data: listing } = match?.paddock_id
    ? await supabase
        .from("paddocks")
        .select("*")
        .eq("id", match.paddock_id)
        .maybeSingle()
    : { data: null };

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [row.livestock_owner_id, row.landowner_id]);

  const profilesById = new Map(
    (profileRows ?? []).map((profile) => [profile.id, profile.full_name])
  );

  const { data: sectionRows } = await supabase
    .from("agreement_sections")
    .select("*")
    .eq("agreement_id", row.id)
    .order("sort_order", { ascending: true });

  const { data: artefactRows } = await supabase
    .from("agreement_artefacts")
    .select("*")
    .eq("agreement_id", row.id)
    .order("created_at", { ascending: true });

  const sections = sectionRows?.length
    ? sectionRows.map(mapAgreementSectionRow)
    : [];

  return {
    id: row.id,
    listingId: match?.paddock_id ?? "",
    requestId: match?.request_id ?? "",
    listingTitle: listing?.title ?? undefined,
    listingLocation: listing?.region ?? undefined,
    farmerAId: row.livestock_owner_id,
    farmerBId: row.landowner_id,
    farmerAName: profilesById.get(row.livestock_owner_id) ?? "Livestock owner",
    farmerBName: profilesById.get(row.landowner_id) ?? "Landowner",
    status: normaliseAgreementStatus(row.status),
    livestock: request
      ? `${request.head_count} ${request.breed ?? ""} ${request.stock_type}`.trim()
      : row.head_count
        ? `${row.head_count} head`
        : "Livestock",
    duration: request?.duration ?? (row.duration_months ? `${row.duration_months} months` : "Discuss"),
    pickupLocation: parseCoordinate(row.pickup_location, request ? parseCoordinate(request.location, mapCoordinates.cowra) : mapCoordinates.cowra),
    destinationLocation: parseCoordinate(row.destination_location, listing ? parseCoordinate(listing.location, coordinateForRegion(listing.region)) : mapCoordinates.gundagai),
    feed: listing?.pasture_type ?? "Discuss",
    water: listing?.water_type?.[0] ?? "Discuss",
    fencing: listing?.yards ? "Secure" : "Good",
    transportRequired: row.transport_required ?? false,
    weeksRemaining: 0,
    lastUpdate: "Saved in Supabase",
    readinessChecklist: [],
    sections,
    artefacts: artefactRows?.map((artefact) => mapAgreementArtefactRow(artefact, row)) ?? [],
    lifecycleHistory: [
      {
        at: row.created_at ?? new Date().toISOString(),
        from: null,
        to: normaliseAgreementStatus(row.status),
        byParty: "System",
        note: "Loaded from Supabase.",
      } satisfies AgreementLifecycleEvent,
    ],
  };
}

function mapAgreementArtefactRow(
  row: Tables<"agreement_artefacts">,
  agreement?: Pick<Tables<"agreements">, "livestock_owner_id" | "landowner_id">
): AgreementArtefact {
  const metadata = readArtefactMetadata(row.metadata);
  return {
    id: row.id,
    label: row.label,
    kind: normaliseArtefactKind(row.kind),
    uploadedBy:
      agreement && row.uploaded_by === agreement.landowner_id
        ? "farmerB"
        : "farmerA",
    description: row.description ?? "",
    sectionId: row.section_key ?? undefined,
    fileName: metadata.fileName ?? row.storage_path ?? undefined,
    fileType: metadata.fileType,
    fileSize: metadata.fileSize,
    fileDataUrl: metadata.fileDataUrl,
  };
}

function readArtefactMetadata(metadata: Json): {
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
} {
  if (!metadata || Array.isArray(metadata) || typeof metadata !== "object") {
    return {};
  }
  return {
    fileName: typeof metadata.fileName === "string" ? metadata.fileName : undefined,
    fileType: typeof metadata.fileType === "string" ? metadata.fileType : undefined,
    fileSize: typeof metadata.fileSize === "number" ? metadata.fileSize : undefined,
    fileDataUrl:
      typeof metadata.fileDataUrl === "string" ? metadata.fileDataUrl : undefined,
  };
}

function normaliseArtefactKind(value: string): AgreementArtefact["kind"] {
  if (value === "photo" || value === "document" || value === "map") return value;
  return "document";
}

function mapAgreementSectionRow(row: Tables<"agreement_sections">): AgreementSection {
  const farmerAValue = jsonValueToText(row.farmer_a_value);
  const farmerBValue = jsonValueToText(row.farmer_b_value);
  return {
    id: row.section_key,
    label: row.label,
    summary: farmerAValue === farmerBValue ? farmerAValue : `${farmerAValue} / ${farmerBValue}`,
    detail: [
      { label: "Livestock owner value", value: farmerAValue },
      { label: "Landowner value", value: farmerBValue },
    ],
    agreedByA: row.agreed_by_a,
    agreedByB: row.agreed_by_b,
  };
}

function buildAgreementSections(
  agreementId: string,
  request: Tables<"agistment_requests">,
  listing: Tables<"paddocks">
): TablesInsert<"agreement_sections">[] {
  const stockOwnerValue = `${request.head_count} ${request.breed ?? ""} ${request.stock_type}`.trim();
  const stockLandownerValue = `${request.head_count} ${request.stock_type}`.trim();
  const rate = listing.rate_per_head_week
    ? `$${listing.rate_per_head_week}/head/week`
    : "Discuss rate";
  const transportOwnerValue = "Transport required";
  const transportLandownerValue = request.origin_address && listing.address
    ? `${request.origin_address} to ${listing.address}`
    : "Pickup and delivery to confirm";
  const specialCondition = listing.title
    ? `Paddock: ${listing.title}${listing.address ? `, ${listing.address}` : ""}`
    : "No special conditions recorded yet";
  const values = [
    ["stock_type", "Stock type", stockOwnerValue, stockLandownerValue],
    ["duration", "Duration", request.duration, request.duration],
    ["rate", "Rate", "Discuss rate", rate],
    ["start_date", "Start date", "Start date to confirm", "Start date to confirm"],
    ["transport", "Transport", transportOwnerValue, transportLandownerValue],
    ["special_conditions", "Special conditions", "No special conditions recorded yet", specialCondition],
  ] as const;

  return values.map(([key, label, farmerAValue, farmerBValue], index) => {
    const agreed = farmerAValue === farmerBValue;
    return {
      agreement_id: agreementId,
      section_key: key,
      label,
      farmer_a_value: { value: farmerAValue },
      farmer_b_value: { value: farmerBValue },
      agreed_by_a: agreed,
      agreed_by_b: agreed,
      status: agreed ? "agreed" : "needs_attention",
      sort_order: index + 1,
    };
  });
}

async function mapTransportJobRow(
  supabase: SupabaseClient,
  row: Tables<"transport_jobs">
): Promise<TransportJob> {
  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      [row.livestock_owner_id, row.landowner_id, row.driver_id].filter(
        Boolean
      ) as string[]
    );

  const profilesById = new Map(
    (profileRows ?? []).map((profile) => [profile.id, profile.full_name])
  );

  const { data: agreement } = row.agreement_id
    ? await supabase
        .from("agreements")
        .select("match_id, duration_months, status")
        .eq("id", row.agreement_id)
        .maybeSingle()
    : { data: null };

  const { data: match } = agreement?.match_id
    ? await supabase
        .from("matches")
        .select("request_id, paddock_id")
        .eq("id", agreement.match_id)
        .maybeSingle()
    : { data: null };

  const { data: request } = match?.request_id
    ? await supabase
        .from("agistment_requests")
        .select("location, stock_type, breed, head_count, duration")
        .eq("id", match.request_id)
        .maybeSingle()
    : { data: null };

  const { data: listing } = match?.paddock_id
    ? await supabase
        .from("paddocks")
        .select("title, region, location")
        .eq("id", match.paddock_id)
        .maybeSingle()
    : { data: null };

  const farmerAName = profilesById.get(row.livestock_owner_id) ?? "Livestock owner";
  const farmerBName = profilesById.get(row.landowner_id) ?? "Landowner";
  const rawDriverName = row.driver_id ? profilesById.get(row.driver_id) : null;
  const removedTestDriver = isRemovedTestProfileName(rawDriverName);
  const driverName = row.driver_id && !removedTestDriver
    ? rawDriverName ?? "Assigned driver"
    : "Unassigned";
  const pickupFallback = request?.location
    ? `${farmerAName}'s property`
    : `${farmerAName}'s property`;
  const destinationFallback = listing
    ? `${listing.title}, ${listing.region ?? "paddock"}`
    : `${farmerBName}'s paddock`;
  const pickup =
    !row.pickup_address || row.pickup_address === "Livestock owner property"
      ? pickupFallback
      : row.pickup_address;
  const destination =
    !row.destination_address || row.destination_address === "Selected paddock"
      ? destinationFallback
      : row.destination_address;
  const livestockCount = row.livestock_count ?? (request
    ? `${request.head_count} ${request.breed ?? ""} ${request.stock_type}`.trim()
    : "Livestock movement");
  const routeSummary =
    !row.route_summary || row.route_summary === "Pickup to selected agistment paddock"
      ? `${pickup} to ${destination}`
      : row.route_summary;

  return {
    id: row.id,
    agreementId: row.agreement_id,
    farmerAId: row.livestock_owner_id,
    farmerBId: row.landowner_id,
    farmerAName,
    farmerBName,
    driverId: removedTestDriver ? "" : row.driver_id ?? "",
    pickup,
    destination,
    pickupLocation: parseCoordinate(row.pickup_location, request ? parseCoordinate(request.location, mapCoordinates.cowra) : mapCoordinates.cowra),
    destinationLocation: parseCoordinate(row.destination_location, listing ? parseCoordinate(listing.location, coordinateForRegion(listing.region)) : mapCoordinates.gundagai),
    currentLocation: parseCoordinate(row.current_location, parseCoordinate(row.pickup_location, mapCoordinates.cowra)),
    pickupRegion: undefined,
    destinationRegion: listing?.region,
    livestockCount,
    preferredDate: row.preferred_date ?? "Date to confirm",
    driver: driverName,
    status: removedTestDriver ? "available" : normaliseTransportStatus(row.status),
    routeSummary,
    agreementContext: {
      duration: request?.duration ?? (agreement?.duration_months ? `${agreement.duration_months} months` : "Duration to confirm"),
      weeksRemaining: 0,
      agreementStatus: agreement?.status ?? "Draft",
    },
    sections: [],
    artefacts: [],
    timeline: [],
    quotes: [],
    acceptedQuoteId: row.accepted_quote_id ?? undefined,
  };
}

function isRemovedTestProfileName(name: string | null | undefined): boolean {
  return /^Codex Carrier\b/i.test(name ?? "") || /^Removed test account\b/i.test(name ?? "");
}

type MessageRowWithSender = Tables<"messages"> & {
  profiles?: { full_name: string | null } | null;
};

function mapMessageRow(row: MessageRowWithSender, threadId: string): Message {
  const senderName = row.profiles?.full_name ?? "PaddockME user";
  return {
    id: row.id,
    threadId,
    senderId: row.sender_id,
    senderName,
    senderRole: "Participant",
    body: row.body,
    time: new Date(row.created_at ?? Date.now()).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
    }),
    sectionId: row.section_id ?? undefined,
  };
}

function mapTransportMilestoneRow(row: any): TransportMilestone {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    sortOrder: row.sort_order,
    status: row.status === "passed" ? "passed" : "pending",
    passedAt: row.passed_at ?? null,
  };
}

function mapSettlementRow(row: any): AgreementSettlementSummary {
  return {
    id: row.id,
    agreementId: row.agreement_id,
    transportJobId: row.transport_job_id ?? null,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency,
    description: row.description,
    payerProfileId: row.payer_profile_id,
    payeeProfileId: row.payee_profile_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function coordinateFromLatLng(input: {
  latitude?: number;
  longitude?: number;
  location?: string;
  originAddress?: string;
}): Coordinate | undefined {
  if (typeof input.latitude !== "number" || typeof input.longitude !== "number") {
    return undefined;
  }
  return {
    latitude: input.latitude,
    longitude: input.longitude,
    label: input.originAddress ?? input.location ?? "Mapped location",
  };
}

function confirmedAddress(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalised = trimmed.toLowerCase();
  if (
    normalised.includes("to confirm") ||
    normalised === "livestock owner property" ||
    normalised === "selected paddock"
  ) {
    return null;
  }
  return trimmed;
}

function confirmedAgreementSectionValue(
  rows: Array<{
    section_key: string;
    farmer_a_value: Json;
    farmer_b_value: Json;
    agreed_by_a: boolean;
    agreed_by_b: boolean;
  }>,
  sectionKey: string
): string | null {
  const row = rows.find((item) => item.section_key === sectionKey);
  if (!row || !row.agreed_by_a || !row.agreed_by_b) return null;
  const ownerValue = confirmedAddress(jsonValueToText(row.farmer_a_value));
  const landownerValue = confirmedAddress(jsonValueToText(row.farmer_b_value));
  return ownerValue ?? landownerValue;
}

function distanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
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

function mergeAgreements(primary: Agreement[], fallback: Agreement[]): Agreement[] {
  const byId = new Map<string, Agreement>();
  for (const agreement of fallback) byId.set(agreement.id, agreement);
  for (const agreement of primary) byId.set(agreement.id, agreement);
  return Array.from(byId.values());
}

function mergeTransportJobs(primary: TransportJob[], fallback: TransportJob[]): TransportJob[] {
  const byId = new Map<string, TransportJob>();
  for (const job of fallback) byId.set(job.id, job);
  for (const job of primary) byId.set(job.id, job);
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

function stateForRegion(region: string): PaddockListing["state"] {
  if (region.includes("QLD")) return "QLD";
  if (region.includes("VIC") || region === "Gippsland") return "VIC";
  return "NSW";
}

function durationMonths(duration: string): number | null {
  if (duration.startsWith("1-3")) return 3;
  if (duration.startsWith("3-6")) return 6;
  if (duration.startsWith("6-12")) return 12;
  if (duration.startsWith("12")) return 12;
  return null;
}

function jsonValueToText(value: Json): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && !Array.isArray(value) && typeof value === "object") {
    const candidate = value.value;
    if (
      typeof candidate === "string" ||
      typeof candidate === "number" ||
      typeof candidate === "boolean"
    ) {
      return String(candidate);
    }
  }
  return "";
}

function normaliseAgreementStatus(value: string | null): AgreementLifecycleState {
  const states: AgreementLifecycleState[] = [
    "Draft",
    "Negotiating",
    "Ready to finalise",
    "Active",
    "Completed",
    "Cancelled",
  ];
  return states.includes(value as AgreementLifecycleState)
    ? (value as AgreementLifecycleState)
    : "Draft";
}

function normaliseTransportStatus(value: string): TransportJobStatus {
  const allowed: TransportJobStatus[] = [
    "available",
    "accepted",
    "loading",
    "in_transit",
    "arrived",
    "completed",
    "cancelled",
  ];
  if (allowed.includes(value as TransportJobStatus)) return value as TransportJobStatus;
  if (value === "Loading") return "loading";
  if (value === "In Transit") return "in_transit";
  if (value === "Arrived") return "arrived";
  return "accepted";
}

function formatStatus(status: TransportJobStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
