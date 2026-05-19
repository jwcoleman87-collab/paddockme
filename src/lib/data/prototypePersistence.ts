"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { LivestockRequest, PaddockListing, TransportJobStatus } from "@/lib/dummyData";

type SupabaseLike = ReturnType<typeof createClient>;

export async function persistLivestockRequestToSupabase(
  request: LivestockRequest
): Promise<void> {
  const supabase = await getAuthedSupabase();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").upsert(
    { id: user.id, full_name: user.user_metadata?.full_name ?? null },
    { onConflict: "id" }
  );

  const { error } = await supabase.from("agistment_requests").insert({
    requester_id: user.id,
    stock_type: request.stockType,
    breed: request.breed,
    head_count: request.headCount,
    duration: request.duration,
    preferred_regions: request.preferredRegions,
    status: "open",
  });

  if (error) {
    console.warn("Supabase livestock request persistence failed", error.message);
  }
}

export async function persistPaddockListingToSupabase(
  listing: PaddockListing
): Promise<void> {
  const supabase = await getAuthedSupabase();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("profiles").upsert(
    { id: user.id, full_name: user.user_metadata?.full_name ?? null },
    { onConflict: "id" }
  );

  const { error } = await supabase.from("paddocks").insert({
    owner_id: user.id,
    title: listing.title,
    description: listing.summary,
    region: listing.regionLabel,
    state: listing.state,
    acres: listing.acres,
    capacity_head: null,
    capacity_stock_type: listing.suitableLivestock[0] ?? null,
    pasture_type: listing.feedStatus,
    water_type: [listing.waterStatus],
    yards: listing.summary.toLowerCase().includes("yard"),
    loading_ramp: listing.summary.toLowerCase().includes("loading"),
    status: "published",
  });

  if (error) {
    console.warn("Supabase paddock listing persistence failed", error.message);
  }
}

export async function persistTransportStatusEventToSupabase(input: {
  transportJobId: string;
  fromStatus?: TransportJobStatus;
  toStatus: TransportJobStatus;
  note?: string;
}): Promise<void> {
  const supabase = await getAuthedSupabase();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isUuid(input.transportJobId)) return;

  const { error } = await supabase.from("transport_status_events").insert({
    transport_job_id: input.transportJobId,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus,
    changed_by: user.id,
    note: input.note ?? null,
  } as never);

  if (error) {
    console.warn("Supabase transport status event persistence failed", error.message);
  }
}

async function getAuthedSupabase(): Promise<SupabaseLike | null> {
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
