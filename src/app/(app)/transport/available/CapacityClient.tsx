"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Calendar,
  Filter,
  MapPin,
  Truck,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import {
  CapacityPostDialog,
  type CapacityDraft,
} from "@/components/CapacityPostDialog";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { SelectablePill } from "@/components/SelectablePill";
import { StatusBadge } from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { TablesInsert } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import type { Farmer, TransportCapacity } from "@/lib/dummyData";

const MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  "AIzaSyAG3EVoUUNfk0amP7J40Dy1NpmGG3_1L18";

function buildRouteMapUrl(origin: string, destination: string): string {
  const enc = encodeURIComponent;
  const parts = [
    "size=600x300",
    "scale=2",
    "maptype=roadmap",
    `markers=color:0x4a7c5e|label:A|${enc(origin + ", Australia")}`,
    `markers=color:0x2d5a3d|label:B|${enc(destination + ", Australia")}`,
    "style=feature:poi|visibility:off",
    "style=feature:transit|visibility:off",
    "style=feature:landscape|element:geometry|color:0xf5f0e8",
    "style=feature:road|element:geometry|color:0xddd8cc",
    "style=feature:water|element:geometry|color:0xc9dce3",
    `key=${enc(MAPS_KEY)}`,
  ];
  return `https://maps.googleapis.com/maps/api/staticmap?${parts.join("&")}`;
}

