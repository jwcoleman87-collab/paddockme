"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { TransportJob, TransportJobStatus } from "@/lib/dummyData";

type Mode = "portal" | "jobs" | "calendar";
type JobsView = "map" | "list" | "calendar";

type JobsMapRoute = {
  id: string;
  status: "new" | "accepted" | "in_transit" | "completed";
  pickupTown: string;
  destinationTown: string;
  owner: string;
  livestock: string;
  headCount: string;
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
};

export function TransportJobsClient({ mode }: { mode: Mode }) {
  const router = useRouter();
  const flash = useFlash();
  const [jobs, setJobs] = useState<TransportJob[]>([]);
  const [view, setView] = useState<JobsView>("map");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  useEffect(() => {
    void listTransportJobs().then(setJobs);
  }, []);

  const available = useMemo(
    () => jobs.filter((job) => job.status === "available"),
    [jobs]
  );
  const accepted = useMemo(
    () => jobs.filter((job) => job.status !== "available" && job.status !== "cancelled"),
    [jobs]
  );

  async function acceptJob(job: TransportJob) {
    selectPersona("driver-1");
    const { state } = await updateTransportJobStatus(job.id, "accepted");
    setJobs(state.transportJobs);
    flash("Job accepted. It has been added to Wayne's calendar.", "success");
    router.push(`/transport/${job.id}`);
  }

  if (mode === "portal") {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        <PortalCard
          icon={<Truck />}
          title="Available jobs"
          value={`${available.length}`}
          href="/transport/jobs"
          cta="Browse jobs"
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
          value="Prototype"
          href="/transport/earnings"
          cta="Open earnings"
        />
      </div>
    );
  }

  const list = mode === "jobs" ? available : accepted;

  const mapRoutes = useMemo(() => buildJobsMapRoutes(jobs), [jobs]);
  const activeRoute = mapRoutes.find((route) => route.id === activeRouteId) ?? mapRoutes[0];

  if (mode === "jobs" && view === "map") {
    return (
      <JobsMapView
        routes={mapRoutes}
        activeId={activeRoute?.id ?? null}
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
          {mode === "jobs" ? "No available transport jobs." : "No accepted jobs yet."}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          {mode === "jobs"
            ? "Request transport from an agreement workspace to create a job Wayne can accept."
            : "Accepted jobs appear here after Wayne accepts them from the job board."}
        </p>
        <ButtonLink href={mode === "jobs" ? "/agreements" : "/transport/jobs"} className="mt-4 inline-flex">
          {mode === "jobs" ? "Open agreements" : "Browse jobs"}
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

function JobsMapView({
  routes,
  activeId,
  onSelect,
  onOpen,
  onShowList,
  onShowCalendar,
}: {
  routes: JobsMapRoute[];
  activeId: string | null;
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
  return (
    <section className="overflow-hidden rounded-[8px] border border-mist bg-warm-white shadow-sm shadow-bark/5">
      <div className="grid min-h-[74dvh] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="border-b border-mist bg-cream p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-bark">Jobs Map</h2>
              <p className="mt-1 text-sm text-stone">View and manage Wayne's transport jobs.</p>
            </div>
            <Truck className="h-6 w-6 text-sage-deep" aria-hidden />
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
            <h3 className="text-lg font-bold text-bark">Jobs</h3>
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
                    <span>{route.headCount} {route.livestock}</span>
                    <span>{route.summary}</span>
                    <span>{route.distanceKm} km, {route.driveTime}, {route.month}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(route)}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-sage-deep px-3 text-sm font-bold text-white transition hover:bg-sage"
                >
                  View job
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </aside>
        <div className="relative min-h-[38rem] overflow-hidden bg-[#eef3e8]">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <MapFilter label="All jobs" />
            <MapFilter label="All statuses" />
            <MapFilter label="Show completed" />
          </div>
          <button
            type="button"
            className="absolute right-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-mist bg-warm-white/95 px-4 text-sm font-bold text-sage-deep shadow-sm"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Re-centre
          </button>
          <JobsRouteCanvas routes={routes} activeId={activeId} onSelect={onSelect} onOpen={onOpen} />
          <div className="absolute inset-x-3 bottom-3 z-10 grid gap-3 rounded-[8px] border border-mist bg-warm-white/95 p-4 shadow-lg shadow-bark/10 backdrop-blur sm:grid-cols-4">
            <SummaryTile icon={<List />} value={String(totals.jobs)} label="Total jobs" />
            <SummaryTile icon={<CircleDollarSign />} value={`$${totals.fee.toLocaleString()}`} label="Total earnings" />
            <SummaryTile icon={<Route />} value={`${totals.distance} km`} label="Total distance" />
            <SummaryTile icon={<Clock3 />} value={minutesToDriveTime(totals.minutes)} label="Total drive time" />
          </div>
        </div>
      </div>
    </section>
  );
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

function StatusPill({ status, compact = false }: { status: JobsMapRoute["status"]; compact?: boolean }) {
  const label = status === "in_transit" ? "In transit" : status;
  const colour = statusColour(status);
  return (
    <span
      className={`mt-2 inline-flex rounded-[6px] px-2 py-1 text-[0.68rem] font-bold uppercase ${compact ? "" : ""}`}
      style={{ backgroundColor: colour.badge, color: colour.text }}
    >
      {label}
    </span>
  );
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
          Accept job
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
    {
      id: "REQ-2505",
      status: "new",
      pickupTown: "Collector",
      destinationTown: "Braidwood",
      owner: "Dale (Owner)",
      livestock: "Merino ewes",
      headCount: "120",
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
    },
    {
      id: "JOB-2503",
      status: "in_transit",
      pickupTown: "Braidwood",
      destinationTown: "Captains Flat",
      owner: "Dale (Owner)",
      livestock: "Hereford heifers",
      headCount: "60",
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
    },
    {
      id: "JOB-2502",
      status: "completed",
      pickupTown: "Bungendore",
      destinationTown: "Araluen",
      owner: "Brett (Landowner)",
      livestock: "Merino ewes",
      headCount: "100",
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
    },
  ];
  return demoRoutes.slice(0, 5);
}

function routeFromTransportJob(job: TransportJob, index: number): JobsMapRoute {
  const status: JobsMapRoute["status"] = job.status === "completed" ? "completed" : job.status === "in_transit" ? "in_transit" : job.status === "available" ? "new" : "accepted";
  const distance = index === 0 ? 32 : 28 + index * 9;
  const fee = job.quotes?.[0]?.amount ? Math.round(job.quotes[0].amount * Number.parseInt(job.livestockCount, 10)) : 450 + index * 80;
  return {
    id: index === 0 ? "JOB-2504" : job.id,
    status,
    pickupTown: townFromPlace(job.pickup, job.pickupRegion),
    destinationTown: townFromPlace(job.destination, job.destinationRegion),
    owner: "Brett (Landowner)",
    livestock: job.livestockCount.replace(/^\d+\s*/, ""),
    headCount: String(Number.parseInt(job.livestockCount, 10) || 100),
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
  };
}

function townFromPlace(place: string, region?: string) {
  if (place.includes("Glenbarra")) return "Bungendore";
  if (place.includes("Dale")) return "Tarago";
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
