import { Droplets, Fence, MapPin, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StateMiniMap } from "@/components/StateMiniMap";
import { StatusBadge } from "@/components/StatusBadge";
import type { PaddockListing } from "@/lib/dummyData";

export function ListingCard({ listing }: { listing: PaddockListing }) {
  return (
    <Card className="flex h-full flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8.75rem] sm:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge
              tone={
                listing.verificationStatus === "Verified provider"
                  ? "success"
                  : "warning"
              }
            >
              {listing.verificationStatus}
            </StatusBadge>
            <span className="rounded-full bg-warm-white px-3 py-1 text-xs font-semibold text-stone">
              {listing.guideTerms}
            </span>
          </div>
          <h2 className="text-xl font-bold text-sage-deep">{listing.title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-bark/65">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {listing.location}
          </p>
        </div>

        <StateMiniMap
          state={listing.state}
          regionLabel={listing.regionLabel}
          dotPosition={listing.mapDot}
          className="order-first h-28 sm:order-none sm:h-32"
        />
      </div>

      <p className="text-sm leading-relaxed text-bark/75">{listing.summary}</p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoTile
          size="sm"
          iconPlacement="inline"
          icon={<Sprout className="h-4 w-4" />}
          label="Feed"
          value={listing.feedStatus}
        />
        <InfoTile
          size="sm"
          iconPlacement="inline"
          icon={<Droplets className="h-4 w-4" />}
          label="Water"
          value={listing.waterStatus}
        />
        <InfoTile
          size="sm"
          iconPlacement="inline"
          icon={<Fence className="h-4 w-4" />}
          label="Fencing"
          value={listing.fencingStatus}
        />
        <InfoTile size="sm" label="Acres" value={`${listing.acres}`} />
      </div>

      <ButtonLink href={`/listings/${listing.id}`} className="mt-auto">
        View details
      </ButtonLink>
    </Card>
  );
}
