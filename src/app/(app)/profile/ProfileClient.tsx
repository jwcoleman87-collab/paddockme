"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CheckCircle,
  CircleDot,
  ClipboardList,
  Clock,
  Database,
  Eye,
  Gauge,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Radio,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useFlash } from "@/components/FlashProvider";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { CurrentUserProfile } from "@/lib/supabase/currentUser";
import type {
  Farmer,
  LivestockSubProfile,
  PropertySubProfile,
  TransportSubProfile,
  VerificationCheck,
  VerificationStatus,
} from "@/lib/dummyData";

const verificationTone: Record<VerificationStatus, "success" | "warning" | "neutral"> = {
  Verified: "success",
  Pending: "warning",
  "Not started": "neutral",
};

const verificationIcon = {
  Verified: CheckCircle,
  Pending: CircleDot,
  "Not started": XCircle,
};

const roleIcon: Record<Farmer["role"], React.ComponentType<{ className?: string }>> = {
  "Livestock Owner": Sprout,
  Landowner: Tractor,
  "Transport Provider": Truck,
};

export function ProfileClient({
  farmers,
  currentUserProfile,
}: {
  farmers: Farmer[];
  currentUserProfile?: CurrentUserProfile | null;
}) {
  const flash = useFlash();
  const [activeId, setActiveId] = useState<string>(farmers[0]?.id ?? "");
  const hydratedRef = useRef(false);
  const skipInitialWriteRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookiePersona = readPersonaCookie();
    try {
      const stored =
        window.localStorage.getItem("paddockme.agreements.persona") ??
        window.localStorage.getItem("paddockme.profile.persona") ??
        cookiePersona;
      if (stored && farmers.some((f) => f.id === stored)) {
        setActiveId(stored);
      }
    } catch {
      if (cookiePersona && farmers.some((f) => f.id === cookiePersona)) {
        setActiveId(cookiePersona);
      }
    }
    hydratedRef.current = true;
  }, [farmers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    if (skipInitialWriteRef.current) {
      skipInitialWriteRef.current = false;
      return;
    }
    writePersonaCookie(activeId);
    try {
      window.localStorage.setItem("paddockme.profile.persona", activeId);
      window.localStorage.setItem("paddockme.agreements.persona", activeId);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("paddockme:persona-change"));
  }, [activeId]);

  function selectPersona(nextId: string) {
    setActiveId(nextId);
    writePersonaCookie(nextId);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("paddockme.profile.persona", nextId);
      window.localStorage.setItem("paddockme.agreements.persona", nextId);
      window.dispatchEvent(new CustomEvent("paddockme:persona-change"));
    } catch {
      // ignore
    }
  }

  const farmer = farmers.find((f) => f.id === activeId) ?? farmers[0];
  const isTransportProvider = farmer?.role === "Transport Provider";

  const [transportViewMode, setTransportViewMode] = useState<"owner" | "public">(
    "owner"
  );
  // Reset the transport view mode when the selected persona changes - the
  // owner default makes sense since the switcher above effectively makes you
  // "become" that persona.
  useEffect(() => {
    setTransportViewMode("owner");
  }, [activeId]);

  if (!farmer) return null;

  const RoleIcon = roleIcon[farmer.role];
  const showPublicView = isTransportProvider && transportViewMode === "public";
  const showDriverDashboard =
    isTransportProvider && transportViewMode === "owner";

  return (
    <>
      {currentUserProfile && (
        <SupabaseProfileSummary profile={currentUserProfile} />
      )}

      <section
        aria-label="Profile record switcher"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <UserRound className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Agreement participants
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Profile records
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose a participant profile"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {farmers.map((option) => {
            const active = option.id === activeId;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectPersona(option.id)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                )}
              >
                <Avatar
                  name={option.name}
                  src={option.avatarUrl}
                  size="md"
                  ring={active}
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{option.name}</p>
                  <p
                    className={cn(
                      "truncate text-xs",
                      active ? "text-sage-glow" : "text-bark/65"
                    )}
                  >
                    {option.role}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {isTransportProvider && (
        <TransportViewToggle
          mode={transportViewMode}
          onChange={setTransportViewMode}
        />
      )}

      {showDriverDashboard ? (
        <DriverOwnerDashboard farmer={farmer} flash={flash} />
      ) : (
      <>
      <Card className="mb-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              name={farmer.name}
              src={farmer.avatarUrl}
              size="xl"
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
                  <RoleIcon className="h-3.5 w-3.5" aria-hidden />
                  {farmer.role}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-3 py-1 text-xs font-bold text-bark">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {farmer.region}
                </span>
                {farmer.mobileVerified && (
                  <StatusBadge tone="success">Mobile verified</StatusBadge>
                )}
                {showPublicView && farmer.verified && (
                  <StatusBadge tone="success">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified provider
                  </StatusBadge>
                )}
              </div>
              <h2 className="text-2xl font-bold text-sage-deep">{farmer.name}</h2>
              <p className="mt-1 text-sm font-semibold text-bark/70">
                {farmer.tagline}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bark/75">
                {farmer.bio}
              </p>
            </div>
          </div>
          {showPublicView ? (
            <PublicTrustSummary farmer={farmer} />
          ) : (
            <div className="rounded-2xl border border-sage-deep/15 bg-warm-white px-5 py-4 text-center md:min-w-44">
              <div className="mb-2 flex items-center justify-center gap-2 text-sage-deep">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Preparedness
                </span>
              </div>
              <p className="text-4xl font-extrabold text-sage-deep">
                {farmer.preparednessScore}
              </p>
              <p className="mt-1 text-xs text-bark/65">
                Placeholder score. Verification + readiness driven.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          {farmer.livestock && <LivestockCard livestock={farmer.livestock} />}
          {farmer.property && <PropertyCard property={farmer.property} />}
          {farmer.transport && (
            <TransportCard
              transport={farmer.transport}
              publicView={showPublicView}
            />
          )}
          {showPublicView ? (
            <PublicTrustSignals verifications={farmer.verifications} />
          ) : (
            <VerificationGrid verifications={farmer.verifications} />
          )}
        </div>

        <aside className="space-y-5">
          {showPublicView ? (
            <PublicEnquiryCard
              farmer={farmer}
              flash={flash}
            />
          ) : (
            <ReadinessCard
              items={farmer.readiness}
              roleLabel={
                farmer.role === "Livestock Owner"
                  ? "Livestock readiness"
                  : farmer.role === "Landowner"
                    ? "Property readiness"
                    : "Transport readiness"
              }
            />
          )}
        </aside>
      </div>

      {!showPublicView && (
        <section
          aria-label="Workspace tools"
          className="mt-7 rounded-xl border border-dashed border-mist bg-cream/45 px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-stone">
                Workspace tools
              </p>
              <p className="mt-1 text-sm text-bark/70">
                Workspace and transport state are stored in this browser. Wipe
                them to start clean.
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetPrototypeState(flash)}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-mist bg-warm-white px-4 py-2 text-sm font-semibold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset workspace state
            </button>
          </div>
        </section>
      )}
      </>
      )}
    </>
  );
}

