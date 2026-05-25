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
    new google.maps.Polyline({
      path: [
        {
          lat: job.pickupLocation.latitude,
          lng: job.pickupLocation.longitude,
        },
        {
          lat: job.destinationLocation.latitude,
          lng: job.destinationLocation.longitude,
        },
      ],
      map,
      strokeColor: isHighlight ? TERRA : SAGE,
      strokeOpacity: isHighlight ? 0.95 : 0.7,
      strokeWeight: isHighlight ? 5 : 3,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            strokeColor: isHighlight ? TERRA : SAGE,
          },
          offset: "50%",
        },
      ],
    });
  }
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