function RouteFallbackSvg({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const clip = (s: string) => (s.length > 20 ? s.slice(0, 18) + "…" : s);
  return (
    <svg
      viewBox="0 0 400 180"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Route: ${origin} to ${destination}`}
      className="w-full rounded-[6px] border border-sage-mist/60"
    >
      <rect width="400" height="180" fill="#e8f0eb" />
      <line
        x1="95"
        y1="86"
        x2="305"
        y2="86"
        stroke="#4a7c5e"
        strokeWidth="2"
        strokeDasharray="8 5"
      />
      <circle cx="74" cy="86" r="20" fill="#4a7c5e" />
      <text
        x="74"
        y="91"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="bold"
      >
        A
      </text>
      <circle cx="326" cy="86" r="20" fill="#2d5a3d" />
      <text
        x="326"
        y="91"
        textAnchor="middle"
        fill="white"
        fontFamily="sans-serif"
        fontSize="12"
        fontWeight="bold"
      >
        B
      </text>
      <text
        x="74"
        y="122"
        textAnchor="middle"
        fill="#4a7c5e"
        fontFamily="sans-serif"
        fontSize="9"
        fontWeight="600"
      >
        {clip(origin)}
      </text>
      <text
        x="326"
        y="122"
        textAnchor="middle"
        fill="#2d5a3d"
        fontFamily="sans-serif"
        fontSize="9"
        fontWeight="600"
      >
        {clip(destination)}
      </text>
    </svg>
  );
}

function RouteMapPreview({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) {
    return <RouteFallbackSvg origin={origin} destination={destination} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={buildRouteMapUrl(origin, destination)}
      alt={`Route map: ${origin} to ${destination}`}
      className="w-full rounded-[6px] border border-sage-mist/60 object-cover"
      style={{ aspectRatio: "2/1", pointerEvents: "none" }}
      loading="lazy"
      draggable={false}
      onError={() => setImgFailed(true)}
    />
  );
}

type FilterGroupKey = "origins" | "destinations" | "stockTypes";

type FilterState = {
  origins: string[];
  destinations: string[];
  stockTypes: string[];
};

const emptyFilters: FilterState = {
  origins: [],
  destinations: [],
  stockTypes: [],
};

const filterGroups: {
  key: FilterGroupKey;
  label: string;
  getOptions: (capacities: TransportCapacity[]) => string[];
}[] = [
  {
    key: "origins",
    label: "Origin",
    getOptions: (capacities) =>
      uniqueSorted(capacities.map((capacity) => capacity.originRegion)),
  },
  {
    key: "destinations",
    label: "Destination",
    getOptions: (capacities) =>
      uniqueSorted(capacities.map((capacity) => capacity.destinationRegion)),
  },
  {
    key: "stockTypes",
    label: "Stock types",
    getOptions: (capacities) =>
      uniqueSorted(capacities.flatMap((capacity) => capacity.stockTypes)),
  },
];

export function CapacityClient({
  capacities: seedCapacities,
  drivers,
  driverActiveRoom,
}: {
  capacities: TransportCapacity[];
  drivers: Record<string, Farmer | undefined>;
  /** Map of driverId -> existing transport job id (if any) for routing on "Request this run". */
  driverActiveRoom: Record<string, string | undefined>;
}) {
  const flash = useFlash();
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [userPosted, setUserPosted] = useState<TransportCapacity[]>([]);
  const [postOpen, setPostOpen] = useState(false);
  const hydratedRef = useRef(false);
  const storageKey = "paddockme.transport_capacity.posted";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as TransportCapacity[];
        if (Array.isArray(parsed)) setUserPosted(parsed);
      }
    } catch {
      // ignore - private mode / corrupt JSON
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(userPosted));
    } catch {
      // ignore
    }
  }, [userPosted]);

  // User-posted rows render first so freshly published runs appear at the top.
  // Drop any row whose date window has already closed so the board doesn't
  // surface stale capacity to farmers.
  const capacities = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return [...userPosted, ...seedCapacities].filter(
      (capacity) => !capacity.latestDateIso || capacity.latestDateIso >= todayIso
    );
  }, [userPosted, seedCapacities]);

  const filtered = useMemo(
    () =>
      capacities.filter((capacity) => matchesFilters(capacity, filters)),
    [capacities, filters]
  );

  function postCapacity(draft: CapacityDraft) {
    const newCapacity: TransportCapacity = {
      id: `local-cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      // Default to the seeded transport provider for the unauthed prototype path. Replaced with the
      // real auth.uid() in persistCapacityToSupabase when a session exists.
      driverId: "driver-1",
      truckLabel: draft.truckLabel,
      originRegion: draft.originRegion,
      destinationRegion: draft.destinationRegion,
      earliestDate: draft.earliestDate,
      latestDate: draft.latestDate,
      earliestDateIso: draft.earliestDateIso,
      latestDateIso: draft.latestDateIso,
      headCapacity: draft.headCapacity,
      stockTypes: draft.stockTypes,
      rateBasis: draft.rateBasis,
      rateAmount: draft.rateAmount,
      notes: draft.notes,
      status: "published",
      postedAt: nowLabel(),
    };
    setUserPosted((current) => [newCapacity, ...current]);
    setPostOpen(false);
    flash(
      `Posted: ${draft.originRegion} -> ${draft.destinationRegion}.`,
      "success"
    );
    // Fire-and-forget dual-write. The localStorage entry above is the
    // source of truth for the prototype UI either way.
    void persistCapacityToSupabase(draft);
  }

  async function persistCapacityToSupabase(draft: CapacityDraft) {
    if (!isSupabaseConfigured()) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      // Ensure the profile row exists - handle_new_user trigger normally
      // takes care of this on signup, but the upsert covers projects that
      // haven't applied that migration yet.
      const metaName =
        (user.user_metadata as { full_name?: string } | null)?.full_name ??
        null;
      await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: metaName }, { onConflict: "id" });
      // Date columns are Postgres `date`, so send the ISO YYYY-MM-DD values
      // from the date picker. The draft also carries human display strings
      // (earliestDate/latestDate) but those are UI-only and Postgres rejects
      // them.
      const insertPayload: TablesInsert<"transport_capacity"> = {
        driver_id: user.id,
        truck_label: draft.truckLabel,
        origin_region: draft.originRegion,
        destination_region: draft.destinationRegion,
        earliest_date: draft.earliestDateIso,
        latest_date: draft.latestDateIso,
        head_capacity: draft.headCapacity,
        stock_types: draft.stockTypes,
        rate_basis: draft.rateBasis,
        rate_amount: draft.rateAmount,
        notes: draft.notes,
        status: "published",
      };
      const { error } = await supabase
        .from("transport_capacity")
        .insert(insertPayload);
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("transport_capacity insert failed", error.message);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("transport_capacity insert threw", error);
    }
  }

  const activeFilterCount =
    filters.origins.length +
    filters.destinations.length +
    filters.stockTypes.length;

  function toggle(group: FilterGroupKey, value: string) {
    setFilters((current) => {
      const set = new Set(current[group]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, [group]: Array.from(set) };
    });
  }

  function clearAll() {
    setFilters(emptyFilters);
    flash("Filters cleared.", "info");
  }

  function requestRun(capacity: TransportCapacity) {
    const driverName = drivers[capacity.driverId]?.name ?? "the driver";
    const existingRoom = driverActiveRoom[capacity.driverId];
    if (existingRoom) {
      flash(`Quote request sent to ${driverName}. Opening the room...`, "success");
      // Small delay so the toast is visible before the navigation.
      setTimeout(() => router.push(`/transport/${existingRoom}`), 600);
    } else {
      flash(
        `Quote request sent to ${driverName}. They'll be in touch when a room opens.`,
        "success"
      );
    }
  }

  return (
    <>
      <PersonaIntroBanner page="capacity" />
      <section
        aria-label="Driver tools"
        className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage-deep/15 bg-sage-mist/35 px-4 py-3"
      >
        <div className="flex items-center gap-2 text-sage-deep">
          <Truck className="h-5 w-5" aria-hidden />
          <p className="text-sm font-semibold">
            Driver? Open the RFT map to see routes farmers are waiting on.
          </p>
        </div>
        <ButtonLink href="/transport/jobs" className="min-h-10">
          Open RFT map
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </section>

      <section
        aria-label="Filter capacity"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Filter className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Filter trucks
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-bark/70">
              {filtered.length} of {capacities.length} runs
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-mist bg-warm-white px-3 py-1 text-xs font-bold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {filterGroups.map((group) => {
            const options = group.getOptions(capacities);
            if (options.length === 0) return null;
            return (
              <div key={group.key}>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-stone">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <SelectablePill
                      key={option}
                      selected={filters[group.key].includes(option)}
                      onClick={() => toggle(group.key, option)}
                    >
                      {option}
                    </SelectablePill>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((capacity) => (
            <CapacityCard
              key={capacity.id}
              capacity={capacity}
              driver={drivers[capacity.driverId]}
              onRequest={() => requestRun(capacity)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onClear={clearAll} hasFilters={activeFilterCount > 0} />
      )}

      <CapacityPostDialog
        open={postOpen}
        driverLabel="Driver"
        onClose={() => setPostOpen(false)}
        onSubmit={postCapacity}
      />
    </>
  );
}

function CapacityCard({
  capacity,
  driver,
  onRequest,
}: {
  capacity: TransportCapacity;
  driver?: Farmer;
  onRequest: () => void;
}) {
  const rateLabel = capacity.rateAmount
    ? `$${capacity.rateAmount.toFixed(2)} ${
        capacity.rateBasis === "per_head"
          ? "per head"
          : capacity.rateBasis === "per_km"
            ? "per km"
            : "flat"
      }`
    : "Rate on enquiry";
  const fleetSize = driver?.transport?.fleetSize ?? 1;
  const isMultiTruck = fleetSize > 1;

  return (
    <Card className="flex h-full flex-col gap-5">
      <RouteMapPreview
        origin={capacity.originRegion}
        destination={capacity.destinationRegion}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge tone="info">
              <Truck className="h-3.5 w-3.5" aria-hidden />
              {isMultiTruck ? `${fleetSize}-truck fleet` : "Owner-operator"}
            </StatusBadge>
            {capacity.truckLabel && (
              <span className="rounded-full bg-warm-white px-3 py-1 text-xs font-semibold text-stone">
                {capacity.truckLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-sage-deep">
            {driver?.name ?? "Driver"}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-bark/65">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {capacity.originRegion} &rarr; {capacity.destinationRegion}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoTile
          tone="subtle"
          size="sm"
          iconPlacement="inline"
          icon={<Calendar className="h-4 w-4" />}
          label="Window"
          value={`${capacity.earliestDate} - ${capacity.latestDate}`}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          iconPlacement="inline"
          icon={<Truck className="h-4 w-4" />}
          label="Capacity"
          value={`${capacity.headCapacity} head`}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          label="Stock fit"
          value={capacity.stockTypes.join(", ")}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          iconPlacement="inline"
          icon={<Banknote className="h-4 w-4" />}
          label="Indicative rate"
          value={rateLabel}
        />
      </div>

      {capacity.notes && (
        <p className="text-sm leading-relaxed text-bark/75">{capacity.notes}</p>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-stone">
        Posted {capacity.postedAt}
      </p>

      <button
        type="button"
        onClick={onRequest}
        className="mt-auto inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-sage-deep px-5 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Request this capacity
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </Card>
  );
}

function EmptyState({
  onClear,
  hasFilters,
}: {
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-sage-deep/20 bg-cream/55 px-6 py-10 text-center"
      )}
    >
      <h2 className="text-lg font-bold text-sage-deep">
        No runs match these filters.
      </h2>
      <p className="mt-2 text-sm text-bark/70">
        Carrier capacity is a secondary reference. The main transport flow now
        starts on the farmer-created RFT map.
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear all filters
        </button>
      )}
    </div>
  );
}

function matchesFilters(
  capacity: TransportCapacity,
  filters: FilterState
): boolean {
  if (
    filters.origins.length > 0 &&
    !filters.origins.includes(capacity.originRegion)
  ) {
    return false;
  }
  if (
    filters.destinations.length > 0 &&
    !filters.destinations.includes(capacity.destinationRegion)
  ) {
    return false;
  }
  if (
    filters.stockTypes.length > 0 &&
    !filters.stockTypes.some((type) => capacity.stockTypes.includes(type))
  ) {
    return false;
  }
  return true;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function nowLabel(): string {
  return new Date().toLocaleString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