function DriverOwnerDashboard({
  farmer,
  flash,
}: {
  farmer: Farmer;
  flash: (
    message: string,
    tone?: "info" | "success" | "warning"
  ) => void;
}) {
  const verifiedCount = farmer.verifications.filter(
    (check) => check.status === "Verified"
  ).length;
  const totalChecks = farmer.verifications.length;
  const readinessDone = farmer.readiness.filter((item) => item.complete).length;
  const profileCompletion = Math.round(
    ((verifiedCount + readinessDone) /
      Math.max(1, totalChecks + farmer.readiness.length)) *
      100
  );
  const pendingVerifications = farmer.verifications.filter(
    (check) => check.status !== "Verified"
  );
  const openSetupTasks = farmer.readiness.filter((item) => !item.complete);
  const fleetSize = farmer.transport?.fleetSize ?? 0;
  const driverCount = farmer.transport?.driverCount ?? 0;

  const dashboardActions: {
    label: string;
    helper: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[] = [
    {
      label: "Post a run",
      helper: "Publish available capacity",
      icon: Plus,
      onClick: () => flash("Opening run capacity post...", "info"),
    },
    {
      label: "Share backloads",
      helper: "Empty legs farmers can grab",
      icon: Radio,
      onClick: () => flash("Backload availability draft started.", "info"),
    },
    {
      label: "Calendar",
      helper: "Update truck availability",
      icon: CalendarClock,
      onClick: () => flash("Calendar view coming soon.", "info"),
    },
    {
      label: "Manage fleet",
      helper: "Vehicles, drivers, configs",
      icon: Wrench,
      onClick: () => flash("Fleet management opens here.", "info"),
    },
  ];

  return (
    <>
      <section
        aria-label="Driver dashboard header"
        className="mb-5 overflow-hidden rounded-2xl border border-sage-deep/15 bg-gradient-to-br from-sage-deep to-sage-dark text-cream shadow-sm"
      >
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              name={farmer.name}
              src={farmer.avatarUrl}
              size="xl"
              className="shrink-0 ring-2 ring-cream/40"
            />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                  Driver workspace
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1 text-xs font-bold">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {farmer.region}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage-glow">
                Welcome back
              </p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight">
                {farmer.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-cream/85">
                {farmer.tagline}
              </p>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:min-w-[18rem]">
            <DashboardMetric
              label="Profile complete"
              value={`${profileCompletion}%`}
              helper={`${verifiedCount + readinessDone} of ${totalChecks + farmer.readiness.length} done`}
              icon={Gauge}
            />
            <DashboardMetric
              label="Verified IDs"
              value={`${verifiedCount}/${totalChecks}`}
              helper={
                pendingVerifications.length === 0
                  ? "All current"
                  : `${pendingVerifications.length} pending`
              }
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      <section aria-label="Quick actions" className="mb-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-stone">
          Quick actions
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="group flex items-start gap-3 rounded-xl border border-sage-deep/15 bg-warm-white p-4 text-left transition hover:-translate-y-0.5 hover:border-sage/40 hover:bg-sage-mist/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-mist text-sage-deep">
                  <ActionIcon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center justify-between gap-1 text-sm font-bold text-sage-deep">
                    {action.label}
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-stone transition group-hover:text-sage-deep" aria-hidden />
                  </p>
                  <p className="mt-0.5 text-xs text-bark/70">{action.helper}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sage-deep">
                <ClipboardList className="h-5 w-5" aria-hidden />
                <h2 className="text-xl font-bold">Set up your profile</h2>
              </div>
              <span className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-bold text-sage-deep">
                {readinessDone}/{farmer.readiness.length} done
              </span>
            </div>
            <p className="text-sm text-bark/70">
              Each task lifts your profile completeness and how trustworthy you
              look to farmers browsing for a transporter.
            </p>
            <ul className="mt-4 space-y-2">
              {farmer.readiness.map((item) => {
                const Icon = item.complete ? CheckCircle : CircleDot;
                return (
                  <li
                    key={item.label}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3",
                      item.complete
                        ? "border-match/25 bg-sage-mist/35"
                        : "border-mist bg-warm-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        item.complete ? "text-match" : "text-stone"
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-bark">{item.label}</p>
                      {item.helper && (
                        <p className="mt-0.5 text-xs text-bark/65">
                          {item.helper}
                        </p>
                      )}
                    </div>
                    {!item.complete && (
                      <button
                        type="button"
                        onClick={() =>
                          flash(`Opening "${item.label}"...`, "info")
                        }
                        className="inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-sage-deep/20 bg-warm-white px-3 py-1 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                      >
                        Action
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </button>
                    )}
                  </li>
                );
              })}
              {openSetupTasks.length === 0 && (
                <li className="rounded-xl border border-match/25 bg-sage-mist/35 px-4 py-3 text-sm font-semibold text-sage-deep">
                  Profile setup complete. Keep an eye on credential renewals
                  below.
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sage-deep">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <h2 className="text-xl font-bold">Compliance and renewals</h2>
              </div>
              {pendingVerifications.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-light px-2.5 py-0.5 text-xs font-bold text-amber">
                  <AlertTriangle className="h-3 w-3" aria-hidden />
                  {pendingVerifications.length} need attention
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {farmer.verifications.map((check) => {
                const Icon = verificationIcon[check.status];
                const tone = verificationTone[check.status];
                return (
                  <li
                    key={check.label}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist bg-warm-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-bark">{check.label}</p>
                      {check.detail && (
                        <p className="mt-0.5 text-xs text-bark/65">
                          {check.detail}
                        </p>
                      )}
                    </div>
                    <StatusBadge tone={tone}>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {check.status}
                    </StatusBadge>
                  </li>
                );
              })}
            </ul>
          </Card>

          {farmer.transport && (
            <TransportCard transport={farmer.transport} publicView={false} />
          )}
        </div>

        <aside className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2 text-sage-deep">
              <Gauge className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-bold">Operations at a glance</h2>
            </div>
            <dl className="space-y-2">
              <SidebarStat
                label="Runs this week"
                value="3"
                helper="2 booked, 1 enquiring"
                icon={Truck}
              />
              <SidebarStat
                label="Backloads pending"
                value="2"
                helper="Riverina to Newcastle, Wagga to Dubbo"
                icon={Radio}
              />
              <SidebarStat
                label="Fleet"
                value={`${fleetSize} truck${fleetSize === 1 ? "" : "s"}`}
                helper={`${driverCount} driver${driverCount === 1 ? "" : "s"} on the books`}
                icon={Wrench}
              />
              <SidebarStat
                label="Indicative monthly"
                value="$18.4k"
                helper="Placeholder, swap with real ledger"
                icon={Banknote}
              />
            </dl>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2 text-sage-deep">
              <Clock className="h-5 w-5" aria-hidden />
              <h2 className="text-lg font-bold">Recent activity</h2>
            </div>
            <ul className="space-y-3 text-sm">
              <ActivityItem
                title="Mobile verified"
                detail="Earlier this morning"
              />
              <ActivityItem
                title="NHVAS module application lodged"
                detail="Yesterday"
              />
              <ActivityItem
                title="B-double run posted: Riverina to Wagga"
                detail="2 days ago"
              />
            </ul>
          </Card>

          <section
            aria-label="Workspace tools"
            className="rounded-xl border border-dashed border-mist bg-cream/45 px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Workspace tools
            </p>
            <p className="mt-1 text-sm text-bark/70">
              Reset the prototype state if you want to walk through onboarding
              again from a clean slate.
            </p>
            <button
              type="button"
              onClick={() => resetPrototypeState(flash)}
              className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-mist bg-warm-white px-4 py-2 text-sm font-semibold text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset workspace state
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

function DashboardMetric({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-cream/20 bg-cream/10 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 text-cream/80">
        <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em]">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>
      <p className="mt-1 text-2xl font-extrabold text-cream">{value}</p>
      <p className="mt-0.5 text-xs text-cream/70">{helper}</p>
    </div>
  );
}

function SidebarStat({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-mist bg-warm-white px-4 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-mist text-sage-deep">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-wide text-stone">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-extrabold text-bark">{value}</p>
        <p className="mt-0.5 text-xs text-bark/65">{helper}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-sage" aria-hidden />
      <div className="min-w-0">
        <p className="font-semibold text-bark">{title}</p>
        <p className="text-xs text-bark/60">{detail}</p>
      </div>
    </li>
  );
}

function TransportViewToggle({
  mode,
  onChange,
}: {
  mode: "owner" | "public";
  onChange: (mode: "owner" | "public") => void;
}) {
  const helper =
    mode === "owner"
      ? "Management view - readiness checks and workspace tools you control."
      : "Public view - the read-only profile farmers see before they enquire.";
  return (
    <section
      aria-label="Driver profile view mode"
      className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-stone">
            Driver profile view
          </p>
          <p className="mt-1 text-sm text-bark/70">{helper}</p>
        </div>
        <div
          role="tablist"
          aria-label="Driver profile view mode"
          className="inline-flex rounded-full border border-sage-deep/15 bg-warm-white p-0.5"
        >
          <ViewToggleButton
            label="Owner view"
            icon={ShieldCheck}
            active={mode === "owner"}
            onClick={() => onChange("owner")}
          />
          <ViewToggleButton
            label="Public view"
            icon={Eye}
            active={mode === "public"}
            onClick={() => onChange("public")}
          />
        </div>
      </div>
    </section>
  );
}

function ViewToggleButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        active
          ? "bg-sage-deep text-cream shadow-sm"
          : "text-bark hover:bg-sage-mist/60"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function PublicTrustSummary({ farmer }: { farmer: Farmer }) {
  const verifiedCount = farmer.verifications.filter(
    (check) => check.status === "Verified"
  ).length;
  const fleetSize = farmer.transport?.fleetSize ?? 1;
  const fleetLabel =
    fleetSize > 1 ? `${fleetSize}-truck fleet` : "Single-truck operator";
  return (
    <div className="rounded-2xl border border-sage-deep/15 bg-warm-white px-5 py-4 text-center md:min-w-44">
      <div className="mb-2 flex items-center justify-center gap-2 text-sage-deep">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide">
          Trusted record
        </span>
      </div>
      <p className="text-4xl font-extrabold text-sage-deep">
        {verifiedCount}
      </p>
      <p className="mt-1 text-xs font-semibold text-bark/65">
        verified credentials
      </p>
      <p className="mt-3 text-xs text-bark/70">{fleetLabel}</p>
    </div>
  );
}

function PublicTrustSignals({
  verifications,
}: {
  verifications: VerificationCheck[];
}) {
  const verified = verifications.filter((check) => check.status === "Verified");
  const inProgress = verifications.filter(
    (check) => check.status !== "Verified"
  );
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sage-deep">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-bold">Trust signals</h2>
      </div>
      <p className="mb-4 text-sm text-bark/70">
        Independently verified credentials. Farmers can rely on these before
        making contact.
      </p>
      <ul className="space-y-2">
        {verified.map((check) => (
          <li
            key={check.label}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-match/25 bg-sage-mist/35 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-bark">{check.label}</p>
              {check.detail && (
                <p className="mt-0.5 text-xs text-bark/65">{check.detail}</p>
              )}
            </div>
            <StatusBadge tone="success">
              <CheckCircle className="h-3.5 w-3.5" aria-hidden />
              Verified
            </StatusBadge>
          </li>
        ))}
      </ul>
      {inProgress.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-bark/60">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {inProgress.length} additional credential
          {inProgress.length === 1 ? "" : "s"} in progress.
        </p>
      )}
    </Card>
  );
}

function PublicEnquiryCard({
  farmer,
  flash,
}: {
  farmer: Farmer;
  flash: (
    message: string,
    tone?: "info" | "success" | "warning"
  ) => void;
}) {
  const fleetSize = farmer.transport?.fleetSize ?? 1;
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sage-deep">
        <MessageSquare className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-bold">Make contact</h2>
      </div>
      <p className="text-sm text-bark/75">
        Send {farmer.name.split(" ")[0]} a backload enquiry or request an
        indicative quote. Responses usually land same day.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-warm-white px-4 py-2.5">
          <dt className="font-semibold text-bark/65">Base region</dt>
          <dd className="font-bold text-bark">{farmer.region}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-warm-white px-4 py-2.5">
          <dt className="font-semibold text-bark/65">Fleet</dt>
          <dd className="font-bold text-bark">
            {fleetSize > 1 ? `${fleetSize} trucks` : "Single B-double"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-warm-white px-4 py-2.5">
          <dt className="font-semibold text-bark/65">Mobile verified</dt>
          <dd className="font-bold text-bark">
            {farmer.mobileVerified ? "Yes" : "Pending"}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => flash("Enquiry sent. The driver will respond shortly.", "success")}
        className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <MessageSquare className="h-4 w-4" aria-hidden />
        Send enquiry
      </button>
      <p className="mt-3 text-xs text-bark/55">
        Preview only - no message is sent in the prototype.
      </p>
    </Card>
  );
}

function readPersonaCookie(): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("paddockme_persona="));
  return entry ? decodeURIComponent(entry.split("=")[1] ?? "") : null;
}

function writePersonaCookie(personaId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `paddockme_persona=${encodeURIComponent(personaId)}; path=/; max-age=31536000; SameSite=Lax`;
}

function resetPrototypeState(flash: (message: string, tone?: "info" | "success" | "warning") => void) {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("paddockme.")) toRemove.push(key);
    }
    toRemove.forEach((key) => window.localStorage.removeItem(key));
    flash(`Cleared ${toRemove.length} stored value${toRemove.length === 1 ? "" : "s"}. Reloading...`, "info");
    setTimeout(() => {
      window.location.href = "/agreements";
    }, 600);
  } catch {
    flash("Couldn't access local storage.", "warning");
  }
}

