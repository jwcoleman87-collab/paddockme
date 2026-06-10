"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  List,
  Map,
  MapPin,
  PackageCheck,
  Route,
  Truck,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { useFlash } from "@/components/FlashProvider";
import {
  formatTransportStatus,
} from "@/lib/prototypeStore";
import {
  listTransportJobs,
  selectPersona,
  updateTransportJobStatus,
} from "@/lib/data/repositories";
import { farmers, type Farmer, type TransportJob, type TransportJobStatus } from "@/lib/dummyData";
import { feedRuns, type FeedRun } from "@/lib/feedRuns";
import { GOOGLE_MAPS_API_KEY } from "@/lib/googleMapsKey";
import { coordinateForRegion, mapCoordinates, type Coordinate } from "@/lib/mapCoordinates";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "portal" | "jobs" | "calendar";
type JobsView = "map" | "list" | "calendar";
type WorkFilter = "all" | "livestock" | "feed";

type JobsMapRoute = {
  id: string;
  workType: "livestock" | "feed";
  status: "new" | "accepted" | "in_transit" | "completed";
  pickupTown: string;
  destinationTown: string;
  owner: string;
  livestock: string;
  headCount: string;
  loadLabel: string;
  summary: string;
  distanceKm: number;
  driveTime: string;
  fee: number;
  month: string;
  href: string;
  path: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  label: { x: number; y: number };
  origin: RouteCoordinate;
  destination: RouteCoordinate;
};

type RouteCoordinate = {
  lat: number;
  lng: number;
  label: string;
};

const GOOGLE_MAPS_KEY = GOOGLE_MAPS_API_KEY;

const PADDOCKME_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f0ede7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#e5dfd4" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6d6257" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9dce3" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#3f3328" }] },
];

