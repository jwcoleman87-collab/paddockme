"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  paddockListings,
  transportJobs,
  farmers,
  type TransportJob,
} from "@/lib/dummyData";

export type GoogleOperationalMapProps = {
  /** Google Maps JS API key. Sourced from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   * by the parent if not passed explicitly. */
  apiKey: string;
  /** Highlighted transport job. Pickup/destination markers + route line
   * are emphasised when this matches a job. */
  highlightTransportId?: string;
  /** Highlighted driver. The driver's pin is enlarged. */
  highlightDriverId?: string;
};

const AUSTRALIA_CENTER = { lat: -27.0, lng: 134.0 };
const AUSTRALIA_ZOOM = 4;

const SAGE_DEEP = "#22542b";
const SAGE = "#4a7c4a";
const TERRA = "#a85432";
const AMBER = "#c98a1d";
const CREAM = "#f5f1e6";

/**
 * Google Maps rendering of the PaddockME operational data: paddocks as
 * sage pins, transport routes as polylines, driver origins as truck pins.
 *
 * Mirrors the maplibre PaddockMap's regional view at a smaller scope -
 * enough for the investor demo without re-implementing the full layer
 * toggles, persona modes, and corridor styling. Falls back to the existing
 * maplibre PaddockMap (via the parent) when no API key is configured.
 */
export function GoogleOperationalMap({
  apiKey,
  highlightTransportId,
  highlightDriverId,
}: GoogleOperationalMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!apiKey) {
      setError("Google Maps API key missing.");
      return;
    }

    let disposed = false;
    setOptions({ key: apiKey, v: "weekly" });

    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(([mapsLib]) => {
        if (disposed || !containerRef.current) return;
        const map = new mapsLib.Map(containerRef.current, {
          center: AUSTRALIA_CENTER,
          zoom: AUSTRALIA_ZOOM,
          mapTypeId: "roadmap",
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "greedy",
          styles: subtleAgriStyle(),
        });
        renderPaddockMarkers(map);
        renderDriverMarkers(map, highlightDriverId);
        renderTransportRoutes(map, highlightTransportId);
        setReady(true);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Google Maps failed to load."
        );
      });

    return () => {
      disposed = true;
    };
  }, [apiKey, highlightDriverId, highlightTransportId]);

  return (
    <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-sage-deep/15 bg-sage-mist/30">
      <div ref={containerRef} className="absolute inset-0" />
      {ready && !error && <MapLegend />}
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-bark/70">
          Loading Google Maps...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm font-medium text-bark/80">
          <p className="font-bold text-sage-deep">Google Maps unavailable.</p>
          <p className="max-w-md text-xs text-bark/65">{error}</p>
        </div>
      )}
    </div>
  );
}

function MapLegend() {
  const rows: { color: string; label: string }[] = [
    { color: SAGE_DEEP, label: "Paddocks listed" },
    { color: AMBER, label: "Open job - needs a driver" },
    { color: TERRA, label: "In transit / loading" },
    { color: SAGE, label: "Accepted run" },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-sage-deep/15 bg-warm-white/95 p-3 text-xs shadow-[0_8px_22px_rgba(34,84,52,0.12)] backdrop-blur">
      <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-bark/65">
        Map legend
      </p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: row.color }}
            />
            <span className="font-medium text-bark">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderPaddockMarkers(map: google.maps.Map) {
  for (const paddock of paddockListings) {
    const coord = paddock.coordinates;
    if (!coord) continue;
    const marker = new google.maps.Marker({
      position: { lat: coord.latitude, lng: coord.longitude },
      map,
      title: paddock.title,
      icon: pinSymbol(SAGE_DEEP),
    });
    const info = new google.maps.InfoWindow({
      content: paddockInfoHtml(paddock),
      ariaLabel: paddock.title,
    });
    marker.addListener("click", () => info.open({ map, anchor: marker }));
  }
}

