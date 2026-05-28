"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  Banknote,
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
  transportCapacities,
  transportJobs,
  type Agreement,
  type Farmer,
  type LivestockRequest,
  type PaddockListing,
  type TransportCapacity,
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

type MapFeatureItem = {
  label: string;
  detail: string;
  href?: string;
};

type MapFeatureProperties = {
  id: string;
  kind: LayerKey;
  title: string;
  subtitle: string;
  metric: string;
  href?: string;
  privacy?: string;
  modeHint?: string;
  display?: "point" | "hotspot" | "route-endpoint";
  count?: number;
  items?: MapFeatureItem[];
  routeState?: "available" | "negotiation" | "accepted" | "capacity";
  priceLabel?: string;
  // Transport route popup enrichment — populated by the route feature builders.
  routeHeadline?: string;  // "Darling Downs QLD → Maranoa QLD"
  stockSummary?: string;   // "120 head, Cattle"
  dateWindow?: string;     // "Thu 28 May – Sat 30 May"
  driverName?: string;     // "Sharon Mackie"
};

type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapFeatureProperties;
};

type LineFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: MapFeatureProperties;
};

type FeatureCollection<TFeature extends Feature | LineFeature> = {
  type: "FeatureCollection";
  features: TFeature[];
};

type DriverBoardItem = {
  id: string;
  label: string;
  detail: string;
  status: string;
  href: string;
  featureId: string;
};

type DriverBoardState = {
  label: string;
  bounds: [[number, number], [number, number]];
};

type PaddockMapProps = {
  mode?: PaddockMapMode;
  agreementId?: string;
  transportId?: string;
  driverId?: string;
  region?: string;
};

const australiaBounds: [[number, number], [number, number]] = [
  [111.5, -44.5],
  [154.5, -10],
];
const australiaCentre: [number, number] = [134.5, -25.5];
const australiaZoom = 3.62;
const transportRouteZoomThreshold = 6;
// Prefer the Vercel env var so the production key can be rotated
// without a code change. Falls back to a baked demo key so /map renders
// the Google basemap immediately for investor walkthroughs. The fallback
// key is restricted by HTTP referrer in Google Cloud Console.
const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  "AIzaSyAG3EVoUUNfk0amP7J40Dy1NpmGG3_1L18";
const knownDriverNames: Record<string, string> = {
  "driver-1": "Wayne Hayes",
  "driver-2": "Sharon Mackie",
};

const stateViewBounds: Record<"NSW" | "QLD", [[number, number], [number, number]]> = {
  NSW: [
    [140.6, -37.8],
    [153.9, -28],
  ],
  QLD: [
    [137.6, -29.6],
    [153.9, -9.8],
  ],
};

// Sage-branded basemap style applied to all Google Maps instances so tiles
// match the PaddockME palette instead of the default grey/blue.
const PADDOCKME_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f0ede7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5dfd4" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6d6257" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9dce3" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#3f3328" }] },
];

export function PaddockMap({
  mode = "regional",
  agreementId,
  transportId,
  driverId = "driver-1",
  region,
}: PaddockMapProps) {
  const [selected, setSelected] = useState<MapFeatureProperties | null>(null);
  const [mapZoom, setMapZoom] = useState(mode === "regional" && !region ? australiaZoom : 6.3);
  const [googleMapReady, setGoogleMapReady] = useState(false);
  const [googleMapError, setGoogleMapError] = useState<string | null>(null);
  const googleMapEnabled = !!googleMapsApiKey && !googleMapError;
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    paddocks: true,
    requests: true,
    transport: true,
    profiles: mode !== "regional",
    weather: true,
  });
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [focusBounds, setFocusBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [state, setState] = useState(() => ({
    paddockListings,
    livestockRequests,
    agreements,
    transportJobs,
    transportCapacities,
  }));

  useEffect(() => {
    setState({ ...loadPrototypeState(), transportCapacities });
  }, []);

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
        capacities: state.transportCapacities,
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
      features: context.points.filter((feature) => {
        if (!enabled.has(feature.properties.kind)) return false;
        if (feature.properties.kind !== "transport") return true;
        const isHotspot = feature.properties.display === "hotspot";
        const shouldSummariseTransport =
          mode === "regional" && mapZoom < transportRouteZoomThreshold;
        return shouldSummariseTransport ? isHotspot : !isHotspot;
      }),
    } satisfies FeatureCollection<Feature>;
  }, [context.points, layers, mapZoom, mode]);

  const visibleRoutes = useMemo(() => {
    if (!layers.transport) return emptyLineCollection();
    if (mode === "regional" && mapZoom < transportRouteZoomThreshold) {
      return emptyLineCollection();
    }
    return context.routes;
  }, [context.routes, layers.transport, mapZoom, mode]);

  const visibleRouteEndpoints = useMemo(
    () => routeEndpointCollection(visibleRoutes.features),
    [visibleRoutes]
  );

  function locateOperationalView() {
    setSelected(null);
  }

  function focusMapFeature(featureId: string) {
    const route = context.routes.features.find((feature) => feature.properties.id === featureId);
    if (route) {
      setSelected(route.properties);
      const coords = route.geometry.coordinates;
      if (coords.length >= 2) {
        const lons = coords.map(([lng]) => lng);
        const lats = coords.map(([, lat]) => lat);
        const pad = 0.5;
        setFocusBounds([
          [Math.min(...lons) - pad, Math.min(...lats) - pad],
          [Math.max(...lons) + pad, Math.max(...lats) + pad],
        ]);
      }
      return;
    }
    const point = context.points.find((feature) => feature.properties.id === featureId);
    if (point) {
      setSelected(point.properties);
    }
  }

  function focusMapState(bounds: [[number, number], [number, number]]) {
    const centre: [number, number] = [
      (bounds[0][0] + bounds[1][0]) / 2,
      (bounds[0][1] + bounds[1][1]) / 2,
    ];
    setSelected({
      id: `state-${centre.join("-")}`,
      kind: "transport",
      title: "State route view",
      subtitle: "Map centred on the selected driver operating region.",
      metric: "Choose a route card to inspect a specific job or backload lane.",
      privacy: "Driver view only: logistics and route economics, not private agistment terms.",
    });
  }

  return (
    <section className="overflow-hidden rounded-[8px] border border-mist bg-cream shadow-sm shadow-bark/5">
      <div className={cn("grid lg:grid-cols-[minmax(0,1fr)_22rem]", mode === "driver" ? "min-h-[82dvh]" : "min-h-[72dvh]")}>
        <div className={cn("relative", mode === "driver" ? "min-h-[78dvh]" : "min-h-[68dvh]")}>
          <GoogleOperationalMap
            points={visiblePointData.features}
            routes={visibleRoutes.features}
            routeEndpoints={visibleRouteEndpoints.features}
            bounds={focusBounds ?? context.bounds}
            mode={mode}
            onSelect={setSelected}
            onDeselect={() => setSelected(null)}
            selectedFeatureId={selected?.id ?? null}
            hoveredFeatureId={hoveredFeatureId}
            onZoomChange={setMapZoom}
            onReady={() => {
              setGoogleMapReady(true);
              setGoogleMapError(null);
            }}
            onError={setGoogleMapError}
          />
          <OperationalMapLayer
            points={visiblePointData.features}
            routes={visibleRoutes.features}
            routeEndpoints={visibleRouteEndpoints.features}
            active={!googleMapEnabled}
            onSelect={setSelected}
          />
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-end gap-2 sm:inset-x-4 sm:top-4">
            <button
              type="button"
              onClick={locateOperationalView}
              className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-mist bg-warm-white/95 px-3 text-sm font-bold text-sage-deep shadow-lg shadow-bark/10 backdrop-blur transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
            >
              <LocateFixed className="h-4 w-4" aria-hidden />
              Re-centre
            </button>
            {(googleMapError || !googleMapsApiKey) && (
              <div className="pointer-events-auto rounded-[8px] border border-amber/30 bg-amber-light px-3 py-2 text-sm font-semibold text-amber shadow-lg shadow-bark/10">
                {googleMapsApiKey ? "Stable map active" : "Add Google Maps key"}
              </div>
            )}
          </div>

          {mode === "driver" && !selected ? null : (
            <div className="absolute bottom-3 left-3 right-3 z-10 lg:hidden">
              <MapSheet selected={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>

        <aside className="border-t border-mist bg-warm-white p-4 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            <LayerControls layers={layers} onChange={setLayers} />
            {context.driverBoard ? (
              <DriverRouteBoard
                board={context.driverBoard}
                onFocus={focusMapFeature}
                onFocusState={focusMapState}
                onHover={setHoveredFeatureId}
                onUnhover={() => setHoveredFeatureId(null)}
              />
            ) : null}
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
            <span className="min-w-0 flex-1 text-left">{label}</span>
            <LayerSwatch kind={key} active={layers[key]} />
          </button>
        ))}
      </div>
    </div>
  );
}

