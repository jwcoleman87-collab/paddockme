"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { DemoResetAction } from "@/components/DemoResetAction";
import { InfoTile } from "@/components/InfoTile";
import { ListingCard } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  LivestockRequest,
  PaddockListing,
} from "@/lib/dummyData";
import { getListingMapImageSrc } from "@/lib/listingMapImages";
import {
  listLivestockRequests,
  listPaddockListings,
} from "@/lib/data/repositories";

type MatchSignal = {
  label: string;
  matched: boolean;
  points: number;
  matchedDetail: string;
  missingDetail: string;
  shortMissingDetail: string;
  compromise: string;
};

type ScoredListing = {
  listing: PaddockListing;
  score: number;
  signals: MatchSignal[];
  capacityWarning?: string;
  capacityPenalty: number;
};

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("request");
  const [requests, setRequests] = useState<LivestockRequest[]>([]);
  const [listings, setListings] = useState<PaddockListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void Promise.all([listLivestockRequests(), listPaddockListings()])
      .then(([nextRequests, nextListings]) => {
        if (!mounted) return;
        setRequests(nextRequests);
        setListings(nextListings);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const request = useMemo(
    () => requests.find((item) => item.id === requestId) ?? null,
    [requestId, requests]
  );

  const scored = useMemo(
    () =>
      request
        ? listings
            .map((listing) => scoreListing(listing, request))
            .sort((a, b) => b.score - a.score)
        : [],
    [listings, request]
  );

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="animate-pulse space-y-4 motion-reduce:animate-none">
        <span className="sr-only">Loading matches</span>
        <div className="h-8 w-2/3 rounded-[8px] bg-sage-mist" aria-hidden />
        <div className="h-4 w-1/2 rounded-[8px] bg-sage-mist/70" aria-hidden />
        <div className="h-44 rounded-[8px] bg-sage-mist/55" aria-hidden />
      </div>
    );
  }

  if (!request) {
    return (
      <PageHeader
        eyebrow="Matches"
        title="No active request yet."
        description="Post a request first - matches surface here once we have something to match against."
        action={<ButtonLink href="/request/new">Post a request</ButtonLink>}
      />
    );
  }

  const topMatch = scored[0];
  const listingsHref = buildListingsHref(request);

  return (
    <>
      <PageHeader
        eyebrow="Matches"
        title="Paddocks scored against your request."
        description="Each card shows which signals match your request so the best-fit paddocks rise to the top."
        action={
          <ButtonLink href="/request/new" variant="secondary">
            Edit request
          </ButtonLink>
        }
      />

      <RequestSummary request={request} />

      {scored.length === 0 ? (
        <Card className="mx-auto mt-5 max-w-2xl px-5 py-8 text-center">
          <h2 className="text-lg font-bold text-sage-deep">
            No paddocks to match yet.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-bark/70">
            Your request is saved. New paddocks will appear here as landowners
            publish them.
          </p>
          <ButtonLink href={listingsHref} variant="secondary" className="mt-4">
            Browse all paddocks
          </ButtonLink>
        </Card>
      ) : (
        <div className="mt-5 grid gap-5">
          {scored.map((entry, index) => (
            <ScoredCard
              key={entry.listing.id}
              entry={entry}
              requestId={request.id}
              badge={badgeForRank(index, entry.score, topMatch?.score)}
            />
          ))}
        </div>
      )}

      <div className="relative z-30 mt-6 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href={listingsHref} variant="ghost">
          Browse all paddocks
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
        <DemoResetAction />
      </div>
    </>
  );
}

function buildListingsHref(request: LivestockRequest): string {
  const params = new URLSearchParams();
  params.set("request", request.id);
  params.set("stock", request.stockType);
  if (request.preferredRegions.length > 0) {
    params.set("regions", request.preferredRegions.join(","));
  }
  return `/listings?${params.toString()}`;
}

function RequestSummary({ request }: { request: LivestockRequest }) {
  return (
    <Card className="bg-sage-deep text-cream">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Active request
            </span>
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">
            {request.headCount} {request.breed} {request.stockType}
          </h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-sage-glow">
            Preferred regions: {request.preferredRegions.join(", ")}. Duration:{" "}
            {request.duration}. Transport: {request.transportRequired}.
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:w-[22rem]">
          <InfoTile
            tone="subtle"
            label="Stock type"
            value={request.stockType}
            className="bg-warm-white/95"
          />
          <InfoTile
            tone="subtle"
            label="Head count"
            value={`${request.headCount}`}
            className="bg-warm-white/95"
          />
        </div>
      </div>
    </Card>
  );
}

