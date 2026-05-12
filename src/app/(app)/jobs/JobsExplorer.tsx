"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, MapPin, Truck } from "lucide-react";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { JobCard } from "@/components/JobCard";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import {
  getDrivers,
  getOpenTransportJobs,
  getTrucksForDriver,
  TRUCK_CLASS_LABEL,
  type TransportSize,
} from "@/lib/dummyData";
import { findJobsForDriver } from "@/lib/domain/driver-matching";

const SIZE_FILTERS: Array<{ label: string; value: TransportSize | "all" }> = [
  { label: "All", value: "all" },
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

export function JobsExplorer() {
  const drivers = getDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState(
    drivers.find((driver) => driver.id === "driver-2")?.id ?? drivers[0]?.id ?? ""
  );
  const [sizeFilter, setSizeFilter] = useState<TransportSize | "all">("all");

  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId) ?? drivers[0];
  const driverTrucks = selectedDriver ? getTrucksForDriver(selectedDriver.id) : [];
  const openJobs = getOpenTransportJobs();

  const matches = useMemo(() => {
    return findJobsForDriver(selectedDriver?.id ?? "").filter((match) =>
      sizeFilter === "all" ? true : match.job.size === sizeFilter
    );
  }, [selectedDriver?.id, sizeFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Transport jobs"
        title="Find stock movements that fit the truck."
        description="A lightweight driver board for available transport work. It uses dummy capacity and region data for now."
      />

      <div className="space-y-5">
        <Card className="bg-warm-white">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
                View as driver
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {drivers.map((driver) => (
                  <SelectablePill
                    key={driver.id}
                    selected={driver.id === selectedDriver?.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                  >
                    {driver.name}
                  </SelectablePill>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
                Job size
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SIZE_FILTERS.map((filter) => (
                  <SelectablePill
                    key={filter.value}
                    selected={filter.value === sizeFilter}
                    onClick={() => setSizeFilter(filter.value)}
                  >
                    {filter.label}
                  </SelectablePill>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile
              icon={<Truck className="h-4 w-4" />}
              iconPlacement="inline"
              label="Truck profile"
              value={`${driverTrucks.length} active ${driverTrucks.length === 1 ? "truck" : "trucks"}`}
            />
            <InfoTile
              icon={<MapPin className="h-4 w-4" />}
              iconPlacement="inline"
              label="Base region"
              value={selectedDriver?.region ?? "Not set"}
            />
            <InfoTile
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              iconPlacement="inline"
              label="Open jobs"
              value={`${openJobs.length} available`}
            />
          </div>

          {driverTrucks.length > 0 && (
            <div className="mt-5 rounded-2xl border border-mist bg-cream p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
                Available gear
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {driverTrucks.map((truck) => (
                  <span
                    key={truck.id}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sage-glow bg-sage-mist px-3 py-2 text-sm font-semibold text-sage-deep"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {TRUCK_CLASS_LABEL[truck.class]} - {truck.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {matches.map((match) => (
            <JobCard key={match.job.id} match={match} />
          ))}
        </div>
      </div>
    </>
  );
}