function renderDriverMarkers(map: google.maps.Map, highlightDriverId?: string) {
  const drivers = farmers.filter((f) => f.role === "Transport Provider");
  for (const driver of drivers) {
    if (!driver.location) continue;
    const isHighlight = driver.id === highlightDriverId;
    const marker = new google.maps.Marker({
      position: {
        lat: driver.location.latitude,
        lng: driver.location.longitude,
      },
      map,
      title: driver.name,
      icon: pinSymbol(isHighlight ? TERRA : AMBER, isHighlight ? 1.4 : 1),
      zIndex: isHighlight ? 99 : 5,
    });
    const info = new google.maps.InfoWindow({
      content: driverInfoHtml(driver),
      ariaLabel: driver.name,
    });
    marker.addListener("click", () => info.open({ map, anchor: marker }));
  }
}

function renderTransportRoutes(
  map: google.maps.Map,
  highlightTransportId?: string
) {
  for (const job of transportJobs) {
    if (!job.pickupLocation || !job.destinationLocation) continue;
    const isHighlight = job.id === highlightTransportId;
    const color = routeColorFor(job, isHighlight);
    const path = [
      {
        lat: job.pickupLocation.latitude,
        lng: job.pickupLocation.longitude,
      },
      {
        lat: job.destinationLocation.latitude,
        lng: job.destinationLocation.longitude,
      },
    ];
    new google.maps.Polyline({
      path,
      map,
      strokeColor: color,
      strokeOpacity: isHighlight ? 0.95 : 0.75,
      strokeWeight: isHighlight ? 5 : 3,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: color,
          },
          offset: "50%",
        },
      ],
      // Make the polyline clickable so users can poke routes directly.
      clickable: true,
    });
    // Midpoint marker = a clear tap-target with an info window that
    // surfaces livestock, distance, rate, and estimated total pay.
    const midpoint = {
      lat: (path[0].lat + path[1].lat) / 2,
      lng: (path[0].lng + path[1].lng) / 2,
    };
    const marker = new google.maps.Marker({
      position: midpoint,
      map,
      title: job.routeSummary,
      icon: jobMidpointSymbol(color, isHighlight ? 1.25 : 1),
      zIndex: isHighlight ? 50 : 10,
    });
    const info = new google.maps.InfoWindow({
      content: transportJobInfoHtml(job),
      ariaLabel: job.routeSummary,
    });
    marker.addListener("click", () => info.open({ map, anchor: marker }));
  }
}

function routeColorFor(
  job: (typeof transportJobs)[number],
  isHighlight: boolean
): string {
  if (isHighlight) return TERRA;
  switch (job.status) {
    case "available":
      return AMBER;
    case "in_transit":
    case "loading":
      return TERRA;
    case "arrived":
    case "completed":
      return SAGE_DEEP;
    case "cancelled":
      return "#9a948a";
    default:
      return SAGE;
  }
}