function ScoredCard({
  entry,
  requestId,
  badge,
}: {
  entry: ScoredListing;
  requestId: string;
  badge: { tone: "success" | "warning" | "neutral"; label: string };
}) {
  const shortMissing = shortMissingSummary(entry);

  return (
    <article className="relative">
      <div className="absolute right-4 top-4 z-10 flex max-w-[min(20rem,calc(100%-2rem))] flex-col items-end gap-1 text-right">
        <StatusBadge tone={badge.tone}>
          Score {entry.score} / 100 &middot; {badge.label}
        </StatusBadge>
        {shortMissing && (
          <span className="rounded-md border border-amber-700/25 bg-amber-50 px-2 py-1 text-[0.72rem] font-bold leading-tight text-amber-950 shadow-sm">
            Why not 100: {shortMissing}
          </span>
        )}
      </div>
      <ListingCard
        listing={entry.listing}
        mapImageSrc={getListingMapImageSrc(entry.listing.id)}
        requestId={requestId}
      />
      <ScoreBreakdown entry={entry} />
      {entry.capacityWarning && (
        <Card className="mt-3 border-amber-700/30 bg-amber-50">
          <div className="flex items-start gap-2 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div>
              <h3 className="text-sm font-bold">Capacity needs checking</h3>
              <p className="mt-1 text-sm leading-relaxed">
                {entry.capacityWarning}
              </p>
            </div>
          </div>
        </Card>
      )}
      <Card className="relative z-20 mt-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Full signal checklist
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {entry.signals.map((signal) => (
            <li
              key={signal.label}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                signal.matched
                  ? "border-match/25 bg-match-light/55 text-bark"
                  : "border-mist bg-warm-white text-bark/55"
              )}
            >
              {signal.matched ? (
                <Check className="h-4 w-4 text-match" aria-hidden />
              ) : (
                <Minus className="h-4 w-4 text-stone" aria-hidden />
              )}
              <span className="font-semibold">{signal.label}</span>
            </li>
          ))}
        </ul>
        <ButtonLink
          href={`/listings/${entry.listing.id}?request=${encodeURIComponent(requestId)}`}
          variant="secondary"
          className="mt-4"
        >
          Open paddock detail
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>
    </article>
  );
}