export function TransportJobsClient({
  mode,
  initialWorkFilter = "all",
}: {
  mode: Mode;
  initialWorkFilter?: WorkFilter;
}) {
  const router = useRouter();
  const flash = useFlash();
  const [jobs, setJobs] = useState<TransportJob[]>([]);
  const [view, setView] = useState<JobsView>("map");
  const [workFilter, setWorkFilter] = useState<WorkFilter>(initialWorkFilter);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = useState<string>("farmer-a");

  useEffect(() => {
    void listTransportJobs().then(setJobs);
  }, []);

  useEffect(() => {
    setWorkFilter(initialWorkFilter);
  }, [initialWorkFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function readActiveProfile() {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          readPersonaCookie() ??
          "farmer-a"
        );
      } catch {
        return readPersonaCookie() ?? "farmer-a";
      }
    }
    setActiveProfileId(readActiveProfile());
    function onProfileChange() {
      setActiveProfileId(readActiveProfile());
    }
    window.addEventListener("paddockme:persona-change", onProfileChange);
    window.addEventListener("storage", onProfileChange);
    return () => {
      window.removeEventListener("paddockme:persona-change", onProfileChange);
      window.removeEventListener("storage", onProfileChange);
    };
  }, []);

  const available = useMemo(
    () => jobs.filter((job) => job.status === "available"),
    [jobs]
  );
  const accepted = useMemo(
    () => jobs.filter((job) => job.status !== "available" && job.status !== "cancelled"),
    [jobs]
  );
  const activeProfile = useMemo(
    () => farmers.find((farmer) => farmer.id === activeProfileId) ?? farmers[0],
    [activeProfileId]
  );
  const farmerTransportJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.farmerAId === activeProfileId || job.farmerBId === activeProfileId
      ),
    [activeProfileId, jobs]
  );

  async function acceptJob(job: TransportJob) {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/sign-in?next=${encodeURIComponent("/transport/jobs")}`);
        return;
      }
    }
    selectPersona("driver-1");
    const { state } = await updateTransportJobStatus(job.id, "accepted");
    setJobs(state.transportJobs);
    flash("RFT accepted. It has been added to your calendar.", "success");
    router.push(`/transport/${job.id}`);
  }

  if (mode === "portal") {
    if (activeProfile?.role !== "Transport Provider") {
      return (
        <FarmerTransportPortal
          activeProfile={activeProfile}
          jobs={farmerTransportJobs}
        />
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <PortalCard
          icon={<Truck />}
          title="Open RFTs"
          value={`${available.length}`}
          href="/transport/jobs"
          cta="Open RFT map"
        />
        <PortalCard
          icon={<PackageCheck />}
          title="Feed runs"
          value={`${feedRuns.length}`}
          href="/transport/jobs?work=feed"
          cta="See hay & silage"
        />
        <PortalCard
          icon={<CalendarDays />}
          title="Calendar"
          value={`${accepted.length}`}
          href="/transport/calendar"
          cta="Accepted jobs"
        />
        <PortalCard
          icon={<CircleDollarSign />}
          title="Earnings"
          value="Later"
          href="/transport/earnings"
          cta="Open earnings"
        />
      </div>
    );
  }

  const list = mode === "jobs" ? available : accepted;

  const mapRoutes = useMemo(() => buildJobsMapRoutes(jobs), [jobs]);
  const filteredMapRoutes = useMemo(
    () =>
      mapRoutes.filter((route) =>
        workFilter === "all" ? true : route.workType === workFilter
      ),
    [mapRoutes, workFilter]
  );
  const activeRoute =
    filteredMapRoutes.find((route) => route.id === activeRouteId) ??
    filteredMapRoutes[0];

  if (mode === "jobs" && view === "map") {
    return (
      <JobsMapView
        routes={filteredMapRoutes}
        allRoutes={mapRoutes}
        activeId={activeRoute?.id ?? null}
        workFilter={workFilter}
        onWorkFilterChange={(nextFilter) => {
          setWorkFilter(nextFilter);
          setActiveRouteId(null);
        }}
        onSelect={setActiveRouteId}
        onOpen={(route) => router.push(route.href)}
        onShowList={() => setView("list")}
        onShowCalendar={() => router.push("/transport/calendar")}
      />
    );
  }

  if (list.length === 0) {
    return (
      <Card className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
          {mode === "jobs" ? <Truck className="h-6 w-6" /> : <CalendarDays className="h-6 w-6" />}
        </div>
        <h2 className="text-lg font-bold text-sage-deep">
          {mode === "jobs" ? "No open transport RFTs." : "No accepted jobs yet."}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          {mode === "jobs"
            ? "Farmers create RFTs from an agreement workspace once the route and stock details are known."
            : "Accepted jobs appear here after you accept them from the job board."}
        </p>
        <ButtonLink href={mode === "jobs" ? "/agreements" : "/transport/jobs"} className="mt-4 inline-flex">
          {mode === "jobs" ? "Open agreements" : "Browse RFTs"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      {mode === "jobs" ? (
        <div className="mb-4 inline-flex rounded-[8px] border border-mist bg-warm-white p-1">
          <button
            type="button"
            onClick={() => setView("map")}
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-4 text-sm font-bold text-sage-deep hover:bg-sage-mist"
          >
            <Map className="h-4 w-4" aria-hidden />
            Map
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-sage-deep px-4 text-sm font-bold text-white"
          >
            <List className="h-4 w-4" aria-hidden />
            List
          </button>
        </div>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((job) => (
          <TransportJobCard
            key={job.id}
            job={job}
            mode={mode}
            onAccept={() => acceptJob(job)}
          />
        ))}
      </div>
    </>
  );
}

function FarmerTransportPortal({
  activeProfile,
  jobs,
}: {
  activeProfile?: Farmer;
  jobs: TransportJob[];
}) {
  const latestJob = jobs[0];

  if (!latestJob) {
    return (
      <Card className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
          <Truck className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-sage-deep">
          No transport linked yet.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          Once an agreement needs stock moved, the carrier and transport room
          will appear here.
        </p>
        <ButtonLink href="/agreements" className="mt-4 inline-flex">
          Open agreements
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>
    );
  }

  const isLivestockOwner = latestJob.farmerAId === activeProfile?.id;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge tone="info">{formatTransportStatus(latestJob.status)}</StatusBadge>
          <StatusBadge tone="neutral">
            {isLivestockOwner ? "Your stock movement" : "Incoming stock movement"}
          </StatusBadge>
        </div>
        <h2 className="text-2xl font-bold text-sage-deep">
          {latestJob.routeSummary}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark/75">
          {latestJob.livestockCount} moving from {latestJob.pickup} to{" "}
          {latestJob.destination}. Pickup is planned for {latestJob.preferredDate}.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoTile label="Transport company" value={latestJob.driver} />
          <InfoTile label="Pickup" value={latestJob.pickup} />
          <InfoTile label="Destination" value={latestJob.destination} />
          <InfoTile label="Agreement status" value={latestJob.agreementContext.agreementStatus} />
        </div>
        <ButtonLink href={`/transport/${latestJob.id}`} className="mt-5">
          Open transport room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>

      <Card>
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sage-mist text-sage-deep">
          <Truck className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-xl font-bold text-sage-deep">
          Last transport used
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-bark/75">
          {latestJob.driver} is attached to your latest agistment movement.
          Farmer views show carrier details and movement status, not driver
          job boards or earnings.
        </p>
        <div className="mt-4 space-y-3">
          <InfoTile label="Route" value={latestJob.routeSummary} />
          <InfoTile label="Livestock" value={latestJob.livestockCount} />
        </div>
        <ButtonLink href="/transport/available" variant="secondary" className="mt-5">
          View carrier capacity
        </ButtonLink>
      </Card>
    </div>
  );
}

function JobsMapView({
  routes,
  allRoutes,
  activeId,
  workFilter,
  onWorkFilterChange,
  onSelect,
  onOpen,
  onShowList,
  onShowCalendar,
}: {
  routes: JobsMapRoute[];
  allRoutes: JobsMapRoute[];
  activeId: string | null;
  workFilter: WorkFilter;
  onWorkFilterChange: (filter: WorkFilter) => void;
  onSelect: (id: string) => void;
  onOpen: (route: JobsMapRoute) => void;
  onShowList: () => void;
  onShowCalendar: () => void;
}) {
  const totals = routes.reduce(
    (sum, route) => ({
      jobs: sum.jobs + 1,
      fee: sum.fee + route.fee,
      distance: sum.distance + route.distanceKm,
      minutes: sum.minutes + driveTimeToMinutes(route.driveTime),
    }),
    { jobs: 0, fee: 0, distance: 0, minutes: 0 }
  );
  const livestockCount = allRoutes.filter((route) => route.workType === "livestock").length;
  const feedCount = allRoutes.filter((route) => route.workType === "feed").length;

  return (
    <section className="overflow-hidden rounded-[8px] border border-mist bg-warm-white shadow-sm shadow-bark/5">
      <div className="grid min-h-[74dvh] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="border-b border-mist bg-cream p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-bark">RFT Route Map</h2>
              <p className="mt-1 text-sm text-stone">
                Livestock plus feed freight for hay and silage.
              </p>
            </div>
            <Truck className="h-6 w-6 text-sage-deep" aria-hidden />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-[8px] border border-mist bg-warm-white p-1">
            <WorkFilterButton
              active={workFilter === "all"}
              label="All"
              count={allRoutes.length}
              onClick={() => onWorkFilterChange("all")}
            />
            <WorkFilterButton
              active={workFilter === "livestock"}
              label="Stock"
              count={livestockCount}
              onClick={() => onWorkFilterChange("livestock")}
            />
            <WorkFilterButton
              active={workFilter === "feed"}
              label="Feed"
              count={feedCount}
              onClick={() => onWorkFilterChange("feed")}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 rounded-[8px] border border-mist bg-warm-white p-1">
            <button type="button" className="min-h-10 rounded-[8px] bg-sage-deep text-sm font-bold text-white">
              Map
            </button>
            <button type="button" onClick={onShowList} className="min-h-10 rounded-[8px] text-sm font-bold text-sage-deep hover:bg-sage-mist">
              List
            </button>
            <button type="button" onClick={onShowCalendar} className="min-h-10 rounded-[8px] text-sm font-bold text-sage-deep hover:bg-sage-mist">
              Calendar
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-bark">
              {workFilter === "feed" ? "Feed runs" : "RFTs"}
            </h3>
            <span className="rounded-full bg-sage-mist px-2.5 py-1 text-xs font-bold text-sage-deep">
              {routes.length}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className={`w-full rounded-[8px] border bg-warm-white p-3 text-left transition hover:border-sage ${
                  activeId === route.id ? "border-sage-deep shadow-md shadow-bark/10" : "border-mist"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(route.id)}
                  className="block w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-wide text-stone">
                        {route.workType === "feed" ? "Feed run" : "Livestock RFT"}
                      </p>
                      <StatusPill status={route.status} />
                      <p className="mt-2 text-base font-bold text-bark">{route.destinationTown}</p>
                      <p className="text-xs text-stone">{route.owner}</p>
                    </div>
                    <span className="text-sm font-bold text-sage-deep">${route.fee}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-stone">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {route.pickupTown} to {route.destinationTown}
                    </span>
                    <span>{route.loadLabel}</span>
                    <span>{route.summary}</span>
                    <span>{route.distanceKm} km, {route.driveTime}, {route.month}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(route)}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-sage-deep px-3 text-sm font-bold text-white transition hover:bg-sage"
                >
                  {route.workType === "feed" ? "View feed run" : "View RFT"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </aside>
        <div className="relative min-h-[38rem] overflow-hidden bg-[#eef3e8]">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <MapFilter label={workFilter === "feed" ? "Feed runs" : workFilter === "livestock" ? "Livestock RFTs" : "All work"} />
            <MapFilter label="All statuses" />
            <MapFilter label="Hay & silage visible" />
          </div>
          <button
            type="button"
            className="absolute right-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-mist bg-warm-white/95 px-4 text-sm font-bold text-sage-deep shadow-sm"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Re-centre
          </button>
          <GoogleJobsMap routes={routes} activeId={activeId} onSelect={onSelect} onOpen={onOpen} />
          <div className="absolute inset-x-3 bottom-3 z-10 grid gap-3 rounded-[8px] border border-mist bg-warm-white/95 p-4 shadow-lg shadow-bark/10 backdrop-blur sm:grid-cols-4">
            <SummaryTile icon={<List />} value={String(totals.jobs)} label={workFilter === "feed" ? "Feed runs" : "Total jobs"} />
            <SummaryTile icon={<CircleDollarSign />} value={`$${totals.fee.toLocaleString()}`} label="Total earnings" />
            <SummaryTile icon={<Route />} value={`${totals.distance} km`} label="Total distance" />
            <SummaryTile icon={<Clock3 />} value={minutesToDriveTime(totals.minutes)} label="Total drive time" />
          </div>
        </div>
      </div>
    </section>
  );
}

function readPersonaCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("paddockme_persona="));
  return entry ? decodeURIComponent(entry.split("=")[1] ?? "") : null;
}

function PortalCard({
  icon,
  title,
  value,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-sage-deep">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sage-mist">
          {icon}
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-bark/65">{value}</p>
        </div>
      </div>
      <ButtonLink href={href} className="mt-auto">
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </Card>
  );
}

function JobsRouteCanvas({
  routes,
  activeId,
  onSelect,
  onOpen,
}: {
  routes: JobsMapRoute[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onOpen: (route: JobsMapRoute) => void;
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 opacity-95" style={{ backgroundImage: "linear-gradient(90deg, rgba(212,207,194,.35) 1px, transparent 1px), linear-gradient(rgba(212,207,194,.35) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path d="M5 78 C20 64 33 62 43 50 C58 33 71 31 95 18" fill="none" stroke="#d7dfd2" strokeWidth="10" opacity="0.35" />
        <path d="M12 72 C29 69 38 56 50 55 C63 54 75 42 91 46" fill="none" stroke="#d7dfd2" strokeWidth="9" opacity="0.28" />
        <path d="M48 12 C55 26 48 40 55 53 C61 64 60 77 66 92" fill="none" stroke="#cbd9c4" strokeWidth="7" opacity="0.34" />
        {routes.map((route) => {
          const active = activeId === route.id;
          const colour = statusColour(route.status);
          return (
            <g key={route.id}>
              <path
                d={route.path}
                fill="none"
                stroke={colour.soft}
                strokeWidth={active ? 1.95 : 1.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={active ? 0.96 : 0.74}
              />
              <path
                d={route.path}
                fill="none"
                stroke={colour.main}
                strokeWidth={active ? 0.78 : 0.46}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={active ? 1 : 0.88}
                onClick={() => onSelect(route.id)}
                className="cursor-pointer"
              />
              <circle cx={route.start.x} cy={route.start.y} r={active ? 0.72 : 0.58} fill="#fdfcf9" stroke={colour.main} strokeWidth="0.26" />
              <circle cx={route.end.x} cy={route.end.y} r={active ? 0.86 : 0.7} fill={colour.main} stroke="#fdfcf9" strokeWidth="0.26" />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0">
        {routes.map((route) => {
          const active = activeId === route.id;
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => {
                onSelect(route.id);
                if (active) onOpen(route);
              }}
              className={`absolute min-w-[9.5rem] rounded-[8px] border bg-warm-white/95 p-3 text-left shadow-lg shadow-bark/10 backdrop-blur transition ${
                active ? "z-20 border-sage-deep scale-[1.02]" : "z-10 border-mist hover:border-sage"
              }`}
              style={{ left: `${route.label.x}%`, top: `${route.label.y}%` }}
            >
              <p className="text-sm font-bold text-bark">{route.destinationTown}</p>
              <p className="mt-1 text-xs font-semibold text-stone">{route.id}</p>
              <p className="mt-1 text-xs text-bark">{route.distanceKm} km, {route.driveTime}</p>
              <StatusPill status={route.status} compact />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkFilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-10 items-center justify-center gap-1 rounded-[8px] px-2 text-sm font-bold transition ${
        active
          ? "bg-sage-deep text-white"
          : "text-sage-deep hover:bg-sage-mist"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.65rem] ${
          active ? "bg-white/18 text-white" : "bg-sage-mist text-sage-deep"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function MapFilter({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex min-h-11 items-center rounded-[8px] border border-mist bg-warm-white/95 px-4 text-sm font-bold text-bark shadow-sm">
      {label}
    </button>
  );
}

function SummaryTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-mist text-sage-deep [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <span>
        <p className="text-xl font-bold text-bark">{value}</p>
        <p className="text-xs text-stone">{label}</p>
      </span>
    </div>
  );
}

function GoogleJobsMap({
  routes,
  activeId,
  onSelect,
  onOpen,
}: {
  routes: JobsMapRoute[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onOpen: (route: JobsMapRoute) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<globalThis.Map<string, google.maps.Polyline>>(new globalThis.Map());
  const markersRef = useRef<globalThis.Map<string, google.maps.Marker[]>>(new globalThis.Map());
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY || !containerRef.current || mapRef.current) return;
    let cancelled = false;
    setOptions({ key: GOOGLE_MAPS_KEY, v: "weekly" });

    const timeout = window.setTimeout(() => {
      if (!mapRef.current && !cancelled) {
        setMapError("Google Maps timed out. Showing route fallback.");
      }
    }, 6000);

    Promise.all([importLibrary("maps")])
      .then(([mapsLibrary]) => {
        if (cancelled || !containerRef.current) return;
        const { Map: GoogleMap } = mapsLibrary as google.maps.MapsLibrary;
        const map = new GoogleMap(containerRef.current, {
          center: { lat: -35.2, lng: 149.35 },
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          styles: PADDOCKME_MAP_STYLE,
        });
        mapRef.current = map;
        infoRef.current = new google.maps.InfoWindow();
        setMapReady(true);
        setMapError(null);
      })
      .catch((error) => {
        setMapError(error instanceof Error ? error.message : "Google Maps failed to load.");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    for (const polyline of polylinesRef.current.values()) {
      polyline.setMap(null);
    }
    for (const markers of markersRef.current.values()) {
      markers.forEach((marker) => marker.setMap(null));
    }
    polylinesRef.current.clear();
    markersRef.current.clear();

    const bounds = new google.maps.LatLngBounds();

    routes.forEach((route) => {
      const colour = statusColour(route.status);
      const isActive = route.id === activeId;
      const path = [
        { lat: route.origin.lat, lng: route.origin.lng },
        midpointForRoute(route),
        { lat: route.destination.lat, lng: route.destination.lng },
      ];

      path.forEach((point) => bounds.extend(point));

      const polyline = new google.maps.Polyline({
        path,
        map,
        geodesic: true,
        strokeColor: colour.main,
        strokeOpacity: isActive ? 0.96 : 0.72,
        strokeWeight: isActive ? 6 : 4,
        zIndex: isActive ? 20 : 10,
      });
      polyline.addListener("click", () => {
        onSelect(route.id);
        openRouteInfo(route, map, infoRef.current, onOpen);
      });
      polylinesRef.current.set(route.id, polyline);

      const pickupMarker = new google.maps.Marker({
        position: route.origin,
        map,
        label: { text: "A", color: "#ffffff", fontWeight: "700" },
        title: `Pickup: ${route.pickupTown}`,
        icon: markerIcon("#2f5d39"),
        zIndex: isActive ? 25 : 12,
      });
      const destinationMarker = new google.maps.Marker({
        position: route.destination,
        map,
        label: { text: "B", color: "#ffffff", fontWeight: "700" },
        title: `Destination: ${route.destinationTown}`,
        icon: markerIcon(colour.main),
        zIndex: isActive ? 26 : 13,
      });
      [pickupMarker, destinationMarker].forEach((marker) => {
        marker.addListener("click", () => {
          onSelect(route.id);
          openRouteInfo(route, map, infoRef.current, onOpen);
        });
      });
      markersRef.current.set(route.id, [pickupMarker, destinationMarker]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 72);
    }
  }, [activeId, mapReady, onOpen, onSelect, routes]);

  useEffect(() => {
    const activeRoute = routes.find((route) => route.id === activeId);
    if (!activeRoute || !mapRef.current || !infoRef.current) return;
    openRouteInfo(activeRoute, mapRef.current, infoRef.current, onOpen);
  }, [activeId, onOpen, routes]);

  if (!GOOGLE_MAPS_KEY || mapError) {
    return (
      <>
        <JobsRouteCanvas routes={routes} activeId={activeId} onSelect={onSelect} onOpen={onOpen} />
        <div className="absolute left-4 bottom-[7.25rem] z-20 rounded-[8px] border border-amber/25 bg-amber-light px-3 py-2 text-xs font-bold text-amber shadow-sm">
          Google Maps unavailable, showing fallback routes.
        </div>
      </>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="Google map of transport RFT routes" />
      {!mapReady && (
        <div className="absolute inset-0 grid place-items-center bg-[#eef3e8] text-sm font-bold text-sage-deep">
          Loading Google Maps...
        </div>
      )}
    </div>
  );
}

function openRouteInfo(
  route: JobsMapRoute,
  map: google.maps.Map,
  info: google.maps.InfoWindow | null,
  onOpen: (route: JobsMapRoute) => void
) {
  if (!info) return;
  const colour = statusColour(route.status);
  const content = document.createElement("div");
  content.className = "min-w-[11rem] max-w-[15rem] text-bark";
  content.innerHTML = `
    <div style="font-family: inherit;">
      <p style="margin:0;font-weight:800;color:#2f5d39;">${escapeHtml(route.destinationTown)}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6d6257;">${escapeHtml(route.id)} · ${route.distanceKm} km · ${escapeHtml(route.driveTime)}</p>
      <p style="margin:6px 0 0;font-size:12px;font-weight:700;color:#3f3328;">${escapeHtml(route.loadLabel)}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#3f3328;">${escapeHtml(route.pickupTown)} to ${escapeHtml(route.destinationTown)}</p>
      <button type="button" style="margin-top:10px;min-height:34px;border:0;border-radius:8px;background:#2f5d39;color:#fff;font-weight:800;padding:0 12px;cursor:pointer;">${route.workType === "feed" ? "View feed run" : "View RFT"}</button>
      <span style="display:inline-block;margin-left:6px;border-radius:6px;background:${colour.badge};color:${colour.text};font-size:11px;font-weight:800;padding:5px 7px;text-transform:uppercase;">${escapeHtml(statusLabel(route.status))}</span>
    </div>
  `;
  content.querySelector("button")?.addEventListener("click", () => onOpen(route));
  info.setContent(content);
  info.setPosition({
    lat: route.destination.lat,
    lng: route.destination.lng,
  });
  info.open({ map });
}

function midpointForRoute(route: JobsMapRoute): google.maps.LatLngLiteral {
  const offset = route.status === "new" ? 0.08 : route.status === "in_transit" ? -0.08 : 0.04;
  return {
    lat: (route.origin.lat + route.destination.lat) / 2 + offset,
    lng: (route.origin.lng + route.destination.lng) / 2,
  };
}

function markerIcon(colour: string): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: colour,
    fillOpacity: 1,
    strokeColor: "#fdfcf9",
    strokeWeight: 2,
    scale: 12,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function StatusPill({ status, compact = false }: { status: JobsMapRoute["status"]; compact?: boolean }) {
  const colour = statusColour(status);
  return (
    <span
      className={`mt-2 inline-flex rounded-[6px] px-2 py-1 text-[0.68rem] font-bold uppercase ${compact ? "" : ""}`}
      style={{ backgroundColor: colour.badge, color: colour.text }}
    >
      {statusLabel(status)}
    </span>
  );
}

function statusLabel(status: JobsMapRoute["status"]) {
  return status === "in_transit" ? "In transit" : status;
}

function TransportJobCard({
  job,
  mode,
  onAccept,
}: {
  job: TransportJob;
  mode: Mode;
  onAccept: () => void;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <StatusBadge tone={toneForStatus(job.status)}>
          {formatTransportStatus(job.status)}
        </StatusBadge>
        <h2 className="mt-3 text-xl font-bold text-sage-deep">
          {job.livestockCount}
        </h2>
        <p className="mt-1 text-sm text-bark/65">{job.routeSummary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoTile tone="subtle" size="sm" label="Pickup" value={job.pickup} />
        <InfoTile tone="subtle" size="sm" label="Destination" value={job.destination} />
        <InfoTile tone="subtle" size="sm" label="Date" value={job.preferredDate} />
        <InfoTile tone="subtle" size="sm" label="Driver" value={job.driver} />
      </div>
      {mode === "jobs" ? (
        <Button type="button" onClick={onAccept} className="mt-auto">
          Accept RFT
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      ) : (
        <ButtonLink href={`/transport/${job.id}`} className="mt-auto">
          Open transport room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      )}
    </Card>
  );
}

function toneForStatus(status: TransportJobStatus) {
  if (status === "completed" || status === "arrived") return "success";
  if (status === "available") return "warning";
  if (status === "cancelled") return "neutral";
  return "info";
}

function buildJobsMapRoutes(jobs: TransportJob[]): JobsMapRoute[] {
  const liveRoutes = jobs.map((job, index) => routeFromTransportJob(job, index));
  const demoRoutes: JobsMapRoute[] = [
    ...liveRoutes,
    ...feedRuns.map(feedRunToRoute),
    {
      id: "REQ-2505",
      workType: "livestock",
      status: "new",
      pickupTown: "Collector",
      destinationTown: "Braidwood",
      owner: "Livestock owner",
      livestock: "Merino ewes",
      headCount: "120",
      loadLabel: "120 Merino ewes",
      summary: "Collector to Braidwood via Tarago Road",
      distanceKm: 18,
      driveTime: "1h 10m",
      fee: 320,
      month: "May",
      href: "/transport/jobs",
      path: "M14 72 C22 72 29 68 36 63 C42 59 46 58 51 55",
      start: { x: 14, y: 72 },
      end: { x: 51, y: 55 },
      label: { x: 36, y: 48 },
      origin: townCoordinate("Collector"),
      destination: townCoordinate("Braidwood"),
    },
    {
      id: "JOB-2503",
      workType: "livestock",
      status: "in_transit",
      pickupTown: "Braidwood",
      destinationTown: "Captains Flat",
      owner: "Livestock owner",
      livestock: "Hereford heifers",
      headCount: "60",
      loadLabel: "60 Hereford heifers",
      summary: "Braidwood to Captains Flat ridge run",
      distanceKm: 42,
      driveTime: "2h 20m",
      fee: 520,
      month: "May",
      href: "/transport/transport-glenbarra",
      path: "M51 55 C60 55 66 50 73 52 C78 54 82 51 88 50",
      start: { x: 51, y: 55 },
      end: { x: 88, y: 50 },
      label: { x: 78, y: 59 },
      origin: townCoordinate("Braidwood"),
      destination: townCoordinate("Captains Flat"),
    },
    {
      id: "JOB-2502",
      workType: "livestock",
      status: "completed",
      pickupTown: "Bungendore",
      destinationTown: "Araluen",
      owner: "Landowner",
      livestock: "Merino ewes",
      headCount: "100",
      loadLabel: "100 Merino ewes",
      summary: "Bungendore to Araluen south road",
      distanceKm: 55,
      driveTime: "2h 30m",
      fee: 600,
      month: "May",
      href: "/transport/transport-glenbarra",
      path: "M60 22 C60 35 58 46 59 58 C60 70 65 78 69 87",
      start: { x: 60, y: 22 },
      end: { x: 69, y: 87 },
      label: { x: 72, y: 78 },
      origin: townCoordinate("Bungendore"),
      destination: townCoordinate("Araluen"),
    },
  ];
  return demoRoutes.slice(0, 8);
}

function routeFromTransportJob(job: TransportJob, index: number): JobsMapRoute {
  const status: JobsMapRoute["status"] = job.status === "completed" ? "completed" : job.status === "in_transit" ? "in_transit" : job.status === "available" ? "new" : "accepted";
  const distance = index === 0 ? 32 : 28 + index * 9;
  const fee = job.quotes?.[0]?.amount ? Math.round(job.quotes[0].amount * Number.parseInt(job.livestockCount, 10)) : 450 + index * 80;
  return {
    id: index === 0 ? "JOB-2504" : job.id,
    workType: "livestock",
    status,
    pickupTown: townFromPlace(job.pickup, job.pickupRegion),
    destinationTown: townFromPlace(job.destination, job.destinationRegion),
    owner: "Landowner",
    livestock: job.livestockCount.replace(/^\d+\s*/, ""),
    headCount: String(Number.parseInt(job.livestockCount, 10) || 100),
    loadLabel: job.livestockCount,
    summary: job.routeSummary,
    distanceKm: distance,
    driveTime: "1h 45m",
    fee,
    month: monthFromText(job.preferredDate),
    href: `/transport/${job.id}`,
    path: "M47 55 C50 47 55 42 58 35 C60 30 61 26 60 22",
    start: { x: 47, y: 55 },
    end: { x: 60, y: 22 },
    label: { x: 64, y: 23 },
    origin: routeCoordinateFrom(
      job.pickupLocation ?? coordinateForRegion(job.pickupRegion) ?? mapCoordinates.dale,
      townFromPlace(job.pickup, job.pickupRegion)
    ),
    destination: routeCoordinateFrom(
      job.destinationLocation ?? coordinateForRegion(job.destinationRegion) ?? mapCoordinates.gundagai,
      townFromPlace(job.destination, job.destinationRegion)
    ),
  };
}

function feedRunToRoute(run: FeedRun): JobsMapRoute {
  return {
    id: run.id,
    workType: "feed",
    status: run.status,
    pickupTown: run.pickupTown,
    destinationTown: run.destinationTown,
    owner: run.owner,
    livestock: run.commodity,
    headCount: run.load,
    loadLabel: `${run.commodity}: ${run.load}`,
    summary: run.summary,
    distanceKm: run.distanceKm,
    driveTime: run.driveTime,
    fee: run.fee,
    month: run.month,
    href: run.href,
    path: "M35 72 C44 62 50 54 58 45 C64 38 72 35 82 31",
    start: { x: 35, y: 72 },
    end: { x: 82, y: 31 },
    label: { x: 62, y: 38 },
    origin: run.origin,
    destination: run.destination,
  };
}

function townCoordinate(town: string): RouteCoordinate {
  const coordinates: Record<string, RouteCoordinate> = {
    Araluen: { lat: -35.645, lng: 149.816, label: "Araluen" },
    Braidwood: { lat: -35.441, lng: 149.799, label: "Braidwood" },
    Bungendore: { lat: -35.254, lng: 149.441, label: "Bungendore" },
    "Captains Flat": { lat: -35.590, lng: 149.445, label: "Captains Flat" },
    Collector: { lat: -34.917, lng: 149.429, label: "Collector" },
    Tarago: { lat: -35.069, lng: 149.652, label: "Tarago" },
  };
  return coordinates[town] ?? routeCoordinateFrom(mapCoordinates.gundagai, town);
}

function routeCoordinateFrom(coordinate: Coordinate, label: string): RouteCoordinate {
  return {
    lat: coordinate.latitude,
    lng: coordinate.longitude,
    label,
  };
}

function townFromPlace(place: string, region?: string) {
  if (place.includes("Glenbarra")) return "Bungendore";
  if (place.includes("Livestock owner")) return "Tarago";
  return region?.replace(" NSW", "") ?? place.split(",")[0] ?? "Route";
}

function statusColour(status: JobsMapRoute["status"]) {
  const colours = {
    new: { main: "#3f8fe8", soft: "#b9d8fb", badge: "#dbeafe", text: "#1d4f91" },
    accepted: { main: "#e88f3f", soft: "#f7c27d", badge: "#fde7cf", text: "#9a4b14" },
    in_transit: { main: "#7c3bc5", soft: "#d7c1f0", badge: "#eadcff", text: "#5a2892" },
    completed: { main: "#2f8a43", soft: "#b7d8af", badge: "#dff2df", text: "#226333" },
  };
  return colours[status];
}

function driveTimeToMinutes(value: string) {
  const hourMatch = value.match(/(\d+)h/);
  const minuteMatch = value.match(/(\d+)m/);
  return (hourMatch ? Number(hourMatch[1]) * 60 : 0) + (minuteMatch ? Number(minuteMatch[1]) : 0);
}

function minutesToDriveTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function monthFromText(value: string) {
  const match = value.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i);
  return match ? match[0].slice(0, 3) : "May";
}