function SupabaseProfileSummary({ profile }: { profile: CurrentUserProfile }) {
  const accountTypes = formatList(profile.accountTypes);
  const regions = formatList(profile.regions);
  const stockTypes = formatList(profile.stockTypes);

  return (
    <Card className="mb-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
              <Database className="h-3.5 w-3.5" aria-hidden />
              Supabase profile
            </span>
            <StatusBadge tone="success">Signed in</StatusBadge>
          </div>
          <h2 className="text-2xl font-bold text-sage-deep">
            {profile.fullName ?? "Profile name pending"}
          </h2>
          {profile.email && (
            <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-semibold text-bark/70">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{profile.email}</span>
            </p>
          )}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bark/75">
            This is the live signed-in user record from Supabase. The
            participant profiles below show the agreement parties involved in
            the current workflow.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:min-w-[28rem]">
          <InfoTile label="Account types" value={accountTypes} />
          <InfoTile label="Regions" value={regions} />
          <InfoTile label="Stock types" value={stockTypes} />
        </div>
      </div>
    </Card>
  );
}

function formatList(values: string[]) {
  return values.length ? values.join(", ") : "Not set";
}

function LivestockCard({ livestock }: { livestock: LivestockSubProfile }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sage-deep">
        <Sprout className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-bold">Livestock profile</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile
          label="Stock types"
          value={livestock.stockTypes.join(", ")}
        />
        <InfoTile label="Current head" value={`${livestock.headCount}`} />
        <InfoTile label="PIC of origin" value={livestock.pic} />
        <InfoTile
          label="NLIS registered"
          value={livestock.nlisRegistered ? "Yes" : "No"}
        />
        <InfoTile
          label="Vaccinations current"
          value={livestock.vaccinationCurrent ? "Yes" : "Needs update"}
        />
        {livestock.treatmentNotes && (
          <InfoTile label="Treatment notes" value={livestock.treatmentNotes} />
        )}
      </div>
    </Card>
  );
}

