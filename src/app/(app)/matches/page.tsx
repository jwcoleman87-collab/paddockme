import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { ListingCard } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import {
  livestockRequests,
  paddockListings,
  type LivestockRequest,
  type PaddockListing,
} from "@/lib/dummyData";

type MatchSignal = {
  label: string;
  matched: boolean;
};

type ScoredListing = {
  listing: PaddockListing;
  score: number;
  signals: MatchSignal[];
};

type SearchParams = {
  stock?: string;
  breed?: string;
  headCount?: string;
  duration?: string;
  regions?: string;
  transport?: string;
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const seed = livestockRequests[0];
  const request = mergeRequest(seed, params);

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

  const scored = paddockListings
    .map((listing) => scoreListing(listing, request))
    .sort((a, b) => b.score - a.score);

  const topMatch = scored[0];
  const listingsHref = buildListingsHref(request);

  return (
    <>
      <PageHeader
        eyebrow="Matches"
        title="Paddocks scored against your request."
        description="Each card shows which signals matched and which didn't. Higher score, closer fit - it's still chips, not algorithms."
        action={
          <ButtonLink href="/request/new" variant="secondary">
            Edit request
          </ButtonLink>
        }
      />

      <RequestSummary request={request} />

      <div className="mt-5 grid gap-5">
        {scored.map((entry, index) => (
          <ScoredCard
            key={entry.listing.id}
            entry={entry}
            badge={badgeForRank(index, entry.score, topMatch?.score)}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <ButtonLink href={listingsHref} variant="ghost">
          Browse all paddocks
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </div>
    </>
  );
}

function mergeRequest(
  seed: LivestockRequest | undefined,
  params: SearchParams
): LivestockRequest | null {
  if (!seed && !params.stock) return null;
  const regions = params.regions
    ? params.regions
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : undefined;
  const headCountParam = params.headCount
    ? Number.parseInt(params.headCount, 10)
    : undefined;
  const transport = parseTransport(params.transport);
  // When stock is overridden via URL, the seed's breed (e.g. Angus) no longer
  // applies. Use the explicit breed param if present; otherwise fall back to
  // "Mixed" when the stock changed; otherwise keep the seed breed.
  const stockChanged =
    !!params.stock && !!seed && params.stock !== seed.stockType;

  if (!seed) {
    return {
      id: "url-request",
      requesterId: "farmer-a",
      stockType: params.stock ?? "Cattle",
      breed: params.breed ?? "Mixed",
      headCount:
        headCountParam !== undefined && !Number.isNaN(headCountParam)
          ? headCountParam
          : 100,
      duration: params.duration ?? "3-6 months",
      preferredRegions: regions ?? [],
      transportRequired: transport ?? "Unsure",
    };
  }
  return {
    ...seed,
    stockType: params.stock ?? seed.stockType,
    breed: params.breed ?? (stockChanged ? "Mixed" : seed.breed),
    headCount:
      headCountParam !== undefined && !Number.isNaN(headCountParam)
        ? headCountParam
        : seed.headCount,
    duration: params.duration ?? seed.duration,
    preferredRegions: regions ?? seed.preferredRegions,
    transportRequired: transport ?? seed.transportRequired,
  };
}

function parseTransport(
  value: string | undefined
): LivestockRequest["transportRequired"] | undefined {
  if (value === "Yes" || value === "No" || value === "Unsure") return value;
  return undefined;
}

function buildListingsHref(request: LivestockRequest): string {
  const params = new URLSearchParams();
  params.set("stock", request.stockType);
  if (request.preferredRegions.length > 0) {
    params.set("regions", request.preferredRegions.join(","));
  }
  return `/listings?${params.toString()}`;
}

function RequestSummary({ request }: { request: LivestockRequest }) {
  return (
    <Card className="bg-sage-deep text-cream">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Active request
            </span>
          </div>
          <h2 className="text-2xl font-bold">
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
  badge,
}: {
  entry: ScoredListing;
  badge: { tone: "success" | "warning" | "neutral"; label: string };
}) {
  return (
    <article className="relative">
      <div className="absolute right-4 top-4 z-10">
        <StatusBadge tone={badge.tone}>
          Score {entry.score} / 100 &middot; {badge.label}
        </StatusBadge>
      </div>
      <ListingCard listing={entry.listing} />
      <Card className="mt-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone">
          Why this match
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
          href={`/listings/${entry.listing.id}`}
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

function scoreListing(
  listing: PaddockListing,
  request: LivestockRequest
): ScoredListing {
  const stockMatch = listing.suitableLivestock.includes(request.stockType);
  const regionMatch = request.preferredRegions.includes(listing.regionLabel);
  const verified = listing.verificationStatus === "Verified provider";
  const goodFeed =
    listing.feedStatus === "Excellent" || listing.feedStatus === "Good";
  const permanentWater = listing.waterStatus === "Permanent";
  const secureFencing = listing.fencingStatus === "Secure";

  const signals: MatchSignal[] = [
    { label: `${request.stockType} suitable`, matched: stockMatch },
    { label: `Region: ${listing.regionLabel}`, matched: regionMatch },
    { label: "Verified provider", matched: verified },
    { label: "Good or excellent feed", matched: goodFeed },
    { label: "Permanent water", matched: permanentWater },
    { label: "Secure fencing", matched: secureFencing },
  ];

  const score =
    (stockMatch ? 30 : 0) +
    (regionMatch ? 25 : 0) +
    (verified ? 15 : 0) +
    (goodFeed ? 10 : 0) +
    (permanentWater ? 10 : 0) +
    (secureFencing ? 10 : 0);

  return { listing, score, signals };
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
