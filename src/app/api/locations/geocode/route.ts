import { NextResponse } from "next/server";
import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMapsKey";
import { createClient } from "@/lib/supabase/server";

type GeocodeRequest = {
  query?: string;
  region?: string;
};

type GoogleGeocodeResponse = {
  status: string;
  results?: Array<{
    formatted_address?: string;
    place_id?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  error_message?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as GeocodeRequest | null;
  const query = body?.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 503 }
    );
  }

  const address = [query, body?.region, "Australia"]
    .filter(Boolean)
    .join(", ");
  const params = new URLSearchParams({
    address,
    components: "country:AU",
    key: GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    return NextResponse.json({ error: "Could not geocode location" }, { status: 502 });
  }

  const payload = (await response.json()) as GoogleGeocodeResponse;
  const result = payload.results?.[0];
  const lat = result?.geometry?.location?.lat;
  const lng = result?.geometry?.location?.lng;
  if (payload.status !== "OK" || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: payload.error_message ?? "No location match found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    formattedAddress: result?.formatted_address ?? query,
    latitude: lat,
    longitude: lng,
    placeId: result?.place_id ?? null,
  });
}

