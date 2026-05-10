import { Droplets, Fence, MapPin, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import type { PaddockListing } from "@/lib/dummyData";

export function ListingCard({ listing }: { listing: PaddockListing }) {
  return (
    <Card className="flex h-full flex-col gap-5">
      <div>
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
          <MapPin className="h-4 w-4" aria-hidden />
          {listing.location}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-bark/75">{listing.summary}</p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric icon={<Sprout className="h-4 w-4" />} label="Feed" value={listing.feedStatus} />
        <Metric icon={<Droplets className="h-4 w-4" />} label="Water" value={listing.waterStatus} />
        <Metric icon={<Fence className="h-4 w-4" />} label="Fencing" value={listing.fencingStatus} />
        <Metric label="Acres" value={`${listing.acres}`} />
      </div>

      <ButtonLink href={`/listings/${listing.id}`} className="mt-auto">
        View details
      </ButtonLink>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-mist bg-warm-white p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-semibold text-bark">{value}</p>
    </div>
  );
}
