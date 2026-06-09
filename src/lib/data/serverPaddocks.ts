import {
  coordinateForRegion,
  parseCoordinate,
} from "@/lib/mapCoordinates";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { LivestockRequest, PaddockListing } from "@/lib/dummyData";
import type { Tables } from "@/lib/types/database";

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
