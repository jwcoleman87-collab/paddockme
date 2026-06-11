export type GeocodedLocation = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
};

export async function geocodeLocation(input: {
  query: string;
  region?: string;
}): Promise<GeocodedLocation | null> {
  const response = await fetch("/api/locations/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return (await response.json()) as GeocodedLocation;
}

