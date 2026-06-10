"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMapsKey";

/**
 * Lean Google Map for REAL data only (no demo/prototype coupling):
 * pins for paddocks, geodesic lines for transport/agreement routes.
 * Click a pin or route to get a small info window with a link.
 */
export type LiveMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  href?: string;
};

export type LiveMapRoute = {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  /** "available" routes render amber (waiting for a carrier); "active" sage. */
  tone?: "available" | "active";
};

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const TONE_COLOURS = {
  available: "#b97f24",
  active: "#2d5a3d",
} as const;

export function LiveMap({
  markers = [],
  routes = [],
  focusRouteId,
  heightClassName = "h-[26rem] sm:h-[30rem]",
}: {
  markers?: LiveMapMarker[];
  routes?: LiveMapRoute[];
  focusRouteId?: string;
  heightClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (markers.length === 0 && routes.length === 0) return;
    let cancelled = false;
    const overlays: { setMap: (map: google.maps.Map | null) => void }[] = [];
    let map: google.maps.Map | null = null;

    setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });
    const guard = window.setTimeout(() => setFailed(true), 8000);

    void importLibrary("maps")
      .then(() => {
        window.clearTimeout(guard);
        if (cancelled || !containerRef.current) return;

        map = new google.maps.Map(containerRef.current, {
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: MAP_STYLE,
          center: { lat: -33.5, lng: 148.5 },
          zoom: 6,
        });
        const bounds = new google.maps.LatLngBounds();
        const info = new google.maps.InfoWindow();

        const openInfo = (
          anchor: google.maps.LatLng,
          title: string,
          subtitle?: string,
          href?: string
        ) => {
          const link = href
            ? `<a href="${href}" style="color:#2d5a3d;font-weight:700;text-decoration:underline">Open</a>`
            : "";
          info.setContent(
            `<div style="font-family:inherit;max-width:220px">` +
              `<p style="margin:0;font-weight:700;color:#2d5a3d">${escapeHtml(title)}</p>` +
              (subtitle
                ? `<p style="margin:4px 0;color:#3f3328">${escapeHtml(subtitle)}</p>`
                : "") +
              link +
              `</div>`
          );
          info.setPosition(anchor);
          info.open({ map: map ?? undefined });
        };

        for (const marker of markers) {
          const position = { lat: marker.latitude, lng: marker.longitude };
          const pin = new google.maps.Marker({
            map,
            position,
            title: marker.title,
          });
          pin.addListener("click", () =>
            openInfo(
              new google.maps.LatLng(position),
              marker.title,
              marker.subtitle,
              marker.href
            )
          );
          overlays.push(pin);
          bounds.extend(position);
        }

        for (const route of routes) {
          const colour = TONE_COLOURS[route.tone ?? "active"];
          const from = { lat: route.from.latitude, lng: route.from.longitude };
          const to = { lat: route.to.latitude, lng: route.to.longitude };
          const isFocused = focusRouteId === route.id;
          const line = new google.maps.Polyline({
            map,
            path: [from, to],
            geodesic: true,
            strokeColor: colour,
            strokeOpacity: isFocused ? 1 : 0.75,
            strokeWeight: isFocused ? 5 : 3,
          });
          const endpoint = new google.maps.Marker({
            map,
            position: to,
            title: route.title,
            label: { text: "▸", color: "#ffffff" },
          });
          const clickHandler = () =>
            openInfo(
              new google.maps.LatLng(to),
              route.title,
              route.subtitle,
              route.href
            );
          line.addListener("click", clickHandler);
          endpoint.addListener("click", clickHandler);
          overlays.push(line, endpoint);
          bounds.extend(from);
          bounds.extend(to);
          if (isFocused) {
            window.setTimeout(clickHandler, 400);
          }
        }

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 48);
          // Don't zoom in absurdly for a single point.
          const listener = google.maps.event.addListenerOnce(
            map,
            "idle",
            () => {
              if (map && (map.getZoom() ?? 0) > 11) map.setZoom(11);
            }
          );
          overlays.push({
            setMap: () => google.maps.event.removeListener(listener),
          });
        }
      })
      .catch(() => {
        window.clearTimeout(guard);
        setFailed(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(guard);
      for (const overlay of overlays) overlay.setMap(null);
    };
    // Serialise inputs so the effect re-runs only on real data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), JSON.stringify(routes), focusRouteId]);

  if (markers.length === 0 && routes.length === 0) {
    return null;
  }

  if (failed) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-mist bg-cream/55 text-sm text-bark/70">
        The map couldn&rsquo;t load. Your pins and routes are still listed below.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden rounded-2xl border border-sage-deep/15 ${heightClassName}`}
      aria-label="Live map"
    />
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