function transportJobInfoHtml(job: (typeof transportJobs)[number]): string {
  const livestock = escape(job.livestockCount);
  const route = escape(job.routeSummary);
  const date = escape(job.preferredDate);
  const status = escape(job.status.replace(/_/g, " "));
  const headCount = parseLeadingNumber(job.livestockCount);
  const payLine = payEstimateLine(job, headCount);
  const distance = job.distanceKm ? `${job.distanceKm} km · ` : "";
  const driverLine =
    job.status === "available"
      ? '<div style="font-size: 11px; color: #c98a1d; font-weight: 700; margin-top: 4px;">Looking for a driver</div>'
      : `<div style="font-size: 11px; color: #6b6256; margin-top: 4px;">Driver: ${escape(
          job.driver
        )}</div>`;
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 240px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b6256;">${status}</div>
      <div style="font-weight: 700; color: #22542b; font-size: 14px; margin-top: 2px;">${route}</div>
      <div style="font-size: 12px; color: #2c2c2c; margin-top: 4px;">${livestock}</div>
      <div style="font-size: 11px; color: #6b6256; margin-top: 2px;">${distance}Pickup ${date}</div>
      ${payLine}
      ${driverLine}
    </div>
  `;
}

function payEstimateLine(
  job: (typeof transportJobs)[number],
  headCount: number | null
): string {
  const guide = job.rateGuide;
  if (!guide) {
    return '<div style="font-size: 12px; color: #6b6256; margin-top: 6px;">Rate on enquiry.</div>';
  }
  const amount = guide.amount;
  let total: number | null = null;
  let breakdown = "";
  if (guide.basis === "per_head" && headCount) {
    total = amount * headCount;
    breakdown = `${headCount} head × $${amount.toFixed(2)}/head`;
  } else if (guide.basis === "per_km" && job.distanceKm) {
    total = amount * job.distanceKm;
    breakdown = `${job.distanceKm} km × $${amount.toFixed(2)}/km`;
  } else if (guide.basis === "flat") {
    total = amount;
    breakdown = "Flat rate";
  }
  if (total === null) {
    return `<div style="font-size: 12px; color: #6b6256; margin-top: 6px;">$${amount.toFixed(
      2
    )} ${guide.currency} ${escape(guide.basis.replace("_", " "))}</div>`;
  }
  const formatted = `$${Math.round(total).toLocaleString()}`;
  return `
    <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e7e3d4;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b6256;">Estimated pay</div>
      <div style="font-size: 16px; font-weight: 800; color: #22542b;">${formatted} ${guide.currency}</div>
      <div style="font-size: 11px; color: #6b6256;">${breakdown}</div>
    </div>
  `;
}

function parseLeadingNumber(value: string): number | null {
  const match = value.match(/^\s*(\d[\d,]*)/);
  if (!match) return null;
  return Number.parseInt(match[1].replace(/,/g, ""), 10);
}

function jobMidpointSymbol(color: string, scale = 1): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.95,
    strokeColor: CREAM,
    strokeWeight: 2,
    scale: 7 * scale,
  };
}

function pinSymbol(color: string, scale = 1): google.maps.Symbol {
  return {
    path: "M 0,-12 C -7,-12 -10,-7 -10,-2 C -10,5 0,12 0,12 C 0,12 10,5 10,-2 C 10,-7 7,-12 0,-12 z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: CREAM,
    strokeWeight: 2,
    scale,
    anchor: new google.maps.Point(0, 12),
  };
}

function paddockInfoHtml(paddock: (typeof paddockListings)[number]): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 220px;">
      <div style="font-weight: 700; color: #22542b; font-size: 14px;">${escape(paddock.title)}</div>
      <div style="font-size: 12px; color: #6b6256; margin-top: 2px;">${escape(paddock.location)}</div>
      <div style="font-size: 11px; color: #6b6256; margin-top: 6px;">${paddock.acres} acres &middot; ${escape(paddock.suitableLivestock.join(", "))}</div>
    </div>
  `;
}

function driverInfoHtml(driver: (typeof farmers)[number]): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 200px;">
      <div style="font-weight: 700; color: #22542b; font-size: 14px;">${escape(driver.name)}</div>
      <div style="font-size: 12px; color: #6b6256; margin-top: 2px;">Driver &middot; ${escape(driver.region)}</div>
    </div>
  `;
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Soft, low-contrast roadmap palette so paddockme pins stand out. */
function subtleAgriStyle(): google.maps.MapTypeStyle[] {
  return [
    { elementType: "geometry", stylers: [{ color: "#f5f1e6" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#6b6256" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    {
      featureType: "administrative.land_parcel",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.province",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4a7c4a" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#e7e3d4" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#e8e0c8" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#cfdde1" }],
    },
  ];
}

// Reference unused TransportJob type symbol so the editor surfaces it
// (also helps tooling track the import).
export type _TransportJobRef = TransportJob;
