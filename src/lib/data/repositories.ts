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
  createLivestockRequest,
  createPaddockListing,
  loadPrototypeState,
  openAgreementForListing,
  openAgreementForRequest,
  requestTransportForAgreement,
  setPrototypePersona,
  updateTransportStatus,
  type PersonaId,
  type PrototypeState,
} from "@/lib/prototypeStore";
import {
  coordinateForRegion,
  mapCoordinates,
  parseCoordinate,
  pointToWkt,
} from "@/lib/mapCoordinates";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

export async function repositoryMode(): Promise<"supabase" | "demo"> {
  return (await getAuthedClient()) ? "supabase" : "demo";
}

export async function listProfiles(): Promise<Farmer[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return farmers;
  const { data, error } = await supabase.from("profiles").select("*");
  if (error || !data) return farmers;
  return mergeProfiles(data.map(mapProfileRow), farmers);
}

function mapProfileRow(row: Tables<"profiles">): Farmer {
  return {
    ...farmers[0],
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

function mergeProfiles(primary: Farmer[], fallback: Farmer[]): Farmer[] {
  const byId = new Map<string, Farmer>();
  for (const profile of fallback) byId.set(profile.id, profile);
  for (const profile of primary) byId.set(profile.id, profile);
  return Array.from(byId.values());
}

export async function listLivestockRequests(): Promise<LivestockRequest[]> {
  const supabase = await getAuthedClient();
  if (!supabase) return loadPrototypeState().livestockRequests;
  const { data, error } = await supabase
    .from("agistment_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return loadPrototypeState().livestockRequests;
  return mergeRequests(data.map(mapRequestRow), loadPrototypeState().livestockRequests);
}

function mergeRequests(primary: LivestockRequest[], fallback: LivestockRequest[]) {
  const byId = new Map<string, LivestockRequest>();
  for (const request of fallback) byId.set(request.id, request);
  for (const request of primary) byId.set(request.id, request);
  return Array.from(byId.values());
}

export function selectPersona(persona: PersonaId): PrototypeState {
  return setPrototypePersona(persona);
}


export async function createLivestockRequestRecord(input: {
  stockType: string;
  breed: string;
  headCount: number;
  duration: string;
  preferredRegions: string[];
  transportRequired: LivestockRequest["transportRequired"];
}) {
  const local = createLivestockRequest(input);
  const supabase = await getAuthedClient();
  if (!supabase) return local;

  const user = await getCurrentUser(supabase);
  if (!user) return local;
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
      location: pointToWkt(mapCoordinates.dale),
      status: "open",
    })
    .select("*")
    .single();

  if (error || !data) return local;
  return { state: local.state, request: mapRequestRow(data) };
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

/**
 * Strictly Supabase-backed paddock listings, no prototype fallback. Used by
 * surfaces gated behind a real signed-in account (e.g. `/listings`) where we
 * never want to leak the Dale/Brett seed paddocks to a live customer.
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
  availabilityWindow: string;
  guideTerms: string;
  summary: string;
  photos?: string[];
}) {
  const local = createPaddockListing(input);
  const supabase = await getAuthedClient();
  if (!supabase) return local;

  const user = await getCurrentUser(supabase);
  if (!user) return local;
  await ensureProfile(supabase, user);

  const { data, error } = await supabase
    .from("paddocks")
    .insert({
      owner_id: user.id,
      title: input.title,
      description: input.summary,
      region: input.region,
      state: stateForRegion(input.region),
      location: pointToWkt(coordinateForRegion(input.region)),
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

  if (error || !data) return local;
  return { state: local.state, listing: mapPaddockRow(data) };
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
    availabilityWindow: string;
    guideTerms: string;
    summary: string;
    photos?: string[];
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
      description: input.summary,
      region: input.region,
      state: stateForRegion(input.region),
      location: pointToWkt(coordinateForRegion(input.region)),
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
  if (!supabase) return loadPrototypeState().agreements;

  const { data, error } = await supabase
    .from("agreements")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return loadPrototypeState().agreements;

  const mapped = await Promise.all(data.map((row) => mapAgreementRow(supabase, row)));
  return mergeAgreements(mapped, loadPrototypeState().agreements);
}

export async function getAgreementRecord(id: string): Promise<Agreement | undefined> {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(id)) {
    const { data, error } = await supabase
      .from("agreements")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return mapAgreementRow(supabase, data);
  }
  return loadPrototypeState().agreements.find((agreement) => agreement.id === id);
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
): Promise<{ state: PrototypeState; agreement: Agreement | null }> {
  const supabase = await getAuthedClient();
  if (supabase) {
    // Real (signed-in) account: only ever return a genuine Supabase agreement.
    // Never fall back to a prototype id - those can't be reopened later, which
    // is exactly what produced the dead "agreement-..." workspaces.
    if (isUuid(listingId)) {
      const created = await createSupabaseAgreementForListing(
        supabase,
        listingId,
        requestId
      );
      if (created) return { state: loadPrototypeState(), agreement: created };
    }
    return { state: loadPrototypeState(), agreement: null };
  }
  return openAgreementForListing(listingId);
}

/**
 * Landowner offers one of their paddocks against an open livestock request.
 * Local-only for the prototype; Supabase wiring lands when we add a row
 * shape that captures the request<->listing pairing on the server.
 */
export async function offerPaddockForRequest(
  requestId: string,
  listingId: string
) {
  return openAgreementForRequest(requestId, listingId);
}

export async function listAgreementSections(agreementId: string) {
  const agreement = await getAgreementRecord(agreementId);
  return agreement?.sections ?? [];
}

export async function listAgreementMessages(agreementId: string): Promise<Message[]> {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(agreementId)) {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("agreement_id", agreementId)
      .order("created_at", { ascending: true });
    if (!error && data) return data.map((row) => mapMessageRow(row, agreementId));
  }
  return getMessages(agreementId);
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
      metadata: { source: "workspace_metadata" },
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
  if (!supabase) return loadPrototypeState().transportJobs;

  const { data, error } = await supabase
    .from("transport_jobs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data) return loadPrototypeState().transportJobs;
  return mergeTransportJobs(data.map(mapTransportJobRow), loadPrototypeState().transportJobs);
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
  if (supabase && isUuid(id)) {
    const { data, error } = await supabase
      .from("transport_jobs")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return mapTransportJobRow(data);
  }
  return loadPrototypeState().transportJobs.find((job) => job.id === id);
}

export async function requestTransportJob(agreementId: string) {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(agreementId)) {
    const created = await createSupabaseTransportJob(supabase, agreementId);
    if (created) return { state: loadPrototypeState(), job: created };
  }
  return requestTransportForAgreement(agreementId);
}

export async function updateTransportJobStatus(
  jobId: string,
  status: TransportJobStatus
) {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(jobId)) {
    const user = await getCurrentUser(supabase);
    const existing = await getTransportJobRecord(jobId);
    const update: TablesUpdate<"transport_jobs"> = { status };
    if (status === "accepted" && user) update.driver_id = user.id;
    const { data, error } = await supabase
      .from("transport_jobs")
      .update(update)
      .eq("id", jobId)
      .select("*")
      .single();
    if (!error && data && user) {
      await supabase.from("transport_status_events").insert({
        transport_job_id: jobId,
        from_status: existing?.status ?? null,
        to_status: status,
        changed_by: user.id,
        note: `Status changed to ${formatStatus(status)}.`,
      });
      return { state: loadPrototypeState(), job: mapTransportJobRow(data) };
    }
  }
  return updateTransportStatus(jobId, status);
}

