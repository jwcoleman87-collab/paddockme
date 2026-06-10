"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, MapPin, Truck, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { SelectablePill } from "@/components/SelectablePill";
import { offerPaddockForRequest } from "@/lib/data/repositories";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import type {
  Farmer,
  LivestockRequest,
  PaddockListing,
} from "@/lib/dummyData";

type Filters = {
  stockTypes: string[];
  regions: string[];
  transport: string[];
};

const empty: Filters = { stockTypes: [], regions: [], transport: [] };

type Props = {
  requests: LivestockRequest[];
  requestersById: Record<string, Farmer>;
  /** All published paddock listings; the client filters to the active
   * persona's so the "Offer a paddock" picker lists only what they own. */
  paddockListings: PaddockListing[];
  /** Supabase user id when signed in - used instead of the localStorage
   * persona so real landowners always see their own paddocks here. */
  currentUserId?: string;
};

/**
 * Landowner-side marketplace: browse open livestock requests.
 *
 * Mirror surface to /transport/jobs (drivers' RFT board) and
 * /listings (livestock owners browsing paddocks). Closes the third leg of
 * the marketplace symmetry so landowners can proactively offer paddocks
 * against open requests rather than waiting to be found.
 */
export function RequestsClient({
  requests,
  requestersById,
  paddockListings,
  currentUserId,
}: Props) {
  const router = useRouter();
  const flash = useFlash();
  const [filters, setFilters] = useState<Filters>(empty);
  const [activePersonaId, setActivePersonaId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    function read() {
      try {
        return (
          window.localStorage.getItem("paddockme.agreements.persona") ??
          window.localStorage.getItem("paddockme.profile.persona") ??
          undefined
        );
      } catch {
        return undefined;
      }
    }
    setActivePersonaId(read());
    function onChange() {
      setActivePersonaId(read());
    }
    window.addEventListener("paddockme:persona-change", onChange);
    return () =>
      window.removeEventListener("paddockme:persona-change", onChange);
  }, []);

  const ownerId = currentUserId ?? activePersonaId;
  const myPaddocks = useMemo(
    () =>
      ownerId
        ? paddockListings.filter((listing) => listing.ownerId === ownerId)
        : [],
    [paddockListings, ownerId]
  );

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

  async function offerPaddock(request: LivestockRequest, listingId: string) {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/sign-in?next=${encodeURIComponent("/requests")}`);
        return;
      }
    }
    const { agreement } = await offerPaddockForRequest(request.id, listingId);
    if (!agreement) {
      flash(
        "Couldn't open the agreement workspace. Refresh and try again.",
        "warning"
      );
      return;
    }
    const requester = requestersById[request.requesterId];
    flash(
      `Workspace opened with ${
        requester?.name.split(" ")[0] ?? "the livestock owner"
      }. Confirm the open sections to lock the deal in.`,
      "success"
    );
    router.push(`/workspace/${agreement.id}`);
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
              myPaddocks={myPaddocks}
              onOffer={(listingId) => offerPaddock(request, listingId)}
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
  myPaddocks,
  onOffer,
}: {
  request: LivestockRequest;
  requester?: Farmer;
  myPaddocks: PaddockListing[];
  onOffer: (listingId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
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
          Driver will need to be sourced - raise an RFT from the agreement workspace.
        </p>
      )}

      {pickerOpen && myPaddocks.length > 0 && (
        <div
          aria-label="Pick a paddock to offer"
          className="rounded-xl border border-sage-deep/15 bg-cream/55 p-3"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-bark/65">
            Pick a paddock to offer
          </p>
          <ul className="space-y-1.5">
            {myPaddocks.map((paddock) => (
              <li key={paddock.id}>
                <button
                  type="button"
                  onClick={() => onOffer(paddock.id)}
                  className="flex w-full min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg border border-mist bg-warm-white px-3 text-left text-sm transition hover:border-sage/40 hover:bg-sage-mist/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-sage-deep">
                      {paddock.title}
                    </span>
                    <span className="block truncate text-xs text-bark/65">
                      {paddock.location}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-sage-deep">
                    Offer →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mt-2 cursor-pointer text-xs font-bold text-bark/65 underline-offset-2 hover:text-sage-deep hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {myPaddocks.length > 0 ? (
          <Button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            className="min-h-10"
          >
            {pickerOpen ? "Hide paddocks" : "Offer a paddock"}
          </Button>
        ) : (
          <ButtonLink href="/listings/new" className="min-h-10">
            List a paddock to offer
          </ButtonLink>
        )}
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
