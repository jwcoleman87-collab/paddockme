"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type MapGeoJSONFeature } from "maplibre-gl";
import {
  CalendarDays,
  Layers3,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  Sprout,
  Truck,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { loadPrototypeState } from "@/lib/prototypeStore";
import {
  agreements,
  farmers,
  livestockRequests,
  paddockListings,
  regionalInsights,
  transportJobs,
  type Agreement,
  type Farmer,
  type LivestockRequest,
  type PaddockListing,
  type TransportJob,
} from "@/lib/dummyData";
import {
  coordinateForRegion,
  mapCoordinates,
  type Coordinate,
} from "@/lib/mapCoordinates";
import { cn } from "@/lib/utils";

export type PaddockMapMode = "regional" | "agreement" | "driver";

type LayerKey = "paddocks" | "requests" | "transport" | "profiles" | "weather";

type MapFeatureProperties = {
  id: string;
  kind: LayerKey;
  title: string;
  subtitle: string;
  metric: string;
  href?: string;
  privacy?: string;
  modeHint?: string;
};

type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapFeatureProperties;
};

type LineFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: { id: string; title: string };
};

type FeatureCollection<TFeature extends Feature | LineFeature> = {
  type: "FeatureCollection";
  features: TFeature[];
};

type PaddockMapProps = {
  mode?: PaddockMapMode;
  agreementId?: string;
  transportId?: string;
  driverId?: string;
  region?: string;
};

const pointSourceId = "paddockme-operational-points";
const routeSourceId = "paddockme-routes";