export async function listTransportMessages(jobId: string): Promise<Message[]> {
  const supabase = await getAuthedClient();
  if (supabase && isUuid(jobId)) {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("transport_job_id", jobId)
      .order("created_at", { ascending: true });
    if (!error && data) return data.map((row) => mapMessageRow(row, jobId));
  }
  return getTransportMessages(jobId);
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
    originLocation: parseCoordinate(row.location, coordinateForRegion(row.preferred_regions?.[0])),
    preferredRegions: row.preferred_regions ?? [],
    transportRequired: "Unsure",
  };
}

function mapPaddockRow(row: Tables<"paddocks">): PaddockListing {
  const stockType = row.capacity_stock_type ?? "Cattle";
  const feedStatus = normaliseFeed(row.pasture_type);
  const waterStatus = normaliseWater(row.water_type?.[0]);
  const coordinates = parseCoordinate(row.location, coordinateForRegion(row.region));

  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    location: row.region,
    coordinates,
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
    photos: row.photos ?? undefined,
  };
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

  // Prefer the specific request the user came in with (e.g. from a match),
  // otherwise pair against their most recent open request. A landowner viewing
  // their own paddock has no request of their own, so this returns null and the
  // caller surfaces a "create a request first" message rather than a broken id.
  let request: Tables<"agistment_requests"> | null = null;
  if (requestId && isUuid(requestId)) {
    const { data } = await supabase
      .from("agistment_requests")
      .select("*")
      .eq("id", requestId)
      .eq("requester_id", user.id)
      .maybeSingle();
    request = data ?? null;
  }
  if (!request) {
    const { data } = await supabase
      .from("agistment_requests")
      .select("*")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    request = data ?? null;
  }
  if (!request) return null;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .upsert(
      {
        request_id: request.id,
        paddock_id: listing.id,
        match_score: 85,
        match_reasons: { source: "mvp_build_03" },
        status: "selected",
      },
      { onConflict: "request_id,paddock_id" }
    )
    .select("*")
    .single();
  if (matchError || !match) return null;

  // Reuse an existing agreement for this pairing instead of creating duplicates
  // when the button is clicked more than once.
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
      pickup_location: pointToWkt(parseCoordinate(request.location, mapCoordinates.dale)),
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
  if (existing.data) return mapTransportJobRow(existing.data);

  const { data, error } = await supabase
    .from("transport_jobs")
    .insert({
      agreement_id: agreement.id,
      livestock_owner_id: agreement.livestock_owner_id,
      landowner_id: agreement.landowner_id,
      pickup_address: "Livestock owner property",
      destination_address: "Selected paddock",
      livestock_count: agreement.head_count
        ? `${agreement.head_count} head`
        : "Livestock movement",
      pickup_location: pointToWkt(parseCoordinate(agreement.pickup_location, mapCoordinates.dale)),
      destination_location: pointToWkt(parseCoordinate(agreement.destination_location, mapCoordinates.gundagai)),
      current_location: pointToWkt(parseCoordinate(agreement.pickup_location, mapCoordinates.dale)),
      preferred_date: agreement.start_date,
      route_summary: "Pickup to selected agistment paddock",
      status: "available",
      coordination_state: { source: "mvp_build_03" },
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapTransportJobRow(data);
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
    pickupLocation: parseCoordinate(row.pickup_location, request ? parseCoordinate(request.location, mapCoordinates.dale) : mapCoordinates.dale),
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
  const values = [
    ["parties", "Parties", "Livestock owner", "Landowner"],
    ["stock", "Stock", `${request.head_count} ${request.breed ?? ""} ${request.stock_type}`.trim(), `${request.head_count} ${request.stock_type}`],
    ["paddock", "Paddock", listing.title, listing.title],
    ["dates", "Dates", request.duration, request.duration],
    ["terms", "Rate / Terms", "Discuss terms", listing.rate_per_head_week ? `$${listing.rate_per_head_week}/head/week` : "Discuss terms"],
    ["transport", "Transport", "Transport requested", "Driver to be confirmed"],
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

function mapTransportJobRow(row: Tables<"transport_jobs">): TransportJob {
  return {
    ...transportJobs[0],
    id: row.id,
    agreementId: row.agreement_id,
    farmerAId: row.livestock_owner_id,
    farmerBId: row.landowner_id,
    driverId: row.driver_id ?? "driver-1",
    pickup: row.pickup_address ?? "Livestock owner property",
    destination: row.destination_address ?? "Selected paddock",
    pickupLocation: parseCoordinate(row.pickup_location, mapCoordinates.dale),
    destinationLocation: parseCoordinate(row.destination_location, mapCoordinates.gundagai),
    currentLocation: parseCoordinate(row.current_location, parseCoordinate(row.pickup_location, mapCoordinates.dale)),
    livestockCount: row.livestock_count ?? "Livestock movement",
    preferredDate: row.preferred_date ?? "Date to confirm",
    driver: row.driver_id ? "Assigned driver" : "Unassigned",
    status: normaliseTransportStatus(row.status),
    routeSummary: row.route_summary ?? "Pickup to agistment paddock",
    quotes: [],
    acceptedQuoteId: row.accepted_quote_id ?? undefined,
  };
}

function mapMessageRow(row: any, threadId: string): Message {
  const senderName = row.profiles?.full_name ?? "PaddockME user";
  return {
    id: row.id,
    threadId,
    senderId: row.sender_id,
    senderName,
    senderRole: "Participant",
    body: row.body,
    time: new Date(row.created_at).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
    }),
    sectionId: row.section_id ?? undefined,
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
