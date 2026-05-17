import { ArrowRight, Camera, Droplets, Fence, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getAgreementForListing, getListing } from "@/lib/dummyData";
import { getListingMapImageSrc } from "@/lib/listingMapImages";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  const agreement = getAgreementForListing(listing.id);
  const mapImageSrc = getListingMapImageSrc(listing.id);

  return (
    <>
      <PageHeader
        eyebrow={listing.region}
        title={listing.title}
        description={listing.summary}
        action={<StatusBadge tone="success">{listing.verificationStatus}</StatusBadge>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {mapImageSrc ? (
              <LocationMapPreview
                src={mapImageSrc}
                label={`${listing.mapPlaceLabel} map`}
                placeLabel={listing.mapPlaceLabel}
              />
            ) : (
              <PhotoPlaceholder label="Paddock map" />
            )}
            <PhotoPlaceholder label="Water point" />
            <PhotoPlaceholder label="Gate and yards" />
          </div>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">Property summary</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoTile icon={<Sprout />} label="Acres" value={`${listing.acres}`} />
              <InfoTile icon={<Sprout />} label="Feed" value={listing.feedStatus} />
              <InfoTile icon={<Droplets />} label="Water" value={listing.waterStatus} />
              <InfoTile icon={<Fence />} label="Fencing" value={listing.fencingStatus} />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-sage-deep">Operational notes</h2>
            <p className="mt-3 leading-relaxed text-bark/75">
              Suitable for {listing.suitableLivestock.join(" and ").toLowerCase()}.
              Access is best discussed before stock move. Terms are intentionally
              kept as &quot;{listing.guideTerms.toLowerCase()}&quot; at this stage.
            </p>
          </Card>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          {agreement ? (
            <>
              <p className="rounded-xl border border-sage-deep/15 bg-sage-mist/55 px-4 py-3 text-sm text-bark/75">
                There&apos;s an active agreement on this paddock:{" "}
                <span className="font-semibold text-sage-deep">
                  {agreement.status}
                </span>
                .
              </p>
              <ButtonLink href={`/workspace/${agreement.id}`} className="w-full">
                Open workspace
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/request/new"
                variant="secondary"
                className="w-full"
              >
                Submit another request
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="rounded-xl border border-sage-deep/15 bg-cream/55 px-4 py-3 text-sm text-bark/75">
                No agreement exists for this paddock yet. Start one to open a
                shared workspace with the landowner.
              </p>
              <ButtonLink href="/request/new" className="w-full">
                Start agreement
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/listings"
                variant="secondary"
                className="w-full"
              >
                Back to paddocks
              </ButtonLink>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-sage/35 bg-sage-mist text-center">
      <Camera className="mb-2 h-7 w-7 text-sage-deep" aria-hidden />
      <p className="text-sm font-semibold text-sage-deep">{label}</p>
    </div>
  );
}

function LocationMapPreview({
  src,
  label,
  placeLabel,
}: {
  src: string;
  label: string;
  placeLabel: string;
}) {
  return (
    <div className="relative min-h-44 overflow-hidden rounded-xl border border-stone/35 bg-warm-white">
      <img src={src} alt={label} className="h-44 w-full object-cover" />
      <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-md bg-cream/95 px-3 py-1 text-xs font-bold text-sage-deep shadow-sm">
        {placeLabel} map
      </span>
    </div>
  );
}
