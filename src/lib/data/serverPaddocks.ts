import {
  coordinateForRegion,
  parseCoordinate,
} from "@/lib/mapCoordinates";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Farmer, LivestockRequest, PaddockListing } from "@/lib/dummyData";
import type { Tables } from "@/lib/types/database";

/**
 * Marketplace go-live cutoff. Requests created before this instant are
 * pre-launch test data and are hidden from the live site (non-destructive -
 * the rows stay in the database). Anything posted after go-live shows up.
 */
const MARKETPLACE_LIVE_SINCE = "2026-06-09T11:20:59Z";

/**
 * Server-only paddock listing reads.
 *
 * The browser repositories module (`@/lib/data/repositories`) is marked
 * "use client" because it leans on localStorage + the browser Supabase client.
 * Importing it from a Server Component and calling one of its functions throws
 * at runtime ("Attempted to call ... from the server but ... is on the client"),
 * which is what was crashing GET /listings with a 500.
 *
 * This module mirrors `listSupabasePaddockListings()` but runs server-side using
 * the cookie-aware server client, so server-rendered pages can read live
 * listings safely. Returns an empty list (never the seed paddocks) whenever
 * Supabase isn't configured, nobody is signed in, or the query errors.
 */
export async function listSupabasePaddockListingsServer(): Promise<PaddockListing[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("paddocks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapPaddockRow);
  } catch {
    return [];
  }
}

// Kept in sync with mapPaddockRow() in @/lib/data/repositories.ts. Pure row ->
// view mapping with no client-only dependencies, so it is safe on the server.
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

/** The signed-in landowner's own paddocks (for the My Paddocks management view). */
export async function listMyPaddockListingsServer(): Promise<PaddockListing[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("paddocks")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapPaddockRow);
  } catch {
    return [];
  }
}

/** Real open livestock requests, for landowners browsing the requests board. */
export async function listLivestockRequestsServer(): Promise<LivestockRequest[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("agistment_requests")
      .select("*")
      .gte("created_at", MARKETPLACE_LIVE_SINCE)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapRequestRow);
  } catch {
    return [];
  }
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

/**
 * Lightweight summary of an agreement for list surfaces (dashboard,
 * messages inbox). One row per agreement the signed-in user is party to.
 */
export type AgreementSummary = {
  id: string;
  listingTitle: string;
  otherPartyName: string;
  /** Which side the signed-in user is on. */
  viewerRole: "Livestock owner" | "Landowner";
  status: string;
  updatedAt: string | null;
  lastMessage: { body: string; senderName: string; at: string } | null;
};

/**
 * Agreements the signed-in user is a party to, newest first, with the
 * paddock title, the other party's name, and the latest chat message.
 * This is what lets real users find their way back into a workspace.
 */
export async function listAgreementSummariesForUserServer(): Promise<
  AgreementSummary[]
> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: agreements, error } = await supabase
      .from("agreements")
      .select("id, match_id, livestock_owner_id, landowner_id, status, updated_at")
      .or(`livestock_owner_id.eq.${user.id},landowner_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });
    if (error || !agreements || agreements.length === 0) return [];

    const agreementIds = agreements.map((a) => a.id);
    const matchIds = agreements.map((a) => a.match_id).filter(Boolean);
    const partyIds = Array.from(
      new Set(agreements.flatMap((a) => [a.livestock_owner_id, a.landowner_id]))
    );

    const [{ data: matches }, { data: profiles }, { data: messages }] =
      await Promise.all([
        matchIds.length
          ? supabase.from("matches").select("id, paddock_id").in("id", matchIds)
          : Promise.resolve({ data: [] as { id: string; paddock_id: string }[] }),
        supabase.from("profiles").select("id, full_name").in("id", partyIds),
        supabase
          .from("messages")
          .select("agreement_id, body, sender_id, created_at")
          .in("agreement_id", agreementIds)
          .order("created_at", { ascending: false }),
      ]);

    const paddockIds = (matches ?? []).map((m) => m.paddock_id).filter(Boolean);
    const { data: paddocks } = paddockIds.length
      ? await supabase.from("paddocks").select("id, title").in("id", paddockIds)
      : { data: [] as { id: string; title: string }[] };

    const paddockTitleById = new Map(
      (paddocks ?? []).map((p) => [p.id, p.title])
    );
    const paddockIdByMatchId = new Map(
      (matches ?? []).map((m) => [m.id, m.paddock_id])
    );
    const nameById = new Map(
      (profiles ?? []).map((p) => [p.id, p.full_name ?? "PaddockME user"])
    );
    const latestMessageByAgreement = new Map<
      string,
      { body: string; sender_id: string; created_at: string }
    >();
    for (const message of messages ?? []) {
      if (!message.agreement_id) continue;
      if (!latestMessageByAgreement.has(message.agreement_id)) {
        latestMessageByAgreement.set(message.agreement_id, message);
      }
    }

    return agreements.map((agreement) => {
      const isLivestockOwner = agreement.livestock_owner_id === user.id;
      const otherPartyId = isLivestockOwner
        ? agreement.landowner_id
        : agreement.livestock_owner_id;
      const paddockId = agreement.match_id
        ? paddockIdByMatchId.get(agreement.match_id)
        : undefined;
      const lastMessage = latestMessageByAgreement.get(agreement.id);
      return {
        id: agreement.id,
        listingTitle:
          (paddockId ? paddockTitleById.get(paddockId) : undefined) ??
          "Agreement workspace",
        otherPartyName: nameById.get(otherPartyId) ?? "PaddockME user",
        viewerRole: isLivestockOwner ? "Livestock owner" : "Landowner",
        status: agreement.status ?? "Draft",
        updatedAt: agreement.updated_at,
        lastMessage: lastMessage
          ? {
              body: lastMessage.body,
              senderName:
                lastMessage.sender_id === user.id
                  ? "You"
                  : nameById.get(lastMessage.sender_id) ?? "PaddockME user",
              at: lastMessage.created_at,
            }
          : null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Profile cards for the given user ids (e.g. requesters on the requests
 * board) so real names show instead of a generic "Livestock owner".
 */
export async function listProfilesByIdServer(
  ids: string[]
): Promise<Record<string, Farmer>> {
  if (!isSupabaseConfigured() || ids.length === 0) return {};
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, regions, account_types, id_verified, phone")
      .in("id", Array.from(new Set(ids)));
    if (error || !data) return {};
    const result: Record<string, Farmer> = {};
    for (const row of data) {
      result[row.id] = {
        id: row.id,
        name: row.full_name ?? "PaddockME user",
        role: row.account_types?.includes("Landowner")
          ? "Landowner"
          : row.account_types?.includes("Transport Provider")
            ? "Transport Provider"
            : "Livestock Owner",
        region: row.regions?.[0] ?? "Australia",
        verified: !!row.id_verified,
        tagline: row.full_name ?? "PaddockME member",
        bio: "",
        mobileVerified: !!row.phone,
        preparednessScore: row.id_verified ? 70 : 35,
        verifications: [],
        readiness: [],
      };
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * One transport job row for the RFT board. Routes/loads only - the table
 * deliberately carries no agistment rates, so nothing private leaks to
 * carriers browsing for work.
 */
export type MapPoint = { latitude: number; longitude: number };

export type TransportJobSummary = {
  id: string;
  status: string;
  pickup: string;
  destination: string;
  livestockCount: string;
  preferredDate: string;
  routeSummary: string;
  /** "mine" = viewer is a party or the assigned driver; "available" = open for any carrier. */
  relation: "available" | "mine";
  createdAt: string | null;
  /** Route endpoints for the map layer; null when the row has no location. */
  pickupPoint: MapPoint | null;
  destinationPoint: MapPoint | null;
};

/**
 * Real transport jobs for the signed-in user's RFT board: jobs they're a
 * party to (farmer side or assigned driver) plus - for transport providers,
 * via the driver-discovery RLS policy - every still-available job.
 */
export async function listTransportJobsBoardServer(): Promise<TransportJobSummary[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("transport_jobs")
      .select(
        "id, status, pickup_address, destination_address, livestock_count, preferred_date, route_summary, driver_id, livestock_owner_id, landowner_id, created_at, pickup_location, destination_location"
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      status: row.status,
      pickup: row.pickup_address ?? "Pickup to confirm",
      destination: row.destination_address ?? "Destination to confirm",
      livestockCount: row.livestock_count ?? "Livestock movement",
      preferredDate: row.preferred_date ?? "Date to confirm",
      routeSummary: row.route_summary ?? "Route to confirm",
      relation:
        row.livestock_owner_id === user.id ||
        row.landowner_id === user.id ||
        row.driver_id === user.id
          ? "mine"
          : "available",
      createdAt: row.created_at,
      pickupPoint: toMapPoint(row.pickup_location),
      destinationPoint: toMapPoint(row.destination_location),
    }));
  } catch {
    return [];
  }
}

function toMapPoint(value: unknown): MapPoint | null {
  if (!value) return null;
  const parsed = parseCoordinate(value);
  if (!parsed) return null;
  return { latitude: parsed.latitude, longitude: parsed.longitude };
}

/**
 * Route endpoints for each agreement the signed-in user is party to, for
 * the live map. Joined with listAgreementSummariesForUserServer by id.
 */
export type AgreementRoute = {
  id: string;
  status: string;
  from: MapPoint | null;
  to: MapPoint | null;
};

export async function listAgreementRoutesForUserServer(): Promise<AgreementRoute[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("agreements")
      .select("id, status, pickup_location, destination_location")
      .or(`livestock_owner_id.eq.${user.id},landowner_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      status: row.status ?? "Draft",
      from: toMapPoint(row.pickup_location),
      to: toMapPoint(row.destination_location),
    }));
  } catch {
    return [];
  }
}

/** Count of agreements the signed-in user is a party to (either side). */
export async function countAgreementsForUserServer(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count, error } = await supabase
      .from("agreements")
      .select("id", { count: "exact", head: true })
      .or(`livestock_owner_id.eq.${user.id},landowner_id.eq.${user.id}`);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
