"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Droplets, Fence, MapPin, Sprout } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useFlash } from "@/components/FlashProvider";
import { getListingMapImageSrc } from "@/lib/listingMapImages";
import {
  listAgreements,
  listPaddockListings,
  openAgreementWorkspace,
} from "@/lib/data/repositories";
import type { PaddockListing } from "@/lib/dummyData";
import { ListingPublishedFlash } from "./ListingPublishedFlash";

export function ListingDetailClient({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const flash = useFlash();
  const [listings, setListings] = useState<PaddockListing[]>([]);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    void Promise.all([listPaddockListings(), listAgreements()]).then(
      ([nextListings, nextAgreements]) => {
        setListings(nextListings);
        setAgreementId(
          nextAgreements.find((agreement) => agreement.listingId === id)?.id ?? null
        );
      }
    );
  }, [id]);

  const listing = useMemo(
    () => listings.find((item) => item.id === id) ?? listings[0],
    [id, listings]
  );

  if (!listing) {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">Listing not found.</h2>
        <p className="mt-2 text-sm text-bark/70">
          This paddock could not be found.
        </p>
        <ButtonLink href="/listings" className="mt-4 inline-flex">
          Back to paddocks
        </ButtonLink>
      </Card>
    );
  }

  const mapImageSrc = getListingMapImageSrc(listing.id);

  async function openWorkspace() {
    setOpening(true);
    try {
      const { agreement } = await openAgreementWorkspace(listing.id);
      flash("Agreement opened.", "success");
      router.push(`/workspace/${agreement.id}`);
    } catch (err) {
      console.error("[listing] openWorkspace error:", err);
      flash("Couldn't open the workspace. Try refreshing the page.", "warning");
      setOpening(false);
    }
  }

  return (
    <>
      <ListingPublishedFlash show={published} />
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
              <InfoTile icon={<MapPin />} label="Location" value={listing.location} />
              <InfoTile icon={<Sprout />} label="Acres" value={`${listing.acres}`} />
              <InfoTile icon={<Droplets />} label="Water" value={listing.waterStatus} />
              <InfoTile icon={<Fence />} label="Fencing" value={listing.fencingStatus} />
              <InfoTile icon={<Sprout />} label="Feed" value={listing.feedStatus} />
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
          {agreementId ? (
            <p className="rounded-xl border border-sage-deep/15 bg-sage-mist/55 px-4 py-3 text-sm text-bark/75">
              There&apos;s an active agreement on this paddock.
            </p>
          ) : (
            <p className="rounded-xl border border-sage-deep/15 bg-cream/55 px-4 py-3 text-sm text-bark/75">
              Select this paddock to open the shared Dale and Brett agreement workspace.
            </p>
          )}
          <Button
            type="button"
            onClick={openWorkspace}
            disabled={opening}
            aria-busy={opening}
            className="w-full"
          >
            {opening ? "Opening" : agreementId ? "Open workspace" : "Select paddock"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <ButtonLink href="/listings" variant="secondary" className="w-full">
            Back to paddocks
          </ButtonLink>
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
