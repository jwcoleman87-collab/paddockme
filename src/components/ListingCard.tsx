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
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { StateMiniMap } from "@/components/StateMiniMap";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import {
  getPaddockTileDetails,
  type PaddockTileDetail,
} from "@/lib/paddockTileDetails";
import type { PaddockListing } from "@/lib/dummyData";

type SignalKey = "feed" | "water" | "fencing" | "area";

export function ListingCard({
  listing,
  matchScore,
  matchReasons = [],
  mapImageSrc,
  requestId,
}: {
  listing: PaddockListing;
  matchScore?: number;
  matchReasons?: string[];
  mapImageSrc?: string;
  requestId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openTile, setOpenTile] = useState<SignalKey | null>(null);
  const tileDetails = getPaddockTileDetails(listing);

  const tileLabels: Record<SignalKey, string> = {
    feed: "Feed",
    water: "Water",
    fencing: "Fence",
    area: "Area",
  };

  return (
    // self-start stops the grid stretching every card to the tallest row,
    // which left a big dead gap between the signal tiles and the buttons.
    <Card className="flex flex-col gap-4 self-start p-4 hover:border-sage/30 hover:shadow-[0_18px_44px_rgba(31,42,36,0.09)]">
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
            <span className="rounded-md border border-sage-deep/10 bg-field px-3 py-1 text-xs font-bold text-stone">
              {listing.guideTerms}
            </span>
          </div>
          <h2 className="text-lg font-extrabold leading-tight text-bark">{listing.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-stone">
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

      <p className="text-sm font-medium leading-relaxed text-stone">{listing.summary}</p>

      <div className="flex flex-wrap gap-1.5" aria-label="Suitable livestock">
        {listing.suitableLivestock.map((stockType) => (
          <span
            key={stockType}
            className="rounded-md border border-sage-deep/10 bg-sage-mist px-2 py-1 text-xs font-bold text-sage-deep"
          >
            {stockType}
          </span>
        ))}
      </div>

      <PaddockSignalStrip listing={listing} onOpenTile={setOpenTile} />

      {expanded && <ExpandedDetails listing={listing} />}

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-sage-deep/15 bg-field px-3 py-1.5 text-sm font-bold text-sage-deep transition hover:border-sage/45 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
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
        <ButtonLink href={listingDetailHref(listing.id, requestId)}>
          View details
        </ButtonLink>
      </div>

      {openTile && (
        <TileDetailDialog
          title={`${listing.title} - ${tileLabels[openTile]}`}
          detail={tileDetails[openTile]}
          onClose={() => setOpenTile(null)}
        />
      )}
    </Card>
  );
}

function listingDetailHref(listingId: string, requestId?: string): string {
  if (!requestId) return `/listings/${listingId}`;
  return `/listings/${listingId}?request=${encodeURIComponent(requestId)}`;
}

function ExpandedDetails({ listing }: { listing: PaddockListing }) {
  return (
    <section
      aria-label="Listing quick look"
      className="space-y-3 rounded-[8px] border border-sage-deep/10 bg-field p-3"
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
    <div className="rounded-[8px] border border-sage-deep/10 bg-warm-white px-3 py-2">
      <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-stone">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-bark">{value}</p>
    </div>
  );
}

function TileDetailDialog({
  title,
  detail,
  onClose,
}: {
  title: string;
  detail: PaddockTileDetail;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div className="relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]">
        <div className="flex items-start justify-between gap-3 border-b border-sage-deep/10 bg-cream/55 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              Paddock detail
            </p>
            <h2 className="mt-1 text-lg font-bold text-sage-deep">
              {detail.headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {detail.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-2.5 text-sm text-bark"
            >
              <span
                className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-sage-deep"
                aria-hidden
              />
              <span className="font-medium leading-snug">{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-sage-deep/10 bg-cream/40 px-5 py-3">
          <p className="text-xs text-bark/65">
            Prototype detail - real listings let the landowner write this section.
          </p>
        </div>
      </div>
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
    <div className="flex items-center justify-between gap-3 border-y border-sage-deep/10 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-bark/75">
          Fit
        </span>
        <div className="flex min-w-0 flex-wrap gap-1">
          {reasons.slice(0, 3).map((reason) => (
            <span
              key={reason}
              className="rounded-md bg-field px-2 py-1 text-xs font-bold text-bark/85"
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
    <div className="relative order-first h-24 overflow-hidden rounded-[8px] border border-sage-deep/10 bg-warm-white sm:order-none sm:h-28">
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

function PaddockSignalStrip({
  listing,
  onOpenTile,
}: {
  listing: PaddockListing;
  onOpenTile: (key: SignalKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <SignalTile
        signalKey="feed"
        icon={<Sprout className="h-4 w-4" />}
        label="Feed"
        value={listing.feedStatus}
        strength={signalStrength(listing.feedStatus, {
          Excellent: 3,
          Good: 2,
          Tight: 1,
        })}
        onClick={onOpenTile}
      />
      <SignalTile
        signalKey="water"
        icon={<Droplets className="h-4 w-4" />}
        label="Water"
        value={listing.waterStatus}
        strength={signalStrength(listing.waterStatus, {
          Permanent: 3,
          Tank: 2,
          Seasonal: 1,
        })}
        onClick={onOpenTile}
      />
      <SignalTile
        signalKey="fencing"
        icon={<Fence className="h-4 w-4" />}
        label="Fence"
        value={listing.fencingStatus}
        strength={signalStrength(listing.fencingStatus, {
          Secure: 3,
          Good: 2,
          "Needs inspection": 1,
        })}
        onClick={onOpenTile}
      />
      <SignalTile
        signalKey="area"
        icon={<LandPlot className="h-4 w-4" />}
        label="Area"
        value={`${listing.acres} ac`}
        strength={listing.acres >= 280 ? 3 : listing.acres >= 160 ? 2 : 1}
        onClick={onOpenTile}
      />
    </div>
  );
}

function SignalTile({
  signalKey,
  icon,
  label,
  value,
  strength,
  onClick,
}: {
  signalKey: SignalKey;
  icon: React.ReactNode;
  label: string;
  value: string;
  strength: 1 | 2 | 3;
  onClick: (key: SignalKey) => void;
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
    <button
      type="button"
      onClick={() => onClick(signalKey)}
      aria-label={`${label}: ${value}, ${strengthLabel}. Tap for detail.`}
      className="group flex min-h-[5.35rem] cursor-pointer flex-col justify-between rounded-[8px] border border-sage-deep/10 bg-field p-3 text-left transition hover:-translate-y-0.5 hover:border-sage/40 hover:bg-sage-mist/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
    >
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
        <span className="mt-2 flex gap-1" aria-hidden>
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
    </button>
  );
}

function signalStrength<T extends string>(
  value: T,
  lookup: Record<T, 1 | 2 | 3>
): 1 | 2 | 3 {
  return lookup[value] ?? 1;
}
