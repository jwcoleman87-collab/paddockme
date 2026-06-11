export type Coordinate = {
  latitude: number;
  longitude: number;
  label: string;
  region?: string;
};

/**
 * Neutral representative coordinates for Australian agistment regions.
 * Used only as REGION-LEVEL fallbacks when a row has no real geocoded
 * location. (The legacy demo-persona keys were retired with demo mode.)
 */
export const mapCoordinates = {
  cowra: {
    latitude: -33.835,
    longitude: 148.697,
    label: "Cowra",
    region: "Central West NSW",
  },
  gundagai: {
    latitude: -35.066,
    longitude: 148.105,
    label: "Gundagai",
    region: "Southern NSW",
  },
  waggaWagga: {
    latitude: -35.115,
    longitude: 147.367,
    label: "Wagga Wagga",
    region: "Riverina NSW",
  },
  newcastle: {
    latitude: -32.926,
    longitude: 151.781,
    label: "Newcastle",
    region: "Hunter NSW",
  },
  armidale: {
    latitude: -30.514,
    longitude: 151.665,
    label: "Armidale",
    region: "Northern Tablelands NSW",
  },
  goondiwindi: {
    latitude: -28.546,
    longitude: 150.306,
    label: "Goondiwindi",
    region: "Goondiwindi QLD",
  },
  gippsland: {
    latitude: -37.825,
    longitude: 147.63,
    label: "Gippsland",
    region: "Gippsland VIC",
  },
  seQld: {
    latitude: -27.56,
    longitude: 152.0,
    label: "SE QLD",
    region: "SE QLD",
  },
} satisfies Record<string, Coordinate>;

const regionCoordinateLookup: Record<string, Coordinate> = {
  "Central West": mapCoordinates.cowra,
  "Central West NSW": mapCoordinates.cowra,
  "Southern NSW": mapCoordinates.gundagai,
  "Riverina NSW": mapCoordinates.waggaWagga,
  "Northern NSW": mapCoordinates.armidale,
  "Northern Tablelands NSW": mapCoordinates.armidale,
  "Hunter NSW": mapCoordinates.newcastle,
  Gippsland: mapCoordinates.gippsland,
  "Gippsland VIC": mapCoordinates.gippsland,
  "SE QLD": mapCoordinates.seQld,
  "Darling Downs QLD": mapCoordinates.goondiwindi,
  "Goondiwindi QLD": mapCoordinates.goondiwindi,
  "Maranoa QLD": {
    latitude: -26.573,
    longitude: 148.787,
    label: "Roma",
    region: "Maranoa QLD",
  },
};

export function coordinateForRegion(region?: string | null): Coordinate | undefined {
  if (!region) return undefined;
  return regionCoordinateLookup[region] ?? regionCoordinateLookup[region.replace(" NSW", "")];
}

export function pointToWkt(coordinate?: Coordinate | null): string | null {
  if (!coordinate) return null;
  return `POINT(${coordinate.longitude} ${coordinate.latitude})`;
}

export function parseCoordinate(value: unknown, fallback?: Coordinate): Coordinate | undefined {
  if (!value) return fallback;
  if (typeof value === "string") {
    const match = value.match(/POINT\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
    if (match) {
      return {
        longitude: Number(match[1]),
        latitude: Number(match[2]),
        label: fallback?.label ?? "Mapped location",
        region: fallback?.region,
      };
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const candidate = value as { coordinates?: unknown; latitude?: unknown; longitude?: unknown };
    if (
      typeof candidate.latitude === "number" &&
      typeof candidate.longitude === "number"
    ) {
      return {
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        label: fallback?.label ?? "Mapped location",
        region: fallback?.region,
      };
    }
    if (
      Array.isArray(candidate.coordinates) &&
      typeof candidate.coordinates[0] === "number" &&
      typeof candidate.coordinates[1] === "number"
    ) {
      return {
        longitude: candidate.coordinates[0],
        latitude: candidate.coordinates[1],
        label: fallback?.label ?? "Mapped location",
        region: fallback?.region,
      };
    }
  }
  return fallback;
}