function ScoreBreakdown({ entry }: { entry: ScoredListing }) {
  const matchedSignals = entry.signals.filter((signal) => signal.matched);
  const missingSignals = entry.signals.filter((signal) => !signal.matched);
  const missingPoints = 100 - entry.score;

  return (
    <Card className="relative z-20 mt-3 border-sage-deep/15 bg-cream">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-stone">
            Score breakdown
          </p>
          <h3 className="mt-1 text-xl font-bold text-sage-deep">
            {entry.score} points matched. {missingPoints} points to check.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-bark/75">
            A lower score is not an automatic no. It shows the parts that need
            a phone call, inspection, or agreed compromise before this paddock
            is treated as a safe fit.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchedSignals.slice(0, 4).map((signal) => (
              <span
                key={signal.label}
                className="inline-flex items-center gap-1 rounded-sm bg-match-light px-2 py-1 text-xs font-bold text-match"
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                +{signal.points} {signal.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-amber-700/20 bg-amber-50 p-3">
          <p className="text-sm font-bold text-amber-950">
            Why it is not 100%
          </p>
          <ul className="mt-2 grid gap-2">
            {missingSignals.map((signal) => (
              <li
                key={signal.label}
                className="rounded-md border border-amber-700/15 bg-warm-white px-3 py-2"
              >
                <div className="flex items-start gap-2">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-bark">
                      -{signal.points} {signal.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-bark/75">
                      {signal.missingDetail}
                    </p>
                    <p className="mt-1 text-xs font-bold text-amber-950">
                      Compromise: {signal.compromise}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            {entry.capacityPenalty > 0 && entry.capacityWarning && (
              <li className="rounded-md border border-amber-700/15 bg-warm-white px-3 py-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-bark">
                      -{entry.capacityPenalty} Capacity risk
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-bark/75">
                      The requested head count may be too high for the rough
                      acreage estimate.
                    </p>
                    <p className="mt-1 text-xs font-bold text-amber-950">
                      Compromise: reduce numbers, shorten the stay, or agree a
                      feed and rotation plan.
                    </p>
                  </div>
                </div>
              </li>
            )}
            {missingSignals.length === 0 && entry.capacityPenalty === 0 && (
              <li className="rounded-md border border-match/20 bg-match-light/60 px-3 py-2 text-sm font-bold text-match">
                No major gaps found in the scoring signals.
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function scoreListing(
  listing: PaddockListing,
  request: LivestockRequest
): ScoredListing {
  const stockMatch = listing.suitableLivestock.includes(request.stockType);
  const regionMatch = request.preferredRegions.includes(listing.regionLabel);
  const distanceKm =
    request.originLocation && listing.coordinates
      ? distanceInKm(request.originLocation, listing.coordinates)
      : null;
  const locationMatch = distanceKm !== null ? distanceKm <= 300 : regionMatch;
  const locationPoints =
    distanceKm === null
      ? 25
      : distanceKm <= 150
        ? 25
        : distanceKm <= 300
          ? 18
          : 0;
  const verified = listing.verificationStatus === "Verified provider";
  const goodFeed =
    listing.feedStatus === "Excellent" || listing.feedStatus === "Good";
  const permanentWater = listing.waterStatus === "Permanent";
  const secureFencing = listing.fencingStatus === "Secure";
  const capacityWarning = getCapacityWarning(listing, request);

  const signals: MatchSignal[] = [
    {
      label: `${request.stockType} suitable`,
      matched: stockMatch,
      points: 30,
      matchedDetail: `Listed as suitable for ${request.stockType.toLowerCase()}.`,
      missingDetail: `This paddock is not currently listed as suitable for ${request.stockType.toLowerCase()}.`,
      shortMissingDetail: `${request.stockType.toLowerCase()} suitability not confirmed`,
      compromise: `ask the landowner to confirm ${request.stockType.toLowerCase()}-safe fencing, yards, pasture and water before moving stock.`,
    },
    {
      label:
        distanceKm !== null
          ? `${Math.round(distanceKm)} km from pickup`
          : `Region: ${listing.regionLabel}`,
      matched: locationMatch,
      points: locationPoints || 25,
      matchedDetail:
        distanceKm !== null
          ? "Inside a practical transport radius for this request."
          : "Inside the preferred region list.",
      missingDetail:
        distanceKm !== null
          ? `${listing.title} is about ${Math.round(distanceKm)} km from the pickup location.`
          : `${listing.regionLabel} is outside the preferred regions on this request.`,
      shortMissingDetail:
        distanceKm !== null ? "longer transport distance" : "outside preferred region",
      compromise:
        "accept the extra transport time or edit the request regions if this location still works.",
    },
    {
      label: "Verified provider",
      matched: verified,
      points: 15,
      matchedDetail: "Provider has been verified.",
      missingDetail: "Provider verification is not complete yet.",
      shortMissingDetail: "provider not verified",
      compromise: "request inspection notes, references, photos and clear payment terms before agreeing.",
    },
    {
      label: "Good or excellent feed",
      matched: goodFeed,
      points: 10,
      matchedDetail: `Feed is marked ${listing.feedStatus.toLowerCase()}.`,
      missingDetail: `Feed is marked ${listing.feedStatus.toLowerCase()}, not good or excellent.`,
      shortMissingDetail: "feed not strong enough",
      compromise: "budget for supplementary feed or agree a shorter stay.",
    },
    {
      label: "Permanent water",
      matched: permanentWater,
      points: 10,
      matchedDetail: "Permanent water is listed.",
      missingDetail: `Water is listed as ${listing.waterStatus.toLowerCase()}, not permanent.`,
      shortMissingDetail: "water not permanent",
      compromise: "confirm trough capacity, backup supply and who pays if water needs carting.",
    },
    {
      label: "Secure fencing",
      matched: secureFencing,
      points: 10,
      matchedDetail: "Fencing is marked secure.",
      missingDetail: `Fencing is marked ${listing.fencingStatus.toLowerCase()}, not secure.`,
      shortMissingDetail: "fencing not marked secure",
      compromise: "only proceed if upgrades or inspection confirm it is safe for this stock.",
    },
  ];

  const rawScore =
    signals.reduce((total, signal) => total + (signal.matched ? signal.points : 0), 0);
  const adjustedScore = capacityWarning ? Math.min(rawScore - 20, 80) : rawScore;
  const score = Math.max(adjustedScore, 0);
  const capacityPenalty = capacityWarning ? rawScore - score : 0;

  return { listing, score, signals, capacityWarning, capacityPenalty };
}

function distanceInKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function shortMissingSummary(entry: ScoredListing) {
  if (entry.score >= 100) return null;
  const missingSignal = entry.signals.find((signal) => !signal.matched);
  if (missingSignal) {
    return `${missingSignal.shortMissingDetail} (-${missingSignal.points})`;
  }
  if (entry.capacityPenalty > 0) {
    return `capacity risk (-${entry.capacityPenalty})`;
  }
  return `${100 - entry.score} points need checking`;
}

function getCapacityWarning(
  listing: PaddockListing,
  request: LivestockRequest
): string | undefined {
  const maxHead = Math.floor(
    listing.acres * headPerAcreFor(request.stockType)
  );
  if (request.headCount <= maxHead) return undefined;
  return `${listing.title} is rated well on quality, but ${request.headCount} ${request.stockType.toLowerCase()} would exceed the rough ${maxHead}-head capacity estimate for ${listing.acres} acres. Confirm stocking rate, feed plan and rotation with the landowner before relying on this match.`;
}

function headPerAcreFor(stockType: string): number {
  const normalised = stockType.toLowerCase();
  if (normalised.includes("cattle")) return 0.8;
  if (normalised.includes("sheep")) return 1;
  if (normalised.includes("horse")) return 0.5;
  if (normalised.includes("goat")) return 1.5;
  if (normalised.includes("alpaca")) return 1;
  if (normalised.includes("deer")) return 1;
  if (normalised.includes("pig")) return 0.8;
  return 1;
}

function badgeForRank(
  index: number,
  score: number,
  topScore: number | undefined
): { tone: "success" | "warning" | "neutral"; label: string } {
  if (topScore !== undefined && score === topScore && score >= 60) {
    return { tone: "success", label: "Top match" };
  }
  if (score >= 60) return { tone: "success", label: "Strong fit" };
  if (score >= 30) return { tone: "warning", label: "Partial fit" };
  return { tone: "neutral", label: "Weak fit" };
}
