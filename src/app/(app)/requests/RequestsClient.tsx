"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, MapPin, Truck, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { SelectablePill } from "@/components/SelectablePill";
import { cn } from "@/lib/utils";
import type { Farmer, LivestockRequest } from "@/lib/dummyData";

type Filters = {
  stockTypes: string[];
  regions: string[];
  transport: string[];
};

const empty: Filters = { stockTypes: [], regions: [], transport: [] };

type Props = {
  requests: LivestockRequest[];
  requestersById: Record<string, Farmer>;
};

/**
 * Landowner-side marketplace: browse open livestock requests.
 *
 * Mirror surface to /transport/available (drivers' capacity board) and
 * /listings (livestock owners browsing paddocks). Closes the third leg of
 * the marketplace symmetry so landowners can proactively offer paddocks
 * against open requests rather than waiting to be found.
 */
export function RequestsClient({ requests, requestersById }: Props) {
  const flash = useFlash();
  const [filters, setFilters] = useState<Filters>(empty);

  const stockOptions = useMemo(
    () => uniqueSorted(requests.map((r) => r.stockType)),
    [requests]
  );
  const regionOptions = useMemo(
    () => uniqueSorted(requests.flatMap((r) => r.preferredRegions)),
    [requests]
  );
  const transportOptions = ["Yes", "No", "Unsure"];

  const filtered = useMemo(
    () =>
      requests.filter((request) => {
        if (
          filters.stockTypes.length > 0 &&
          !filters.stockTypes.includes(request.stockType)
        )
          return false;
        if (
          filters.regions.length > 0 &&
          !filters.regions.some((r) => request.preferredRegions.includes(r))
        )
          return false;
        if (
          filters.transport.length > 0 &&
          !filters.transport.includes(request.transportRequired)
        )
          return false;
        return true;
      }),
    [requests, filters]
  );

  const activeFilterCount =
    filters.stockTypes.length + filters.regions.length + filters.transport.length;

  function toggle(group: keyof Filters, value: string) {
    setFilters((current) => {
      const list = current[group];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...current, [group]: next };
    });
  }

  function clearAll() {
    setFilters(empty);
  }

  function offerPaddock(request: LivestockRequest) {
    const requester = requestersById[request.requesterId];
    flash(
      `Inquiry sent to ${
        requester?.name.split(" ")[0] ?? "the livestock owner"
      }. Open the workspace once they reply.`,
      "success"
    );
  }

  return (
    <>
      <PersonaIntroBanner page="requests" />

      <section
        aria-label="Filter requests"
        className="mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Filter className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Narrow by
            </h2>
          </div>
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={clearAll}
              className="min-h-9 px-3 text-xs"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>

        <FilterRow
          label="Stock"
          options={stockOptions}
          selected={filters.stockTypes}
          onToggle={(v) => toggle("stockTypes", v)}
        />
        <FilterRow
          label="Region"
          options={regionOptions}
          selected={filters.regions}
          onToggle={(v) => toggle("regions", v)}
        />
        <FilterRow
          label="Transport"
          options={transportOptions}
          selected={filters.transport}
          onToggle={(v) => toggle("transport", v)}
        />
      </section>

      <p className="mb-3 text-sm font-medium text-bark/75">
        {filtered.length} of {requests.length} open requests
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              requester={requestersById[request.requesterId]}
              onOffer={() => offerPaddock(request)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <h3 className="text-lg font-bold text-sage-deep">
            No requests match.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/75">
            Clear filters to see every open request, or check back later as
            livestock owners post new ones.
          </p>
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={clearAll}
              className="mt-4"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear filters
            </Button>
          )}
        </Card>
      )}
    </>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-bark/65">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <SelectablePill
            key={option}
            selected={selected.includes(option)}
            onClick={() => onToggle(option)}
          >
            {option}
          </SelectablePill>
        ))}
      </div>
    </div>
  );
}

function RequestCard({
  request,
  requester,
  onOffer,
}: {
  request: LivestockRequest;
  requester?: Farmer;
  onOffer: () => void;
}) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-3">
        {requester && (
          <Avatar
            name={requester.name}
            src={requester.avatarUrl}
            size="md"
            className="shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
            {requester?.name ?? "Livestock owner"}
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-sage-deep">
            {request.headCount} {request.breed}
          </h3>
          <p className="text-sm text-bark/85">{request.stockType}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          tone="subtle"
          size="sm"
          label="Duration"
          value={request.duration}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          label="Transport"
          value={
            request.transportRequired === "Yes"
              ? "Needs transport"
              : request.transportRequired === "No"
                ? "Self-haul"
                : "Unsure"
          }
        />
      </div>

      <p
        className={cn(
          "rounded-xl border border-mist bg-warm-white px-3 py-2 text-sm leading-snug text-bark/85"
        )}
      >
        <MapPin className="-mt-0.5 mr-1 inline h-3.5 w-3.5 text-sage-deep" aria-hidden />
        Preferred regions: {request.preferredRegions.join(", ") || "Anywhere"}
      </p>

      {request.transportRequired === "Yes" && (
        <p className="flex items-start gap-1.5 text-xs font-semibold text-stone">
          <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
          Driver will need to be sourced - capacity board at /transport/available.
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <Button type="button" onClick={onOffer} className="min-h-10">
          Offer a paddock
        </Button>
        <ButtonLink href="/listings/new" variant="secondary" className="min-h-10">
          List a new paddock
        </ButtonLink>
      </div>
    </Card>
  );
}

function uniqueSorted<T>(values: T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}