function PropertyCard({ property }: { property: PropertySubProfile }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sage-deep">
        <Tractor className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-bold">Property profile</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile label="Property" value={property.propertyName} />
        <InfoTile label="Acres" value={`${property.acres}`} />
        <InfoTile
          label="Suitable stock"
          value={property.suitableStock.join(", ")}
        />
        <InfoTile label="Feed" value={property.feedStatus} />
        <InfoTile label="Water" value={property.waterStatus} />
        <InfoTile label="Fencing" value={property.fencingStatus} />
        <InfoTile
          label="Biosecurity"
          value={
            property.biosecurityRegistered
              ? "Registered"
              : "Not yet registered"
          }
        />
        <InfoTile label="Yards and access" value={property.yards} />
      </div>
    </Card>
  );
}

function TransportCard({
  transport,
  publicView = false,
}: {
  transport: TransportSubProfile;
  publicView?: boolean;
}) {
  const isMultiTruck = transport.fleetSize > 1;
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sage-deep">
          <Truck className="h-5 w-5" aria-hidden />
          <h2 className="text-xl font-bold">
            {publicView
              ? isMultiTruck
                ? "Fleet capability"
                : "Operator capability"
              : isMultiTruck
                ? "Fleet profile"
                : "Operator profile"}
          </h2>
        </div>
        <StatusBadge tone="info">
          {isMultiTruck
            ? `${transport.fleetSize} trucks`
            : "Single-truck operator"}
        </StatusBadge>
      </div>
      {publicView ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="Fleet size" value={`${transport.fleetSize}`} />
          <InfoTile label="Drivers" value={`${transport.driverCount}`} />
          {transport.accreditations.lbca === "Verified" && (
            <InfoTile label="LBCA accredited" value="Yes" />
          )}
          {transport.accreditations.truckSafe === "Verified" && (
            <InfoTile label="TruckSafe" value="Yes" />
          )}
          {transport.accreditations.nhvas === "Verified" && (
            <InfoTile label="NHVAS mass management" value="Current" />
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="ABN" value={transport.abn} />
          <InfoTile label="Fleet size" value={`${transport.fleetSize}`} />
          <InfoTile label="Drivers" value={`${transport.driverCount}`} />
          <InfoTile
            label="Sub-contractors"
            value={transport.subContractorsAllowed ? "Allowed" : "No"}
          />
          <InfoTile label="LBCA" value={transport.accreditations.lbca} />
          <InfoTile
            label="TruckSafe"
            value={transport.accreditations.truckSafe}
          />
          <InfoTile
            label="NHVAS mass management"
            value={transport.accreditations.nhvas}
          />
        </div>
      )}

      <section className="mt-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          {publicView ? "Fleet on the road" : "Vehicles in profile"}
        </h3>
        <ul className="space-y-2">
          {transport.vehicles.map((vehicle) => (
            <li
              key={vehicle.rego}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-mist bg-warm-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-bark">{vehicle.config}</p>
                {!publicView && (
                  <p className="mt-0.5 text-xs text-bark/65">
                    Driver: {vehicle.driver}
                  </p>
                )}
              </div>
              {!publicView && (
                <span className="rounded-full bg-sage-mist px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-sage-deep">
                  {vehicle.rego}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
}

function VerificationGrid({
  verifications,
}: {
  verifications: VerificationCheck[];
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sage-deep">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-bold">Verifications</h2>
      </div>
      <ul className="space-y-2">
        {verifications.map((check) => {
          const Icon = verificationIcon[check.status];
          const tone = verificationTone[check.status];
          return (
            <li
              key={check.label}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist bg-warm-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-bark">{check.label}</p>
                {check.detail && (
                  <p className="mt-0.5 text-xs text-bark/65">{check.detail}</p>
                )}
              </div>
              <StatusBadge tone={tone}>
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {check.status}
              </StatusBadge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ReadinessCard({
  items,
  roleLabel,
}: {
  items: Farmer["readiness"];
  roleLabel: string;
}) {
  const completed = items.filter((item) => item.complete).length;
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-sage-deep">{roleLabel}</h2>
        <span className="rounded-full bg-warm-white px-2.5 py-0.5 text-xs font-bold text-stone">
          {completed} / {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const Icon = item.complete ? CheckCircle : CircleDot;
          return (
            <li
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-mist bg-warm-white px-4 py-3"
            >
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  item.complete ? "text-match" : "text-stone"
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="font-semibold text-bark">{item.label}</p>
                {item.helper && (
                  <p className="mt-0.5 text-xs text-bark/65">{item.helper}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