export function PaddockMap({
  mode = "regional",
  agreementId,
  transportId,
  driverId = "driver-1",
  region,
}: PaddockMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapFeatureProperties | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    paddocks: true,
    requests: true,
    transport: true,
    profiles: mode !== "regional",
    weather: true,
  });
  const [state, setState] = useState(() => ({
    paddockListings,
    livestockRequests,
    agreements,
    transportJobs,
  }));

  useEffect(() => {
    setState(loadPrototypeState());
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const supportCheck = (maplibregl as unknown as {
      supported?: (options?: { failIfMajorPerformanceCaveat?: boolean }) => boolean;
    }).supported;
    if (supportCheck && !supportCheck({ failIfMajorPerformanceCaveat: false })) {
      setMapError("Interactive WebGL map is not available in this browser.");
      return;
    }
    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "map-background",
              type: "background",
              paint: { "background-color": "#eef3e8" },
            },
            {
              id: "osm",
              type: "raster",
              source: "osm",
              paint: { "raster-opacity": 0.9 },
            },
          ],
        },
        center: [147.3, -32.7],
        zoom: mode === "regional" ? 4.2 : 6.3,
        minZoom: 3,
        maxZoom: 13,
        cooperativeGestures: true,
      });
    } catch (error) {
      setMapError(error instanceof Error ? error.message : "The interactive map failed to start.");
      return;
    }
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("error", (event) => {
      const message = event.error?.message ?? "";
      if (message.toLowerCase().includes("webgl")) {
        setMapError(message);
      }
    });
    map.on("load", () => {
      map.addSource(pointSourceId, {
        type: "geojson",
        data: emptyFeatureCollection(),
        cluster: true,
        clusterRadius: 42,
        clusterMaxZoom: 9,
      });
      map.addSource(routeSourceId, {
        type: "geojson",
        data: emptyLineCollection(),
      });
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#f5ecd7",
          "line-width": 8,
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: routeSourceId,
        paint: {
          "line-color": "#2c5030",
          "line-width": 4,
          "line-dasharray": [1.4, 0.8],
        },
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: pointSourceId,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2c5030",
          "circle-radius": ["step", ["get", "point_count"], 18, 8, 24, 20, 30],
          "circle-stroke-color": "#fdfcf9",
          "circle-stroke-width": 3,
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: pointSourceId,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#fdfcf9",
        },
      });
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: pointSourceId,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "kind"],
            "paddocks",
            "#5b8c5a",
            "requests",
            "#c47b5a",
            "transport",
            "#2c5030",
            "profiles",
            "#d4a853",
            "#6d6257",
          ],
          "circle-radius": 9,
          "circle-stroke-color": "#fdfcf9",
          "circle-stroke-width": 3,
        },
      });
      map.addLayer({
        id: "point-label",
        type: "symbol",
        source: pointSourceId,
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "title"],
          "text-size": 11,
          "text-offset": [0, 1.35],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#3f3328",
          "text-halo-color": "#fdfcf9",
          "text-halo-width": 1.6,
        },
      });
      map.on("click", "clusters", async (event) => {
        const feature = map.queryRenderedFeatures(event.point, {
          layers: ["clusters"],
        })[0];
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource(pointSourceId) as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coordinates = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates;
        map.easeTo({ center: coordinates, zoom });
      });
      map.on("click", "unclustered-point", (event) => {
        const feature = event.features?.[0] as MapGeoJSONFeature | undefined;
        if (!feature) return;
        setSelected(feature.properties as MapFeatureProperties);
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
      setReady(true);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mode]);

  const context = useMemo(
    () =>
      buildMapContext({
        mode,
        agreementId,
        transportId,
        driverId,
        region,
        listings: state.paddockListings,
        requests: state.livestockRequests,
        agreements: state.agreements,
        jobs: state.transportJobs,
      }),
    [agreementId, driverId, mode, region, state, transportId]
  );

  const visiblePointData = useMemo(() => {
    const enabled = new Set(
      Object.entries(layers)
        .filter(([, value]) => value)
        .map(([key]) => key)
    );
    return {
      type: "FeatureCollection",
      features: context.points.filter((feature) => enabled.has(feature.properties.kind)),
    } satisfies FeatureCollection<Feature>;
  }, [context.points, layers]);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    (map.getSource(pointSourceId) as maplibregl.GeoJSONSource)?.setData(visiblePointData as never);
    (map.getSource(routeSourceId) as maplibregl.GeoJSONSource)?.setData(context.routes as never);
    if (context.bounds) {
      map.fitBounds(context.bounds, {
        padding: { top: 62, right: 44, bottom: 220, left: 44 },
        maxZoom: mode === "regional" ? 6 : 8.5,
        duration: 650,
      });
    }
  }, [context.bounds, context.routes, mode, ready, visiblePointData]);

  function locateOperationalView() {
    const map = mapRef.current;
    if (!map || !context.bounds) return;
    map.fitBounds(context.bounds, {
      padding: { top: 62, right: 44, bottom: 220, left: 44 },
      maxZoom: mode === "regional" ? 6 : 8.5,
      duration: 650,
    });
  }

  return (
    <section className="overflow-hidden rounded-[8px] border border-mist bg-cream shadow-sm shadow-bark/5">
      <div className="grid min-h-[72dvh] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative min-h-[68dvh]">
          <div ref={containerRef} className="absolute inset-0" />
          <FallbackOperationalMap
            points={visiblePointData.features}
            routes={context.routes.features}
            active={!ready || !!mapError}
            onSelect={setSelected}
          />
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-2 sm:inset-x-4 sm:top-4">
            <div className="pointer-events-auto max-w-[min(32rem,calc(100vw-2rem))] rounded-[8px] border border-mist bg-warm-white/95 p-3 shadow-lg shadow-bark/10 backdrop-blur">
              <div className="flex items-start gap-2">
                <ModeIcon mode={mode} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-stone">
                    {context.eyebrow}
                  </p>
                  <h2 className="text-base font-bold text-bark sm:text-lg">
                    {context.title}
                  </h2>
                  <p className="mt-1 text-sm text-stone">{context.description}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={locateOperationalView}
              className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-mist bg-warm-white/95 px-3 text-sm font-bold text-sage-deep shadow-lg shadow-bark/10 backdrop-blur transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <LocateFixed className="h-4 w-4" aria-hidden />
              Re-centre
            </button>
            {mapError ? (
              <div className="pointer-events-auto rounded-[8px] border border-amber/30 bg-amber-light px-3 py-2 text-sm font-semibold text-amber shadow-lg shadow-bark/10">
                Fallback map active
              </div>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10 lg:hidden">
            <MapSheet selected={selected} onClose={() => setSelected(null)} />
          </div>
        </div>

        <aside className="border-t border-mist bg-warm-white p-4 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <LayerControls layers={layers} onChange={setLayers} />
            <ContextPanel context={context} />
            <div className="hidden lg:block">
              <MapSheet selected={selected} onClose={() => setSelected(null)} docked />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function LayerControls({
  layers,
  onChange,
}: {
  layers: Record<LayerKey, boolean>;
  onChange: React.Dispatch<React.SetStateAction<Record<LayerKey, boolean>>>;
}) {
  const controls: { key: LayerKey; label: string; icon: React.ElementType }[] = [
    { key: "paddocks", label: "Paddocks", icon: Sprout },
    { key: "requests", label: "Requests", icon: MapPin },
    { key: "transport", label: "Transport", icon: Truck },
    { key: "profiles", label: "People", icon: LocateFixed },
    { key: "weather", label: "Rain/feed", icon: Layers3 },
  ];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-bark">
        <Layers3 className="h-4 w-4 text-sage-deep" aria-hidden />
        Layers
      </div>
      <div className="grid grid-cols-2 gap-2">
        {controls.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              onChange((current) => ({ ...current, [key]: !current[key] }))
            }
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
              layers[key]
                ? "border-sage-deep bg-sage-mist text-sage-deep"
                : "border-mist bg-cream text-stone hover:bg-sage-mist"
            )}
            aria-pressed={layers[key]}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ContextPanel({ context }: { context: MapContext }) {
  return (
    <div className="rounded-[8px] border border-mist bg-cream p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Operating picture
        </h3>
        <span className="rounded-full bg-sage-mist px-2.5 py-1 text-xs font-bold text-sage-deep">
          {context.points.length} signals
        </span>
      </div>
      <div className="space-y-2">
        {context.metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-start justify-between gap-3 border-t border-mist/80 pt-2 first:border-t-0 first:pt-0"
          >
            <p className="text-sm text-stone">{metric.label}</p>
            <p className="text-right text-sm font-bold text-bark">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        {context.actions.map((action) => (
          <ButtonLink key={action.href} href={action.href} variant={action.variant}>
            {action.icon}
            {action.label}
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}

function MapSheet({
  selected,
  onClose,
  docked = false,
}: {
  selected: MapFeatureProperties | null;
  onClose: () => void;
  docked?: boolean;
}) {
  if (!selected) {
    return (
      <div
        className={cn(
          "rounded-[8px] border border-mist bg-warm-white/95 p-4 shadow-lg shadow-bark/10 backdrop-blur",
          docked ? "min-h-44" : ""
        )}
      >
        <p className="text-sm font-bold text-bark">Tap a map signal</p>
        <p className="mt-1 text-sm text-stone">
          Paddocks, requests, driver jobs, and profile locations open here without hiding the map.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-[8px] border border-mist bg-warm-white/95 p-4 shadow-lg shadow-bark/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            {labelForKind(selected.kind)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-bark">{selected.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close map detail"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-stone transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-sm text-stone">{selected.subtitle}</p>
      <div className="mt-3 rounded-[8px] border border-mist bg-cream px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wide text-stone">Signal</p>
        <p className="mt-1 text-sm font-semibold text-bark">{selected.metric}</p>
      </div>
      {selected.privacy ? (
        <p className="mt-3 text-xs font-semibold text-sage-deep">{selected.privacy}</p>
      ) : null}
      {selected.href ? (
        <div className="mt-4">
          <ButtonLink href={selected.href} variant="secondary" className="w-full">
            <Navigation className="h-4 w-4" aria-hidden />
            Open
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

function FallbackOperationalMap({
  points,
  routes,
  active,
  onSelect,
}: {
  points: Feature[];
  routes: LineFeature[];
  active: boolean;
  onSelect: (properties: MapFeatureProperties) => void;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-[#eef3e8] transition-opacity duration-300",
        active ? "z-[1] opacity-100" : "pointer-events-none z-0 opacity-0"
      )}
      aria-hidden={!active}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        role="img"
        aria-label="PaddockME operational map fallback"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="map-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#d9d4c8" strokeWidth="0.22" opacity="0.75" />
          </pattern>
          <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.2" floodColor="#2c5030" floodOpacity="0.24" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="#eef3e8" />
        <rect width="100" height="100" fill="url(#map-grid)" opacity="0.8" />
        <path
          d="M69 18 C78 23 85 36 86 48 C87 59 80 68 74 78 C67 88 55 90 44 86 C32 82 22 74 18 63 C14 52 18 40 25 31 C35 18 54 11 69 18Z"
          fill="#dfe9d8"
          stroke="#9fb99b"
          strokeWidth="0.65"
        />
        <path
          d="M29 42 C38 35 46 31 58 28 M35 62 C46 58 58 54 74 48 M47 78 C55 70 63 64 77 59"
          fill="none"
          stroke="#c3b98d"
          strokeWidth="0.45"
          strokeDasharray="1.4 1.1"
          opacity="0.8"
        />
        {routes.map((route) => {
          const path = route.geometry.coordinates
            .map((coordinate, index) => {
              const projected = projectCoordinate(coordinate);
              return `${index === 0 ? "M" : "L"} ${projected.x} ${projected.y}`;
            })
            .join(" ");
          return (
            <path
              key={route.properties.id}
              d={path}
              fill="none"
              stroke="#2c5030"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="2.2 1.3"
              opacity="0.88"
            />
          );
        })}
        {points.map((point) => {
          const projected = projectCoordinate(point.geometry.coordinates);
          return (
            <g key={point.properties.id} filter="url(#pin-shadow)">
              <circle
                cx={projected.x}
                cy={projected.y}
                r="2.2"
                fill={colourForKind(point.properties.kind)}
                stroke="#fdfcf9"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0">
        {points.map((point) => {
          const projected = projectCoordinate(point.geometry.coordinates);
          return (
            <button
              key={point.properties.id}
              type="button"
              onClick={() => onSelect(point.properties)}
              className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              style={{ left: `${projected.x}%`, top: `${projected.y}%` }}
              aria-label={`Open ${point.properties.title}`}
            />
          );
        })}
      </div>
      <div className="absolute bottom-32 left-3 max-w-[18rem] rounded-[8px] border border-mist bg-warm-white/92 p-3 text-xs font-semibold text-stone shadow-lg shadow-bark/10 sm:bottom-4 sm:left-4">
        Operational fallback map. The live tile map will replace this when WebGL and tiles are available.
      </div>
    </div>
  );
}

type MapContext = {
  eyebrow: string;
  title: string;
  description: string;
  points: Feature[];
  routes: FeatureCollection<LineFeature>;
  bounds?: [[number, number], [number, number]];
  metrics: { label: string; value: string }[];
  actions: {
    href: string;
    label: string;
    variant: "primary" | "secondary" | "ghost";
    icon: React.ReactNode;
  }[];
};

function projectCoordinate([longitude, latitude]: [number, number]) {
  const minLng = 112;
  const maxLng = 154;
  const minLat = -44.5;
  const maxLat = -10;
  const x = 12 + ((longitude - minLng) / (maxLng - minLng)) * 76;
  const y = 12 + ((maxLat - latitude) / (maxLat - minLat)) * 76;
  return {
    x: Math.min(91, Math.max(9, x)),
    y: Math.min(91, Math.max(9, y)),
  };
}

function colourForKind(kind: LayerKey) {
  const colours: Record<LayerKey, string> = {
    paddocks: "#5b8c5a",
    requests: "#c47b5a",
    transport: "#2c5030",
    profiles: "#d4a853",
    weather: "#6d6257",
  };
  return colours[kind];
}

function buildMapContext(input: {
  mode: PaddockMapMode;
  agreementId?: string;
  transportId?: string;
  driverId: string;
  region?: string;
  listings: PaddockListing[];
  requests: LivestockRequest[];
  agreements: Agreement[];
  jobs: TransportJob[];
}): MapContext {
  if (input.mode === "agreement") return agreementContext(input);
  if (input.mode === "driver") return driverContext(input);
  return regionalContext(input);
}

function regionalContext(input: Parameters<typeof buildMapContext>[0]): MapContext {
  const regionFilter = input.region;
  const points = [
    ...input.listings
      .filter((listing) => !regionFilter || sameRegion(listing.regionLabel, regionFilter))
      .map((listing) => listingFeature(listing)),
    ...input.requests
      .filter((request) => !regionFilter || request.preferredRegions.some((item) => sameRegion(item, regionFilter)))
      .map((request) => requestFeature(request)),
    ...input.jobs
      .filter((job) => !regionFilter || sameRegion(job.pickupRegion ?? "", regionFilter) || sameRegion(job.destinationRegion ?? "", regionFilter))
      .map((job) => transportFeature(job, "Regional transport")),
    ...regionalInsights.map(regionFeature),
  ].filter(Boolean) as Feature[];
  return {
    eyebrow: "Regional intelligence map",
    title: regionFilter ? `${regionFilter} operating hub` : "Australian operating hub",
    description:
      "Paddock supply, livestock demand, transport movement, and early rain/feed pressure signals in one place.",
    points,
    routes: emptyLineCollection(),
    bounds: boundsForPoints(points),
    metrics: [
      { label: "Available paddocks", value: String(input.listings.length) },
      { label: "Livestock requests", value: String(input.requests.length) },
      { label: "Transport jobs", value: String(input.jobs.length) },
      { label: "Weather layer", value: "MVP regional signal, live BOM later" },
    ],
    actions: [
      {
        href: "/listings",
        label: "Browse paddocks",
        variant: "secondary",
        icon: <Sprout className="h-4 w-4" aria-hidden />,
      },
      {
        href: "/request/new",
        label: "Create request",
        variant: "primary",
        icon: <MapPin className="h-4 w-4" aria-hidden />,
      },
    ],
  };
}

function agreementContext(input: Parameters<typeof buildMapContext>[0]): MapContext {
  const agreement = input.agreements.find((item) => item.id === input.agreementId) ?? input.agreements[0];
  const listing = input.listings.find((item) => item.id === agreement.listingId);
  const request = input.requests.find((item) => item.id === agreement.requestId);
  const job = input.jobs.find((item) => item.agreementId === agreement.id);
  const points = [
    request ? requestFeature(request, "Agreement pickup") : coordinateFeature(mapCoordinates.dale, "requests", "Dale pickup", "Livestock origin", agreement.livestock),
    listing ? listingFeature(listing, "Agreement destination") : coordinateFeature(mapCoordinates.gundagai, "paddocks", "Brett paddock", "Destination", agreement.feed),
    job ? transportFeature(job, "Private agreement transport") : null,
    ...farmers
      .filter((farmer) => [agreement.farmerAId, agreement.farmerBId, job?.driverId].includes(farmer.id))
      .map(profileFeature),
  ].filter(Boolean) as Feature[];
  const routes = routeCollection([
    lineFromCoordinates(
      "agreement-route",
      "Pickup to paddock",
      agreement.pickupLocation ?? request?.originLocation ?? mapCoordinates.dale,
      agreement.destinationLocation ?? listing?.coordinates ?? mapCoordinates.gundagai
    ),
  ]);
  return {
    eyebrow: "Agreement map",
    title: "Private Dale, Brett and Wayne route",
    description:
      "Only agreement-relevant pickup, destination, parties, and transport position. Commercial agistment pricing stays out of the driver view.",
    points,
    routes,
    bounds: boundsForPointsAndLines(points, routes),
    metrics: [
      { label: "Agreement", value: agreement.status },
      { label: "Stock", value: agreement.livestock },
      { label: "Transport", value: job ? job.status.replace("_", " ") : "not requested" },
      { label: "Privacy", value: "Wayne sees logistics only" },
    ],
    actions: [
      {
        href: `/workspace/${agreement.id}`,
        label: "Agreement room",
        variant: "secondary",
        icon: <Route className="h-4 w-4" aria-hidden />,
      },
      {
        href: job ? `/transport/${job.id}` : `/workspace/${agreement.id}`,
        label: job ? "Transport room" : "Request transport",
        variant: "primary",
        icon: <Truck className="h-4 w-4" aria-hidden />,
      },
    ],
  };
}

function driverContext(input: Parameters<typeof buildMapContext>[0]): MapContext {
  const driver = farmers.find((farmer) => farmer.id === input.driverId) ?? farmers.find((farmer) => farmer.id === "driver-1");
  const jobs = input.jobs.filter(
    (job) =>
      job.id === input.transportId ||
      job.status === "available" ||
      job.driverId === input.driverId
  );
  const points = [
    driver ? profileFeature(driver) : null,
    ...jobs.map((job) => transportFeature(job, job.status === "available" ? "Available job" : "Accepted job")),
  ].filter(Boolean) as Feature[];
  const routes = routeCollection(
    jobs.map((job) =>
      lineFromCoordinates(
        `route-${job.id}`,
        job.routeSummary,
        job.pickupLocation ?? coordinateForRegion(job.pickupRegion) ?? mapCoordinates.dale,
        job.destinationLocation ?? coordinateForRegion(job.destinationRegion) ?? mapCoordinates.gundagai
      )
    )
  );
  return {
    eyebrow: "Driver job map",
    title: `${driver?.name ?? "Driver"} route board`,
    description:
      "Available and accepted jobs, route corridors, dates, and backload context without exposing private agistment terms.",
    points,
    routes,
    bounds: boundsForPointsAndLines(points, routes),
    metrics: [
      { label: "Available jobs", value: String(jobs.filter((job) => job.status === "available").length) },
      { label: "Accepted jobs", value: String(jobs.filter((job) => job.status !== "available").length) },
      { label: "Driver privacy", value: "No agistment rate layer" },
      { label: "Live GPS", value: "Prepared, not active yet" },
    ],
    actions: [
      {
        href: "/transport/jobs",
        label: "Available jobs",
        variant: "primary",
        icon: <Truck className="h-4 w-4" aria-hidden />,
      },
      {
        href: "/transport/calendar",
        label: "Driver calendar",
        variant: "secondary",
        icon: <CalendarDays className="h-4 w-4" aria-hidden />,
      },
    ],
  };
}

function listingFeature(listing: PaddockListing, modeHint?: string): Feature | null {
  const coordinate = listing.coordinates ?? coordinateForRegion(listing.regionLabel);
  if (!coordinate) return null;
  return coordinateFeature(
    coordinate,
    "paddocks",
    listing.title,
    `${listing.acres} acres near ${listing.location}`,
    `${listing.feedStatus} feed, ${listing.waterStatus.toLowerCase()} water`,
    `/listings/${listing.id}`,
    "Visible marketplace paddock signal.",
    modeHint
  );
}

function requestFeature(request: LivestockRequest, modeHint?: string): Feature | null {
  const coordinate =
    request.originLocation ??
    coordinateForRegion(request.preferredRegions[0]) ??
    mapCoordinates.dale;
  return coordinateFeature(
    coordinate,
    "requests",
    `${request.headCount} ${request.breed} ${request.stockType}`,
    `Looking in ${request.preferredRegions.join(", ")}`,
    `${request.duration}, transport ${request.transportRequired.toLowerCase()}`,
    "/request/new",
    "Livestock owner demand signal.",
    modeHint
  );
}

function transportFeature(job: TransportJob, modeHint?: string): Feature | null {
  const coordinate =
    job.currentLocation ??
    job.pickupLocation ??
    coordinateForRegion(job.pickupRegion) ??
    mapCoordinates.wayne;
  return coordinateFeature(
    coordinate,
    "transport",
    `${job.livestockCount} movement`,
    `${job.pickup} to ${job.destination}`,
    `${job.preferredDate}, ${job.status.replace("_", " ")}`,
    `/transport/${job.id}`,
    "Driver sees logistics only. Private agistment pricing is not included.",
    modeHint
  );
}

function profileFeature(farmer: Farmer): Feature | null {
  const coordinate = farmer.location ?? coordinateForRegion(farmer.region);
  if (!coordinate) return null;
  return coordinateFeature(
    coordinate,
    "profiles",
    farmer.name,
    `${farmer.role}, ${farmer.region}`,
    farmer.tagline,
    "/profile",
    "Profile location signal.",
    farmer.role
  );
}

function regionFeature(insight: (typeof regionalInsights)[number]): Feature | null {
  const coordinate = coordinateForRegion(insight.region);
  if (!coordinate) return null;
  return coordinateFeature(
    coordinate,
    "weather",
    insight.region,
    `Feed ${insight.feed.toLowerCase()}, pressure ${insight.pressure.toLowerCase()}`,
    `${insight.availability}% paddock availability`,
    `/listings?regions=${encodeURIComponent(insight.region)}`,
    "MVP regional rain/feed signal. Live weather integration comes later."
  );
}

function coordinateFeature(
  coordinate: Coordinate,
  kind: LayerKey,
  title: string,
  subtitle: string,
  metric: string,
  href?: string,
  privacy?: string,
  modeHint?: string
): Feature {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coordinate.longitude, coordinate.latitude],
    },
    properties: {
      id: `${kind}-${title}-${coordinate.longitude}-${coordinate.latitude}`,
      kind,
      title,
      subtitle,
      metric,
      href,
      privacy,
      modeHint,
    },
  };
}

function lineFromCoordinates(
  id: string,
  title: string,
  from?: Coordinate,
  to?: Coordinate
): LineFeature | null {
  if (!from || !to) return null;
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
      ],
    },
    properties: { id, title },
  };
}

function routeCollection(lines: (LineFeature | null)[]): FeatureCollection<LineFeature> {
  return { type: "FeatureCollection", features: lines.filter(Boolean) as LineFeature[] };
}

function emptyFeatureCollection(): FeatureCollection<Feature> {
  return { type: "FeatureCollection", features: [] };
}

function emptyLineCollection(): FeatureCollection<LineFeature> {
  return { type: "FeatureCollection", features: [] };
}

function boundsForPoints(points: Feature[]): [[number, number], [number, number]] | undefined {
  const coordinates = points.map((point) => point.geometry.coordinates);
  if (!coordinates.length) return undefined;
  return boundsForCoordinates(coordinates);
}

function boundsForPointsAndLines(
  points: Feature[],
  lines: FeatureCollection<LineFeature>
): [[number, number], [number, number]] | undefined {
  return boundsForCoordinates([
    ...points.map((point) => point.geometry.coordinates),
    ...lines.features.flatMap((line) => line.geometry.coordinates),
  ]);
}

function boundsForCoordinates(
  coordinates: [number, number][]
): [[number, number], [number, number]] | undefined {
  if (!coordinates.length) return undefined;
  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const padLng = Math.max((maxLng - minLng) * 0.18, 0.5);
  const padLat = Math.max((maxLat - minLat) * 0.18, 0.5);
  return [
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
  ];
}

function sameRegion(left: string, right: string) {
  return left === right || left.replace(" NSW", "") === right.replace(" NSW", "");
}

function labelForKind(kind: LayerKey) {
  const labels: Record<LayerKey, string> = {
    paddocks: "Paddock",
    requests: "Livestock request",
    transport: "Transport",
    profiles: "Profile",
    weather: "Rain/feed",
  };
  return labels[kind];
}

function ModeIcon({ mode }: { mode: PaddockMapMode }) {
  if (mode === "driver") return <Truck className="mt-0.5 h-5 w-5 text-sage-deep" aria-hidden />;
  if (mode === "agreement") return <Route className="mt-0.5 h-5 w-5 text-sage-deep" aria-hidden />;
  return <MapPin className="mt-0.5 h-5 w-5 text-sage-deep" aria-hidden />;
}
