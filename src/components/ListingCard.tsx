"use client";

import { useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  Droplets,
  Fence,
  LandPlot,
  MapPin,
  Sprout,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { StateMiniMap } from "@/components/StateMiniMap";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { PaddockListing } from "@/lib/dummyData";

export function ListingCard({
  listing,
  matchScore,
  matchReasons = [],
  mapImageSrc,
}: {
  listing: PaddockListing;
  matchScore?: number;
  matchReasons?: string[];
  mapImageSrc?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="flex h-full flex-col gap-3 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8.25rem] sm:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge
              tone={
                listing.verificationStatus === "Verified provider"
                  ? "success"
                  : "warning"
              }
            >
              {listing.verificationStatus}
            </StatusBadge>
            <span className="rounded-md border border-stone/25 bg-warm-white px-3 py-1 text-xs font-bold text-bark/85">
              {listing.guideTerms}
            </span>
          </div>
          <h2 className="text-lg font-bold leading-tight text-sage-deep">{listing.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-bark/85">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {listing.location}
          </p>
        </div>

        {mapImageSrc ? (
          <LocationMapImage
            src={mapImageSrc}
            label={`${listing.mapPlaceLabel} map`}
            placeLabel={listing.mapPlaceLabel}
          />
        ) : (
          <StateMiniMap
            state={listing.state}
            regionLabel={listing.regionLabel}
            placeLabel={listing.mapPlaceLabel}
            dotPosition={listing.mapDot}
            nearbyPlaces={listing.mapNearbyPlaces}
            className="order-first h-24 sm:order-none sm:h-28"
          />
        )}
      </div>

      {typeof matchScore === "number" && (
        <FitInline score={matchScore} reasons={matchReasons} />
      )}

      <p className="text-sm font-medium leading-snug text-bark/90">{listing.summary}</p>

      <div className="flex flex-wrap gap-1.5" aria-label="Suitable livestock">
        {listing.suitableLivestock.map((stockType) => (
          <span
            key={stockType}
            className="rounded-sm bg-sage-mist px-2 py-1 text-xs font-bold text-sage-deep"
          >
            {stockType}
          </span>
        ))}
      </div>

      <PaddockSignalStrip listing={listing} />

      {expanded && <ExpandedDetails listing={listing} />}

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-sage-deep/20 bg-warm-white px-3 py-1.5 text-sm font-bold text-sage-deep transition hover:border-sage/60 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          {expanded ? "Show less" : "Quick look"}
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 shrink-0 transition",
              expanded && "rotate-180"
            )}
          />
        </button>
        <ButtonLink href={`/listings/${listing.id}?request=request-100-cattle`}>
          View details
        </ButtonLink>
      </div>
    </Card>
  );
}

function ExpandedDetails({ listing }: { listing: PaddockListing }) {
  return (
    <section
      aria-label="Listing quick look"
      className="space-y-3 rounded-md border border-sage-deep/10 bg-cream/55 p-3"
    >
      <div className="flex items-start gap-2">
        <CalendarRange
          className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-stone">
            Available
          </p>
          <p className="text-sm font-semibold text-bark">
            {listing.availabilityWindow}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <InlineDetail label="Region" value={listing.regionLabel} />
        <InlineDetail label="State" value={listing.state} />
        <InlineDetail label="Guide rate" value={listing.guideTerms} />
        <InlineDetail label="Area" value={`${listing.acres} acres`} />
      </div>
    </section>
  );
}

function InlineDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-mist bg-warm-white px-3 py-2">
      <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-stone">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-bark">{value}</p>
    </div>
  );
}

function FitInline({
  score,
  reasons,
}: {
  score: number;
  reasons: string[];
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-y border-mist/80 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-bark/75">
          Fit
        </span>
        <div className="flex min-w-0 flex-wrap gap-1">
          {reasons.slice(0, 3).map((reason) => (
            <span
              key={reason}
              className="rounded-sm bg-cream px-2 py-1 text-xs font-bold text-bark/85"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
      <span className="shrink-0 text-lg font-extrabold text-sage-deep">
        {score}%
      </span>
    </div>
  );
}

function LocationMapImage({
  src,
  label,
  placeLabel,
}: {
  src: string;
  label: string;
  placeLabel: string;
}) {
  return (
    <div className="relative order-first h-24 overflow-hidden rounded-md border border-stone/35 bg-warm-white sm:order-none sm:h-28">
      <img
        src={src}
        alt={label}
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded-sm bg-cream/95 px-2 py-0.5 text-[0.68rem] font-bold leading-4 text-sage-deep shadow-sm">
        {placeLabel}
      </span>
    </div>
  );
}

function PaddockSignalStrip({ listing }: { listing: PaddockListing }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SignalTile
        icon={<Sprout className="h-4 w-4" />}
        label="Feed"
        value={listing.feedStatus}
        strength={signalStrength(listing.feedStatus, {
          Excellent: 3,
          Good: 2,
          Tight: 1,
        })}
      />
      <SignalTile
        icon={<Droplets className="h-4 w-4" />}
        label="Water"
        value={listing.waterStatus}
        strength={signalStrength(listing.waterStatus, {
          Permanent: 3,
          Tank: 2,
          Seasonal: 1,
        })}
      />
      <SignalTile
        icon={<Fence className="h-4 w-4" />}
        label="Fence"
        value={listing.fencingStatus}
        strength={signalStrength(listing.fencingStatus, {
          Secure: 3,
          Good: 2,
          "Needs inspection": 1,
        })}
      />
      <SignalTile
        icon={<LandPlot className="h-4 w-4" />}
        label="Area"
        value={`${listing.acres} ac`}
        strength={listing.acres >= 280 ? 3 : listing.acres >= 160 ? 2 : 1}
      />
    </div>
  );
}

function SignalTile({
  icon,
  label,
  value,
  strength,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  strength: 1 | 2 | 3;
}) {
  const filled =
    strength === 3
      ? "bg-rating-high"
      : strength === 2
        ? "bg-rating-mid"
        : "bg-rating-low";
  const strengthLabel =
    strength === 3 ? "high" : strength === 2 ? "moderate" : "low";
  return (
    <div className="flex min-h-[5.35rem] flex-col justify-between rounded-md border border-mist bg-warm-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-bark/75">
          {label}
        </span>
        <span className="text-sage-deep" aria-hidden>
          {icon}
        </span>
      </div>
      <div>
        <p className="truncate text-sm font-extrabold text-bark">{value}</p>
        <span
          className="mt-2 flex gap-1"
          aria-label={`${label} ${strengthLabel} (${strength} of 3)`}
        >
          {[1, 2, 3].map((level) => (
            <span
              key={level}
              className={
                level <= strength
                  ? `h-1.5 flex-1 rounded-sm ${filled}`
                  : "h-1.5 flex-1 rounded-sm bg-mist"
              }
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function signalStrength<T extends string>(
  value: T,
  lookup: Record<T, 1 | 2 | 3>
): 1 | 2 | 3 {
  return lookup[value] ?? 1;
}
