export type RegionBoundary = {
  region: string;
  source: string;
  coordinates: [number, number][];
};

const simplifiedBoundarySource =
  "PaddockME-owned simplified display boundary, traced from ABS/NSW/Qld/Vic regional groupings for marketplace map context. Not cadastral or legal boundary data.";

const regionBoundaries: Record<string, RegionBoundary> = {
  "Southern NSW": boundary("Southern NSW", [
    [146.25, -36.15],
    [149.45, -36.1],
    [150.15, -35.25],
    [149.25, -34.45],
    [147.15, -34.35],
    [146.0, -35.1],
  ]),
  Riverina: boundary("Riverina", [
    [143.95, -35.9],
    [146.9, -35.95],
    [147.45, -34.55],
    [146.0, -33.8],
    [144.0, -34.05],
    [143.2, -35.0],
  ]),
  "Riverina NSW": boundary("Riverina NSW", [
    [143.95, -35.9],
    [146.9, -35.95],
    [147.45, -34.55],
    [146.0, -33.8],
    [144.0, -34.05],
    [143.2, -35.0],
  ]),
  "Central West NSW": boundary("Central West NSW", [
    [146.75, -34.25],
    [149.6, -34.2],
    [150.1, -32.75],
    [149.15, -31.75],
    [147.1, -31.95],
    [146.35, -33.1],
  ]),
  "Hunter NSW": boundary("Hunter NSW", [
    [149.75, -33.05],
    [152.25, -33.05],
    [152.4, -31.65],
    [151.05, -31.05],
    [149.75, -31.65],
  ]),
  "Northern Tablelands NSW": boundary("Northern Tablelands NSW", [
    [150.0, -31.25],
    [152.1, -30.95],
    [152.2, -28.7],
    [150.75, -28.45],
    [149.55, -29.45],
  ]),
  "Southern Highlands NSW": boundary("Southern Highlands NSW", [
    [149.95, -35.05],
    [150.85, -35.0],
    [151.0, -34.25],
    [150.55, -34.0],
    [149.95, -34.35],
  ]),
  Gippsland: boundary("Gippsland", [
    [145.15, -38.75],
    [149.35, -38.5],
    [149.55, -37.2],
    [147.7, -36.6],
    [145.8, -37.0],
  ]),
  "Gippsland VIC": boundary("Gippsland VIC", [
    [145.15, -38.75],
    [149.35, -38.5],
    [149.55, -37.2],
    [147.7, -36.6],
    [145.8, -37.0],
  ]),
  "SE QLD": boundary("SE QLD", [
    [151.1, -28.75],
    [153.55, -28.45],
    [153.45, -26.45],
    [152.15, -25.95],
    [151.25, -27.0],
  ]),
  "Darling Downs": boundary("Darling Downs", [
    [149.35, -28.8],
    [152.15, -28.65],
    [152.25, -26.45],
    [150.65, -25.9],
    [149.1, -27.0],
  ]),
  "Darling Downs QLD": boundary("Darling Downs QLD", [
    [149.35, -28.8],
    [152.15, -28.65],
    [152.25, -26.45],
    [150.65, -25.9],
    [149.1, -27.0],
  ]),
  Maranoa: boundary("Maranoa", [
    [146.1, -28.8],
    [149.6, -28.7],
    [150.0, -26.4],
    [148.0, -25.35],
    [145.85, -26.55],
  ]),
  "Maranoa QLD": boundary("Maranoa QLD", [
    [146.1, -28.8],
    [149.6, -28.7],
    [150.0, -26.4],
    [148.0, -25.35],
    [145.85, -26.55],
  ]),
  "Goondiwindi QLD": boundary("Goondiwindi QLD", [
    [149.4, -29.2],
    [151.4, -29.0],
    [151.65, -27.95],
    [150.25, -27.45],
    [149.2, -28.25],
  ]),
};

export function getRegionBoundary(region?: string | null): RegionBoundary | undefined {
  if (!region) return undefined;
  return (
    regionBoundaries[region] ??
    regionBoundaries[region.replace(" NSW", "")] ??
    regionBoundaries[`${region} NSW`] ??
    regionBoundaries[`${region} QLD`] ??
    regionBoundaries[`${region} VIC`]
  );
}

export function listRegionBoundaries(regions: Iterable<string>): RegionBoundary[] {
  const seen = new Set<string>();
  const boundaries: RegionBoundary[] = [];
  for (const region of regions) {
    const boundary = getRegionBoundary(region);
    if (!boundary || seen.has(boundary.region)) continue;
    seen.add(boundary.region);
    boundaries.push(boundary);
  }
  return boundaries;
}

function boundary(region: string, coordinates: [number, number][]): RegionBoundary {
  return {
    region,
    source: simplifiedBoundarySource,
    coordinates: closeRing(coordinates),
  };
}

function closeRing(coordinates: [number, number][]) {
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (!first || !last || (first[0] === last[0] && first[1] === last[1])) {
    return coordinates;
  }
  return [...coordinates, first];
}