function LayerSwatch({ kind, active }: { kind: LayerKey; active: boolean }) {
  return (
    <span
      className={cn(
        "relative h-6 w-6 shrink-0 rounded-full border border-warm-white shadow-sm transition",
        active ? "opacity-100" : "opacity-35 grayscale"
      )}
      style={{ backgroundColor: colourForKind(kind) }}
      aria-hidden
    >
      <span
        className="absolute inset-[-0.35rem] rounded-full"
        style={{ backgroundColor: colourForKind(kind), opacity: fieldOpacityForKind(kind) }}
      />
      <span className="absolute inset-[0.32rem] rounded-full border border-warm-white bg-current" />
    </span>
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

function DriverRouteBoard({
  board,
  onFocus,
  onFocusState,
  onHover,
  onUnhover,
}: {
  board: NonNullable<MapContext["driverBoard"]>;
  onFocus: (featureId: string) => void;
  onFocusState: (bounds: [[number, number], [number, number]]) => void;
  onHover: (featureId: string) => void;
  onUnhover: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const statusCounts = board.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const filterOptions: { label: string; value: string | null; count: number }[] = [
    { label: "All", value: null, count: board.items.length },
    ...Object.entries(statusCounts).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: status,
      count,
    })),
  ];

  const visibleItems = statusFilter
    ? board.items.filter((item) => item.status === statusFilter)
    : board.items;

  return (
    <div className="rounded-[8px] border border-mist bg-cream p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
            {board.title}
          </h3>
          <p className="mt-1 text-sm text-stone">{board.helper}</p>
        </div>
        <Truck className="mt-0.5 h-5 w-5 text-sage-deep" aria-hidden />
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {board.states.map((state) => (
          <button
            key={state.label}
            type="button"
            onClick={() => onFocusState(state.bounds)}
            className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-mist bg-warm-white px-3 text-sm font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            {state.label}
          </button>
        ))}
      </div>
      {filterOptions.length > 2 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value ?? "all"}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                statusFilter === opt.value
                  ? "border-sage-deep bg-sage-mist text-sage-deep"
                  : "border-mist bg-warm-white text-stone hover:border-sage hover:bg-sage-mist"
              )}
            >
              {opt.label}
              <span className="rounded-full bg-current/10 px-1 tabular-nums">{opt.count}</span>
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[8px] border border-mist bg-warm-white p-3 transition hover:border-sage/40 hover:shadow-sm"
            onMouseEnter={() => onHover(item.featureId)}
            onMouseLeave={onUnhover}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-bark">{item.label}</p>
                <p className="mt-1 text-xs text-stone">{item.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-sage-mist px-2 py-1 text-[0.68rem] font-bold uppercase text-sage-deep">
                {item.status}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onFocus(item.featureId)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-sage-deep bg-sage-mist px-3 text-sm font-bold text-sage-deep transition hover:bg-[#dcebd9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
              >
                <Route className="h-4 w-4" aria-hidden />
                Focus route
              </button>
              <ButtonLink href={item.href} variant="secondary" className="w-full">
                <Navigation className="h-4 w-4" aria-hidden />
                Open
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransportRoutePopup({
  selected,
  onClose,
}: {
  selected: MapFeatureProperties;
  onClose: () => void;
}) {
  const isRequestable =
    selected.routeState === "available" || selected.routeState === "capacity";
  const ctaLabel = isRequestable ? "Request this run" : "Open transport room";
  const ctaHref = isRequestable
    ? "/transport/available"
    : (selected.href ?? "/transport/available");
  const distanceMatch = selected.metric.match(/\d+\s*km/);

  return (
    <div className="paddockme-map-popup-enter">
      {/* header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-stone">
            Transport route
          </p>
          <h3 className="font-display mt-1 text-[1.2rem] leading-tight text-sage-deep">
            {selected.routeHeadline}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close route detail"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-stone transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* info tiles */}
      <div className="grid grid-cols-2 gap-2">
        {selected.stockSummary && (
          <div className="flex items-start gap-2 rounded-[8px] border border-sage-mist bg-sage-mist/50 px-3 py-2.5">
            <Truck className="mt-px h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-stone">Stock</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-bark">
                {selected.stockSummary}
              </p>
            </div>
          </div>
        )}
        {selected.dateWindow && (
          <div className="flex items-start gap-2 rounded-[8px] border border-sage-mist bg-sage-mist/50 px-3 py-2.5">
            <CalendarDays className="mt-px h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-stone">Date</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-bark">
                {selected.dateWindow}
              </p>
            </div>
          </div>
        )}
        {selected.priceLabel && (
          <div className="flex items-start gap-2 rounded-[8px] border border-sage-mist bg-sage-mist/50 px-3 py-2.5">
            <Banknote className="mt-px h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-stone">Rate</p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-bark">
                {selected.priceLabel}
              </p>
            </div>
          </div>
        )}
        {distanceMatch && (
          <div className="flex items-start gap-2 rounded-[8px] border border-sage-mist bg-sage-mist/50 px-3 py-2.5">
            <Route className="mt-px h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.62rem] font-bold uppercase tracking-wide text-stone">
                Distance
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-bark">
                {distanceMatch[0]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* driver / status line */}
      {selected.driverName && (
        <p className="mt-3 text-xs text-stone">
          {selected.driverName}
          {selected.routeState
            ? ` · ${selected.routeState.replace(/_/g, " ")}`
            : ""}
        </p>
      )}

      {/* privacy note */}
      {selected.privacy && (
        <p className="mt-2 text-xs font-semibold text-sage-deep">{selected.privacy}</p>
      )}

      {/* primary CTA */}
      <ButtonLink href={ctaHref} className="mt-4 w-full">
        {isRequestable ? (
          <Truck className="h-4 w-4" aria-hidden />
        ) : (
          <Navigation className="h-4 w-4" aria-hidden />
        )}
        {ctaLabel}
      </ButtonLink>

      {/* secondary — only when the primary doesn't land on the listings page */}
      {ctaHref !== "/transport/available" && (
        <div className="mt-2.5 text-center">
          <ButtonLink
            href="/transport/available"
            variant="ghost"
            className="text-xs"
          >
            View all available runs
          </ButtonLink>
        </div>
      )}
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

  // Transport route — show the branded popup instead of the generic panel.
  if (selected.routeHeadline) {
    return (
      <div className="rounded-[8px] border border-sage-mist/80 bg-cream p-4 shadow-lg shadow-bark/10">
        <TransportRoutePopup selected={selected} onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="paddockme-map-popup-enter rounded-[8px] border border-mist bg-warm-white/95 p-4 shadow-lg shadow-bark/10 backdrop-blur">
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
      {selected.items?.length ? (
        <div className="mt-3 rounded-[8px] border border-mist bg-cream p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            Jobs in this hotspot
          </p>
          <div className="mt-2 space-y-2">
            {selected.items.map((item) => (
              <div
                key={`${item.label}-${item.detail}`}
                className="rounded-[8px] border border-mist/80 bg-warm-white p-2"
              >
                <p className="text-sm font-bold text-bark">{item.label}</p>
                <p className="mt-0.5 text-xs text-stone">{item.detail}</p>
                {item.href ? (
                  <ButtonLink href={item.href} variant="ghost" className="mt-2 w-full">
                    <Navigation className="h-4 w-4" aria-hidden />
                    Open job
                  </ButtonLink>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
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

type RouteOverlayEntry = {
  id: string;
  overlayType: "polyline" | "renderer";
  overlay: google.maps.Polyline | google.maps.DirectionsRenderer;
  baseWeight: number;
  baseOpacity: number;
  strokeColor: string;
  routeState?: MapFeatureProperties["routeState"];
};

function GoogleOperationalMap({
  points,
  routes,
  routeEndpoints,
  bounds,
  mode,
  onSelect,
  onDeselect,
  onZoomChange,
  onReady,
  onError,
  selectedFeatureId,
  hoveredFeatureId,
}: {
  points: Feature[];
  routes: LineFeature[];
  routeEndpoints: Feature[];
  bounds?: [[number, number], [number, number]];
  mode: PaddockMapMode;
  onSelect: (properties: MapFeatureProperties) => void;
  onDeselect: () => void;
  onZoomChange: (zoom: number) => void;
  onReady: () => void;
  onError: (message: string | null) => void;
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<
    (google.maps.Marker | google.maps.Polyline | google.maps.DirectionsRenderer)[]
  >([]);
  const routeOverlaysRef = useRef<RouteOverlayEntry[]>([]);
  // Mirrors selectedFeatureId and hoveredFeatureId in refs so async Directions
  // callbacks can read the latest values without being in their closure.
  const selectedFeatureIdRef = useRef<string | null>(selectedFeatureId);
  const hoveredFeatureIdRef = useRef<string | null>(hoveredFeatureId);
  // Stable ref for the deselect callback so the init effect doesn't re-run
  // on every render (onDeselect is a new arrow function each render).
  const onDeselectRef = useRef(onDeselect);
  // Tracks the last bounds we auto-fitted to. Used to skip refit on
  // every overlay re-render so the user can zoom in without snapping
  // back to the country-wide view.
  const lastFitBoundsRef = useRef<string | null>(null);

  useEffect(() => { selectedFeatureIdRef.current = selectedFeatureId; }, [selectedFeatureId]);
  useEffect(() => { hoveredFeatureIdRef.current = hoveredFeatureId; }, [hoveredFeatureId]);
  useEffect(() => { onDeselectRef.current = onDeselect; }, [onDeselect]);

  // Dims non-selected routes and intensifies the selected/hovered one. Uses refs
  // only so it is safe to call from async Directions callbacks.
  const applyDimming = useCallback(() => {
    const sid = selectedFeatureIdRef.current;
    const hid = hoveredFeatureIdRef.current;
    const focusId = sid ?? hid;
    for (const entry of routeOverlaysRef.current) {
      const isFocused = !!focusId && entry.id === focusId;
      const opacity = focusId ? (isFocused ? entry.baseOpacity : 0.18) : entry.baseOpacity;
      // Weight boost only when explicitly selected, not just hovered.
      const weight = (isFocused && !!sid) ? entry.baseWeight + 2 : entry.baseWeight;
      if (entry.overlayType === "polyline") {
        (entry.overlay as google.maps.Polyline).setOptions({
          strokeOpacity: opacity,
          strokeWeight: weight,
        });
      } else {
        (entry.overlay as google.maps.DirectionsRenderer).setOptions({
          polylineOptions: {
            strokeColor: entry.strokeColor,
            strokeOpacity: opacity,
            strokeWeight: weight,
            clickable: true,
          },
        });
      }
    }
  }, []);

  useEffect(() => { applyDimming(); }, [applyDimming, selectedFeatureId]);
  useEffect(() => { applyDimming(); }, [applyDimming, hoveredFeatureId]);

  useEffect(() => {
    if (!googleMapsApiKey || !containerRef.current || mapRef.current) return;
    let cancelled = false;
    setOptions({
      key: googleMapsApiKey,
      v: "weekly",
    });
    Promise.all([importLibrary("maps"), importLibrary("routes")])
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: googleLatLng(australiaCentre),
          zoom: mode === "regional" ? australiaZoom : 6.3,
          minZoom: 3,
          maxZoom: 15,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          backgroundColor: "#eef3e8",
          styles: PADDOCKME_MAP_STYLE,
        });
        map.addListener("zoom_changed", () => onZoomChange(map.getZoom() ?? australiaZoom));
        // Clicking blank map clears selection — use ref so this listener
        // doesn't cause the init effect to re-run on every render.
        map.addListener("click", () => onDeselectRef.current());
        mapRef.current = map;
        onError(null);
        onReady();
      })
      .catch((error: unknown) => {
        onError(error instanceof Error ? error.message : "Google Maps failed to load.");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, onError, onReady, onZoomChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
    routeOverlaysRef.current = [];

    const directionsService = new google.maps.DirectionsService();
    routes.forEach((route) => {
      const path = route.geometry.coordinates.map(googleLatLng);
      const [origin] = path;
      const destination = path[path.length - 1];
      const waypoints = path.slice(1, -1).slice(0, 23).map((location) => ({
        location,
        stopover: false,
      }));
      const strokeColor = routeColourForState(route.properties.routeState, "core");
      const baseOpacity = baseOpacityForRouteState(route.properties.routeState);
      const fallback = drawGooglePolyline(map, route, path, onSelect);
      overlaysRef.current.push(fallback);
      routeOverlaysRef.current.push({
        id: route.properties.id,
        overlayType: "polyline",
        overlay: fallback,
        baseWeight: 4,
        baseOpacity,
        strokeColor,
        routeState: route.properties.routeState,
      });

      if (!origin || !destination) return;
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result, status) => {
          if (status !== google.maps.DirectionsStatus.OK || !result) return;
          fallback.setMap(null);
          // Remove the fallback entry from route tracking before adding renderer.
          routeOverlaysRef.current = routeOverlaysRef.current.filter(
            (e) => e.overlay !== fallback
          );
          const baseWeight = mode === "driver" ? 5 : 4;
          const rendererOpacity = baseOpacityForRouteState(route.properties.routeState);
          const renderer = new google.maps.DirectionsRenderer({
            directions: result,
            map,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor,
              strokeOpacity: rendererOpacity,
              strokeWeight: baseWeight,
              clickable: true,
            },
          });
          renderer.addListener("click", () => onSelect(route.properties));
          overlaysRef.current.push(renderer);
          routeOverlaysRef.current.push({
            id: route.properties.id,
            overlayType: "renderer",
            overlay: renderer,
            baseWeight,
            baseOpacity: rendererOpacity,
            strokeColor,
            routeState: route.properties.routeState,
          });
          // Re-apply dimming now that the renderer is live.
          applyDimming();
        }
      );

      if (route.properties.priceLabel) {
        const priceMarker = new google.maps.Marker({
          position: path[Math.floor(path.length / 2)],
          map,
          label: {
            text: route.properties.priceLabel,
            color: "#22542b",
            fontSize: "12px",
            fontWeight: "700",
            className: "paddockme-map-price-pill",
          },
          // Invisible anchor icon - the .paddockme-map-price-pill label
          // does all the visual work, floated above the route line. Keeps
          // the marker centred on the route without the icon competing
          // with the pill.
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
            fillOpacity: 0,
            strokeOpacity: 0,
          },
          title: route.properties.title,
          optimized: false,
        });
        priceMarker.addListener("click", () => onSelect(route.properties));
        overlaysRef.current.push(priceMarker);
      }
    });

    [...points, ...routeEndpoints].forEach((point) => {
      const marker = new google.maps.Marker({
        position: googleLatLng(point.geometry.coordinates),
        map,
        title: point.properties.title,
        label:
          point.properties.display === "hotspot" && point.properties.count
            ? {
                text: String(point.properties.count),
                color: "#5c3217",
                fontSize: "12px",
                fontWeight: "800",
              }
            : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: point.properties.display === "hotspot" ? 13 : 7,
          fillColor: colourForKind(point.properties.kind),
          fillOpacity: point.properties.display === "hotspot" ? 0.92 : 0.98,
          strokeColor: "#fdfcf9",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelect(point.properties));
      overlaysRef.current.push(marker);
    });

    const fitBounds = bounds ?? boundsForPointsAndLines(points, { type: "FeatureCollection", features: routes });
    if (fitBounds) {
      // Only auto-fit when the bounds prop itself changes meaningfully -
      // not on every layer toggle / selection / re-render. Otherwise the
      // map snaps back to country-wide view every time the user zooms in.
      const serialised = JSON.stringify(fitBounds);
      if (lastFitBoundsRef.current !== serialised) {
        lastFitBoundsRef.current = serialised;
        map.fitBounds(
          new google.maps.LatLngBounds(
            googleLatLng(fitBounds[0]),
            googleLatLng(fitBounds[1])
          ),
          72
        );
      }
    }
  }, [applyDimming, bounds, mode, onSelect, points, routeEndpoints, routes]);

  if (!googleMapsApiKey) return null;
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Google Maps operational layer"
    />
  );
}

function drawGooglePolyline(
  map: google.maps.Map,
  route: LineFeature,
  path: google.maps.LatLngLiteral[],
  onSelect: (properties: MapFeatureProperties) => void
) {
  const polyline = new google.maps.Polyline({
    map,
    path,
    strokeColor: routeColourForState(route.properties.routeState, "core"),
    strokeOpacity: 0.85,
    strokeWeight: 4,
    clickable: true,
  });
  polyline.addListener("click", () => onSelect(route.properties));
  return polyline;
}

function googleLatLng([longitude, latitude]: [number, number]): google.maps.LatLngLiteral {
  return { lat: latitude, lng: longitude };
}

function OperationalMapLayer({
  points,
  routes,
  routeEndpoints,
  active,
  onSelect,
}: {
  points: Feature[];
  routes: LineFeature[];
  routeEndpoints: Feature[];
  active: boolean;
  onSelect: (properties: MapFeatureProperties) => void;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-[1] bg-[#eef3e8] transition-opacity duration-300",
        active ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-label="PaddockME stable operational map"
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
            <g key={route.properties.id}>
              <path
                d={path}
                fill="none"
                stroke={route.properties.kind === "transport" ? routeColourForState(route.properties.routeState, "shadow") : colourForKind(route.properties.kind)}
                strokeWidth={route.properties.kind === "transport" ? "2.4" : "2.5"}
                strokeLinecap="round"
                opacity={route.properties.kind === "transport" ? "0.16" : "0.18"}
              />
              <path
                d={path}
                fill="none"
                stroke={route.properties.kind === "transport" ? routeColourForState(route.properties.routeState, "vein") : colourForKind(route.properties.kind)}
                strokeWidth={route.properties.kind === "transport" ? "1.3" : "1.6"}
                strokeLinecap="round"
                opacity={route.properties.kind === "transport" ? "0.34" : "0.35"}
              />
              <path
                d={path}
                fill="none"
                stroke={route.properties.kind === "transport" ? routeColourForState(route.properties.routeState, "core") : colourForKind(route.properties.kind)}
                strokeWidth={route.properties.kind === "transport" ? "0.62" : "1.1"}
                strokeLinecap="round"
                opacity={route.properties.kind === "transport" ? "0.96" : "0.88"}
              />
            </g>
          );
        })}
        {routeEndpoints.map((point) => {
          const projected = projectCoordinate(point.geometry.coordinates);
          return (
            <circle
              key={point.properties.id}
              cx={projected.x}
              cy={projected.y}
              r="1.35"
              fill="#fdfcf9"
              stroke={colourForKind(point.properties.kind)}
              strokeWidth="0.55"
            />
          );
        })}
        {points.map((point) => {
          const projected = projectCoordinate(point.geometry.coordinates);
          return (
            <g key={point.properties.id}>
              <circle
                cx={projected.x}
                cy={projected.y}
                r={
                  point.properties.display === "hotspot"
                    ? fieldRadiusForKind(point.properties.kind) + Math.min(point.properties.count ?? 1, 6) * 0.9
                    : fieldRadiusForKind(point.properties.kind)
                }
                fill={colourForKind(point.properties.kind)}
                opacity={fieldOpacityForKind(point.properties.kind)}
              />
              <circle
                cx={projected.x}
                cy={projected.y}
                r={point.properties.display === "hotspot" ? "2.8" : "1.55"}
                fill={colourForKind(point.properties.kind)}
                stroke="#fdfcf9"
                strokeWidth="0.55"
                filter="url(#pin-shadow)"
              />
              {point.properties.display === "hotspot" ? (
                <text
                  x={projected.x}
                  y={projected.y + 0.45}
                  textAnchor="middle"
                  fontSize="2.35"
                  fontWeight="700"
                  fill="#5c3217"
                  stroke="#fdfcf9"
                  strokeWidth="0.28"
                  paintOrder="stroke"
                >
                  {point.properties.count}
                </text>
              ) : null}
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
        {routeEndpoints.map((point) => {
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
        Stable operational map. Live map tiles enhance this view when available, but the pins and routes do not depend on them.
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
  driverBoard?: {
    title: string;
    helper: string;
    states: DriverBoardState[];
    items: DriverBoardItem[];
  };
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
    transport: "#e88f3f",
    profiles: "#d4a853",
    weather: "#9b7adf",
  };
  return colours[kind];
}

function baseOpacityForRouteState(state: MapFeatureProperties["routeState"]): number {
  if (state === "available") return 0.92;
  if (state === "capacity") return 0.88;
  if (state === "negotiation" || state === "accepted") return 0.75;
  return 0.85;
}

function routeColourForState(
  state: MapFeatureProperties["routeState"],
  layer: "shadow" | "vein" | "core"
) {
  const colours = {
    available: { shadow: "#8fcf9a", vein: "#d7f0d6", core: "#4e9f5b" },
    negotiation: { shadow: "#e88f3f", vein: "#f7c27d", core: "#d86f24" },
    accepted: { shadow: "#e88f3f", vein: "#f7c27d", core: "#d86f24" },
    capacity: { shadow: "#d4a853", vein: "#f3ddb0", core: "#a97924" },
  } satisfies Record<NonNullable<MapFeatureProperties["routeState"]>, Record<"shadow" | "vein" | "core", string>>;
  return colours[state ?? "accepted"][layer];
}

function fieldRadiusForKind(kind: LayerKey) {
  const radii: Record<LayerKey, number> = {
    paddocks: 5.8,
    requests: 5.8,
    transport: 7.2,
    profiles: 4.8,
    weather: 9,
  };
  return radii[kind];
}

function fieldOpacityForKind(kind: LayerKey) {
  const opacity: Record<LayerKey, number> = {
    paddocks: 0.16,
    requests: 0.16,
    transport: 0.2,
    profiles: 0.18,
    weather: 0.24,
  };
  return opacity[kind];
}

function rainTrendForPressure(pressure: string) {
  if (pressure === "High") return "rain deficit trend rising";
  if (pressure === "Medium") return "rainfall mixed, watch next 7 days";
  return "feed cover stable";
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
  capacities: TransportCapacity[];
}): MapContext {
  if (input.mode === "agreement") return agreementContext(input);
  if (input.mode === "driver") return driverContext(input);
  return regionalContext(input);
}

function regionalContext(input: Parameters<typeof buildMapContext>[0]): MapContext {
  const regionFilter = input.region;
  const routes = routeCollection([
    ...input.jobs
      .filter((job) => !regionFilter || sameRegion(job.pickupRegion ?? "", regionFilter) || sameRegion(job.destinationRegion ?? "", regionFilter))
      .map((job) => transportJobRouteFeature(job)),
    ...input.capacities
      .filter((capacity) => !regionFilter || sameRegion(capacity.originRegion, regionFilter) || sameRegion(capacity.destinationRegion, regionFilter))
      .map((capacity) => transportCapacityRouteFeature(capacity)),
  ]);
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
    ...transportHotspotFeatures(input.jobs, input.capacities, regionFilter),
    ...regionalInsights.map(regionFeature),
  ].filter(Boolean) as Feature[];
  return {
    eyebrow: "Regional intelligence map",
    title: regionFilter ? `${regionFilter} operating hub` : "Australian operating hub",
    description:
      "Paddock supply, livestock demand, driver route availability, transport movement, and early rain/feed pressure signals in one place.",
    points,
    routes,
    bounds: regionFilter ? boundsForPoints(points) : australiaBounds,
    metrics: [
      { label: "Available paddocks", value: String(input.listings.length) },
      { label: "Livestock requests", value: String(input.requests.length) },
      { label: "Transport routes", value: String(routes.features.length) },
      { label: "Rain/feed hotspots", value: String(regionalInsights.length) },
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
      "transport",
      "Dale to Brett movement",
      "Private agreement transport corridor",
      "/transport/jobs",
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
  const availableRequests = input.requests.filter(
    (request) => request.transportRequired !== "No"
  );
  const driverCapacities = input.capacities.filter(
    (capacity) => capacity.status === "published" && capacity.driverId === input.driverId
  );
  const points = [
    driver ? profileFeature(driver) : null,
    ...jobs.map((job) => transportFeature(job, job.status === "available" ? "Available job" : "Accepted job")),
    ...availableRequests.map((request) => requestFeature(request, "Available transport lead")),
    ...transportHotspotFeatures(jobs, driverCapacities, undefined, "Driver route hotspot"),
  ].filter(Boolean) as Feature[];
  const routes = routeCollection(
    [
      ...jobs.map((job) => driverJobRouteFeature(job)),
      ...availableRequests.map((request) => driverRequestRouteFeature(request)),
      ...driverCapacities.map((capacity) => driverCapacityRouteFeature(capacity)),
    ]
  );
  const driverBoardItems: DriverBoardItem[] = [
    ...jobs.map((job) => ({
      id: `job-${job.id}`,
      label: job.status === "available" ? `${job.livestockCount} available job` : `${job.livestockCount} negotiation route`,
      detail: `${job.pickupRegion ?? job.pickup} to ${job.destinationRegion ?? job.destination} - ${routeDistanceLabel(driverJobRouteFeature(job))} - ${monthFromText(job.preferredDate)} - ${transportPriceLabel(job)}`,
      status: routeStateForTransportJob(job) === "negotiation" ? "negotiation" : job.status.replace("_", " "),
      href: `/transport/${job.id}`,
      featureId: `route-${job.id}`,
    })),
    ...availableRequests.map((request) => ({
      id: `request-route-${request.id}`,
      label: `${request.headCount} ${request.stockType.toLowerCase()} available route`,
      detail: `${request.originLocation?.region ?? "Pickup region"} to ${request.preferredRegions[0] ?? "preferred paddock region"} - ${routeDistanceLabel(driverRequestRouteFeature(request))} - ${monthFromText("")} - Quote pending`,
      status: "available",
      href: "/transport/jobs",
      featureId: `driver-request-route-${request.id}`,
    })),
    ...driverCapacities.map((capacity) => ({
      id: `capacity-${capacity.id}`,
      label: `${capacity.headCapacity} head backload lane`,
      detail: `${capacity.originRegion} to ${capacity.destinationRegion} - ${routeDistanceLabel(driverCapacityRouteFeature(capacity))} - ${monthFromText(`${capacity.earliestDate} ${capacity.latestDate}`)} - ${transportCapacityPriceLabel(capacity)}`,
      status: "capacity",
      href: "/transport/available",
      featureId: `driver-capacity-route-${capacity.id}`,
    })),
  ];
  return {
    eyebrow: "Driver job map",
    title: `${driver?.name ?? "Driver"} job radar`,
    description:
      "Available work, accepted runs, route corridors, dates, and backload lanes without exposing private agistment terms.",
    points,
    routes,
    bounds: stateViewBounds.NSW,
    driverBoard: {
      title: "Wayne's route board",
      helper: "Start state-by-state. NSW is the default; switch to QLD for northern work, then focus a route.",
      states: [
        { label: "NSW routes", bounds: stateViewBounds.NSW },
        { label: "QLD routes", bounds: stateViewBounds.QLD },
      ],
      items: driverBoardItems,
    },
    metrics: [
      { label: "Available routes", value: String(jobs.filter((job) => job.status === "available").length + availableRequests.length) },
      { label: "Accepted jobs", value: String(jobs.filter((job) => job.status !== "available").length) },
      { label: "Backload lanes", value: String(driverCapacities.length) },
      { label: "Driver privacy", value: "No agistment rate layer" },
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

function transportJobRouteFeature(job: TransportJob): LineFeature | null {
  const route = lineFromCoordinates(
    `transport-job-route-${job.id}`,
    `${job.livestockCount} route`,
    "transport",
    `${job.status.replace("_", " ")}, ${job.preferredDate}`,
    `${job.pickup} to ${job.destination}`,
    `/transport/${job.id}`,
    job.pickupLocation ?? coordinateForRegion(job.pickupRegion) ?? mapCoordinates.dale,
    job.destinationLocation ?? coordinateForRegion(job.destinationRegion) ?? mapCoordinates.gundagai
  );
  if (route) {
    route.properties.routeState = routeStateForTransportJob(job);
    route.properties.priceLabel = transportPriceLabel(job);
    route.properties.metric = routeMetric(
      job.status.replace("_", " "),
      job.preferredDate,
      route,
      route.properties.priceLabel
    );
    route.properties.routeHeadline = `${job.pickupRegion ?? job.pickup} → ${job.destinationRegion ?? job.destination}`;
    route.properties.stockSummary = job.livestockCount;
    route.properties.dateWindow = job.preferredDate;
    route.properties.driverName = job.driver;
  }
  return route;
}

function driverJobRouteFeature(job: TransportJob): LineFeature | null {
  const route = lineFromCoordinates(
    `route-${job.id}`,
    job.routeSummary,
    "transport",
    `${job.livestockCount}, ${job.preferredDate}`,
    `${job.pickup} to ${job.destination}`,
    `/transport/${job.id}`,
    job.pickupLocation ?? coordinateForRegion(job.pickupRegion) ?? mapCoordinates.dale,
    job.destinationLocation ?? coordinateForRegion(job.destinationRegion) ?? mapCoordinates.gundagai
  );
  if (route) {
    route.properties.routeState = routeStateForTransportJob(job);
    route.properties.priceLabel = transportPriceLabel(job);
    route.properties.metric = routeMetric(
      job.livestockCount,
      job.preferredDate,
      route,
      route.properties.priceLabel
    );
    route.properties.routeHeadline = `${job.pickupRegion ?? job.pickup} → ${job.destinationRegion ?? job.destination}`;
    route.properties.stockSummary = job.livestockCount;
    route.properties.dateWindow = job.preferredDate;
    route.properties.driverName = job.driver;
  }
  return route;
}

function routeStateForTransportJob(job: TransportJob): NonNullable<MapFeatureProperties["routeState"]> {
  if (job.status === "available") return "available";
  if (job.agreementContext.agreementStatus === "Negotiating") return "negotiation";
  return "accepted";
}

function driverRequestRouteFeature(request: LivestockRequest): LineFeature | null {
  const destinationRegion =
    request.preferredRegions.find((candidate) => !sameRegion(candidate, request.originLocation?.region ?? "")) ??
    request.preferredRegions[0];
  const route = lineFromCoordinates(
    `driver-request-route-${request.id}`,
    `${request.headCount} ${request.stockType.toLowerCase()} available route`,
    "transport",
    `${request.duration}, transport ${request.transportRequired.toLowerCase()}`,
    `${request.originLocation?.label ?? "Livestock pickup"} to ${destinationRegion ?? "preferred paddock region"}`,
    "/transport/jobs",
    request.originLocation ?? coordinateForRegion(request.preferredRegions[0]) ?? mapCoordinates.dale,
    coordinateForRegion(destinationRegion) ?? mapCoordinates.gundagai
  );
  if (route) {
    route.properties.routeState = "available";
    route.properties.priceLabel = "Quote pending";
    route.properties.metric = routeMetric(request.duration, "", route, route.properties.priceLabel);
    route.properties.privacy = "Available transport lead. Wayne sees pickup, destination region, stock, and timing only.";
  }
  return route;
}

function transportCapacityRouteFeature(capacity: TransportCapacity): LineFeature | null {
  const route = lineFromCoordinates(
    `transport-capacity-route-${capacity.id}`,
    `${capacity.originRegion} to ${capacity.destinationRegion}`,
    "transport",
    `${capacity.headCapacity} head capacity, ${capacity.earliestDate} to ${capacity.latestDate}`,
    `${capacity.stockTypes.join(", ")} availability from ${capacity.driverId === "driver-1" ? "Wayne" : "Sharon"}.`,
    "/transport/available",
    coordinateForRegion(capacity.originRegion),
    coordinateForRegion(capacity.destinationRegion)
  );
  if (route) {
    route.properties.routeState = "capacity";
    route.properties.priceLabel = transportCapacityPriceLabel(capacity);
    route.properties.metric = routeMetric(
      `${capacity.headCapacity} head capacity`,
      `${capacity.earliestDate} ${capacity.latestDate}`,
      route,
      route.properties.priceLabel
    );
    route.properties.routeHeadline = `${capacity.originRegion} → ${capacity.destinationRegion}`;
    route.properties.stockSummary = `${capacity.headCapacity} head, ${capacity.stockTypes.join("/")}`;
    route.properties.dateWindow =
      capacity.earliestDate === capacity.latestDate
        ? capacity.earliestDate
        : `${capacity.earliestDate} – ${capacity.latestDate}`;
    route.properties.driverName = knownDriverNames[capacity.driverId] ?? "Driver";
  }
  return route;
}

function driverCapacityRouteFeature(capacity: TransportCapacity): LineFeature | null {
  const route = lineFromCoordinates(
    `driver-capacity-route-${capacity.id}`,
    `${capacity.originRegion} to ${capacity.destinationRegion}`,
    "transport",
    `${capacity.headCapacity} head backload lane, ${capacity.earliestDate} to ${capacity.latestDate}`,
    `${capacity.stockTypes.join(", ")} capacity on ${capacity.truckLabel ?? "Wayne's truck"}.`,
    "/transport/available",
    coordinateForRegion(capacity.originRegion),
    coordinateForRegion(capacity.destinationRegion)
  );
  if (route) {
    route.properties.routeState = "capacity";
    route.properties.priceLabel = transportCapacityPriceLabel(capacity);
    route.properties.metric = routeMetric(
      `${capacity.headCapacity} head backload lane`,
      `${capacity.earliestDate} ${capacity.latestDate}`,
      route,
      route.properties.priceLabel
    );
    route.properties.routeHeadline = `${capacity.originRegion} → ${capacity.destinationRegion}`;
    route.properties.stockSummary = `${capacity.headCapacity} head backload, ${capacity.stockTypes.join("/")}`;
    route.properties.dateWindow =
      capacity.earliestDate === capacity.latestDate
        ? capacity.earliestDate
        : `${capacity.earliestDate} – ${capacity.latestDate}`;
    route.properties.driverName = knownDriverNames[capacity.driverId] ?? "Driver";
  }
  return route;
}

function transportHotspotFeatures(
  jobs: TransportJob[],
  capacities: TransportCapacity[],
  regionFilter?: string,
  modeHint = "Transport hotspot"
): Feature[] {
  const groups = new Map<
    string,
    {
      coordinate: Coordinate;
      items: MapFeatureItem[];
    }
  >();

  function addItem(region: string | undefined, item: MapFeatureItem) {
    if (!region) return;
    if (regionFilter && !sameRegion(region, regionFilter)) return;
    const coordinate = coordinateForRegion(region);
    if (!coordinate) return;
    const group = groups.get(region) ?? { coordinate, items: [] };
    group.items.push(item);
    groups.set(region, group);
  }

  jobs.forEach((job) => {
    const visibleInRegion =
      !regionFilter ||
      sameRegion(job.pickupRegion ?? "", regionFilter) ||
      sameRegion(job.destinationRegion ?? "", regionFilter);
    if (!visibleInRegion) return;
    addItem(job.pickupRegion ?? job.pickupLocation?.region, {
      label: `${job.livestockCount} movement`,
      detail: `${job.pickup} to ${job.destination} - ${job.preferredDate}, ${job.status.replace("_", " ")}`,
      href: `/transport/${job.id}`,
    });
  });

  capacities.forEach((capacity) => {
    const visibleInRegion =
      !regionFilter ||
      sameRegion(capacity.originRegion, regionFilter) ||
      sameRegion(capacity.destinationRegion, regionFilter);
    if (!visibleInRegion) return;
    addItem(capacity.originRegion, {
      label: `${capacity.originRegion} to ${capacity.destinationRegion}`,
      detail: `${capacity.headCapacity} head capacity - ${capacity.earliestDate} to ${capacity.latestDate}`,
      href: "/transport/available",
    });
  });

  return Array.from(groups.entries()).map(([regionName, group]) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [group.coordinate.longitude, group.coordinate.latitude],
    },
    properties: {
      id: `transport-hotspot-${slugify(regionName)}`,
      kind: "transport",
      title: `${regionName} transport hotspot`,
      subtitle:
        "Zoom in for the actual route corridor, or open one of the jobs listed here.",
      metric: `${group.items.length} route${group.items.length === 1 ? "" : "s"} in this area`,
      href: "/transport/jobs",
      privacy: "Driver map shows logistics only. Private agistment pricing is not included.",
      modeHint,
      display: "hotspot",
      count: group.items.length,
      items: group.items.slice(0, 6),
    },
  }));
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
    `${insight.availability}% paddock availability, ${rainTrendForPressure(insight.pressure)}`,
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
      display: "point",
    },
  };
}

function lineFromCoordinates(
  id: string,
  title: string,
  kind: LayerKey,
  metric: string,
  subtitle: string,
  href: string | undefined,
  from?: Coordinate,
  to?: Coordinate
): LineFeature | null {
  if (!from || !to) return null;
  const coordinates = roadCoordinatesForRoute(from, to);
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates,
    },
    properties: {
      id,
      kind,
      title,
      subtitle,
      metric,
      href,
      privacy: kind === "transport" ? "Transport route detail only. Private agistment pricing is not shown." : undefined,
      routeState: kind === "transport" ? "accepted" : undefined,
    },
  };
}

function roadCoordinatesForRoute(from: Coordinate, to: Coordinate): [number, number][] {
  const waypointLookup: Record<string, Coordinate[]> = {
    "Central West NSW>Southern NSW": [
      roadPoint(148.3, -34.3, "Young"),
      roadPoint(147.37, -35.12, "Wagga Wagga"),
    ],
    "Southern NSW>Central West NSW": [
      roadPoint(147.37, -35.12, "Wagga Wagga"),
      roadPoint(148.3, -34.3, "Young"),
    ],
    "Riverina NSW>Darling Downs QLD": [
      roadPoint(148.61, -32.25, "Dubbo"),
      roadPoint(149.84, -29.47, "Moree"),
      roadPoint(150.31, -28.55, "Goondiwindi"),
    ],
    "Darling Downs QLD>Riverina NSW": [
      roadPoint(150.31, -28.55, "Goondiwindi"),
      roadPoint(149.84, -29.47, "Moree"),
      roadPoint(148.61, -32.25, "Dubbo"),
    ],
    "Northern Tablelands NSW>Hunter NSW": [
      roadPoint(150.93, -31.09, "Tamworth"),
      roadPoint(150.89, -32.57, "Singleton"),
    ],
    "Hunter NSW>Northern Tablelands NSW": [
      roadPoint(150.89, -32.57, "Singleton"),
      roadPoint(150.93, -31.09, "Tamworth"),
    ],
    "Darling Downs QLD>Northern Tablelands NSW": [
      roadPoint(151.21, -27.56, "Toowoomba"),
      roadPoint(151.95, -28.22, "Warwick"),
      roadPoint(151.92, -29.73, "Glen Innes"),
    ],
    "Darling Downs QLD>Maranoa QLD": [
      roadPoint(150.31, -28.55, "Goondiwindi"),
      roadPoint(149.07, -27.18, "Surat"),
    ],
  };
  const key = `${from.region ?? ""}>${to.region ?? ""}`;
  const waypoints = waypointLookup[key] ?? [
    roadPoint((from.longitude + to.longitude) / 2, from.latitude, "Route bend"),
    roadPoint((from.longitude + to.longitude) / 2, to.latitude, "Route bend"),
  ];
  return [from, ...waypoints, to].map((point) => [point.longitude, point.latitude]);
}

function roadPoint(longitude: number, latitude: number, label: string): Coordinate {
  return { longitude, latitude, label };
}

function routeMetric(label: string, dateText: string, route: LineFeature, priceLabel?: string) {
  return [label, routeDistanceLabel(route), monthFromText(dateText), priceLabel]
    .filter(Boolean)
    .join(" - ");
}

function transportPriceLabel(job: TransportJob) {
  const quote =
    job.quotes.find((item) => item.id === job.acceptedQuoteId) ??
    job.quotes.find((item) => item.status === "pending") ??
    job.quotes[0];
  if (!quote) return "Quote pending";
  const amount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: quote.currency,
    maximumFractionDigits: quote.amount % 1 === 0 ? 0 : 2,
  }).format(quote.amount);
  const basis =
    quote.basis === "per_head"
      ? "/head"
      : quote.basis === "per_km"
        ? "/km"
        : " flat";
  return `${amount}${basis}`;
}

function transportCapacityPriceLabel(capacity: TransportCapacity) {
  if (capacity.rateAmount === null || capacity.rateBasis === null) return "Rate on enquiry";
  const amount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: capacity.rateAmount % 1 === 0 ? 0 : 2,
  }).format(capacity.rateAmount);
  const basis =
    capacity.rateBasis === "per_head"
      ? "/head"
      : capacity.rateBasis === "per_km"
        ? "/km"
        : " flat";
  return `${amount}${basis}`;
}

function routeDistanceLabel(route: LineFeature | null) {
  if (!route) return "distance pending";
  return `${routeDistanceKm(route.geometry.coordinates)} km`;
}

function routeDistanceKm(coordinates: [number, number][]) {
  const total = coordinates.slice(1).reduce((sum, coordinate, index) => {
    return sum + haversineKm(coordinates[index], coordinate);
  }, 0);
  return Math.max(1, Math.round(total * 1.08));
}

function haversineKm([fromLng, fromLat]: [number, number], [toLng, toLat]: [number, number]) {
  const radiusKm = 6371;
  const dLat = degreesToRadians(toLat - fromLat);
  const dLng = degreesToRadians(toLng - fromLng);
  const lat1 = degreesToRadians(fromLat);
  const lat2 = degreesToRadians(toLat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function monthFromText(value: string) {
  const match = value.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  if (!match) return "May";
  const [month] = match;
  return month.slice(0, 3).replace(/^./, (letter) => letter.toUpperCase());
}

function routeCollection(lines: (LineFeature | null)[]): FeatureCollection<LineFeature> {
  return { type: "FeatureCollection", features: lines.filter(Boolean) as LineFeature[] };
}

function routeEndpointCollection(routes: LineFeature[]): FeatureCollection<Feature> {
  return {
    type: "FeatureCollection",
    features: routes.flatMap((route) => {
      const first = route.geometry.coordinates[0];
      const last = route.geometry.coordinates[route.geometry.coordinates.length - 1];
      if (!first || !last) return [];
      return [
        routeEndpointFeature(route, first, "Origin"),
        routeEndpointFeature(route, last, "Destination"),
      ];
    }),
  };
}

function routeEndpointFeature(
  route: LineFeature,
  coordinates: [number, number],
  endpoint: "Origin" | "Destination"
): Feature {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      ...route.properties,
      id: `${route.properties.id}-${endpoint.toLowerCase()}`,
      title: `${endpoint}: ${route.properties.title}`,
      display: "route-endpoint",
    },
  };
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

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
