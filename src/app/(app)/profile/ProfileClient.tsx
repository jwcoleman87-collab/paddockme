"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  CircleDot,
  MapPin,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
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

export function ProfileClient({ farmers }: { farmers: Farmer[] }) {
  const [activeId, setActiveId] = useState<string>(farmers[0]?.id ?? "");
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("paddockme.profile.persona");
      if (stored && farmers.some((f) => f.id === stored)) {
        setActiveId(stored);
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, [farmers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem("paddockme.profile.persona", activeId);
    } catch {
      // ignore
    }
  }, [activeId]);

  const farmer = farmers.find((f) => f.id === activeId) ?? farmers[0];
  if (!farmer) return null;

  const RoleIcon = roleIcon[farmer.role];

  return (
    <>
      <section
        aria-label="Persona switcher"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <UserRound className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Browse personas
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Prototype
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose a persona"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {farmers.map((option) => {
            const active = option.id === activeId;
            const Icon = roleIcon[option.role];
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setActiveId(option.id)}
                className={cn(
                  "flex min-h-16 items-start gap-3 rounded-xl border px-3 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    active ? "text-sage-glow" : "text-sage-deep"
                  )}
                  aria-hidden
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

      <Card className="mb-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
            </div>
            <h2 className="text-2xl font-bold text-sage-deep">{farmer.name}</h2>
            <p className="mt-1 text-sm font-semibold text-bark/70">
              {farmer.tagline}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bark/75">
              {farmer.bio}
            </p>
          </div>
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
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          {farmer.livestock && <LivestockCard livestock={farmer.livestock} />}
          {farmer.property && <PropertyCard property={farmer.property} />}
          {farmer.transport && <TransportCard transport={farmer.transport} />}
          <VerificationGrid verifications={farmer.verifications} />
        </div>

        <aside className="space-y-5">
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
        </aside>
      </div>
    </>
  );
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

function TransportCard({ transport }: { transport: TransportSubProfile }) {
  const isMultiTruck = transport.fleetSize > 1;
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sage-deep">
          <Truck className="h-5 w-5" aria-hidden />
          <h2 className="text-xl font-bold">
            {isMultiTruck ? "Fleet profile" : "Operator profile"}
          </h2>
        </div>
        <StatusBadge tone="info">
          {isMultiTruck
            ? `${transport.fleetSize} trucks`
            : "Single-truck operator"}
        </StatusBadge>
      </div>
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

      <section className="mt-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Vehicles in profile
        </h3>
        <ul className="space-y-2">
          {transport.vehicles.map((vehicle) => (
            <li
              key={vehicle.rego}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-mist bg-warm-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-bark">{vehicle.config}</p>
                <p className="mt-0.5 text-xs text-bark/65">
                  Driver: {vehicle.driver}
                </p>
              </div>
              <span className="rounded-full bg-sage-mist px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-sage-deep">
                {vehicle.rego}
              </span>
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
