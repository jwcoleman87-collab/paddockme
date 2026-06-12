"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Camera, Droplets, Fence, MapPin, Sprout, X } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTile, setActiveTile] = useState<ListingDetailTile | null>(null);
  const searchParams = useSearchParams();
  const requestId = searchParams.get("request") ?? undefined;

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

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    void supabase.auth
      .getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

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
  const isOwner = !!userId && listing.ownerId === userId;
  const detailTiles: ListingDetailTile[] = [
    {
      id: "water",
      icon: <Droplets />,
      label: "Water",
      value: listing.waterStatus,
      note: listing.waterNote,
      fallback:
        "The landowner has not added extra water notes yet. Confirm source, supply and checking rhythm before moving stock.",
    },
    {
      id: "fencing",
      icon: <Fence />,
      label: "Fencing",
      value: listing.fencingStatus,
      note: listing.fencingNote,
      fallback:
        "The landowner has not added extra fencing notes yet. Confirm boundary condition, gates and internal fencing before moving stock.",
    },
    {
      id: "feed",
      icon: <Sprout />,
      label: "Feed",
      value: listing.feedStatus,
      note: listing.feedNote,
      fallback:
        "The landowner has not added extra feed notes yet. Confirm pasture type, expected carrying capacity and supplement plans before moving stock.",
    },
  ];

  async function openWorkspace() {
    setOpening(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          const next = requestId
            ? `/listings/${listing.id}?request=${encodeURIComponent(requestId)}`
            : `/listings/${listing.id}`;
          router.push(
            `/sign-in?next=${encodeURIComponent(next)}`
          );
          return;
        }
      }
      if (agreementId) {
        router.push(`/workspace/${agreementId}`);
        return;
      }
      if (!requestId) {
        flash(
          "Create a livestock request first, then choose a paddock from its matches.",
          "warning"
        );
        setOpening(false);
        return;
      }
      const { agreement } = await openAgreementWorkspace(listing.id, requestId);
      if (!agreement) {
        flash(
          "To open a workspace you need an open livestock request to pair with this paddock. Create a request first.",
          "warning"
        );
        setOpening(false);
        return;
      }
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
          {listing.photos && listing.photos.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {listing.photos.map((src, index) => (
                <figure
                  key={`${index}-${src.slice(0, 16)}`}
                  className="relative min-h-44 overflow-hidden rounded-xl border border-stone/35 bg-warm-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${listing.title} photo ${index + 1}`}
                    className="h-44 w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute bottom-3 left-3 rounded-md bg-cream/95 px-3 py-1 text-xs font-bold text-sage-deep shadow-sm">
                      Hero
                    </span>
                  )}
                </figure>
              ))}
            </div>
          ) : (
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
          )}

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">Property summary</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoTile icon={<MapPin />} label="Location" value={listing.location} />
              <InfoTile icon={<Sprout />} label="Acres" value={`${listing.acres}`} />
              {detailTiles.map((tile) => (
                <DetailTile
                  key={tile.id}
                  tile={tile}
                  onOpen={() => setActiveTile(tile)}
                />
              ))}
            </div>
          </Card>

        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          {agreementId || !isOwner ? (
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
          ) : null}
          <ButtonLink href="/listings" variant="secondary" className="w-full">
            Back to paddocks
          </ButtonLink>
        </aside>
      </div>
      <TileDetailDialog tile={activeTile} onClose={() => setActiveTile(null)} />
    </>
  );
}

type ListingDetailTile = {
  id: "feed" | "water" | "fencing";
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  fallback: string;
};

function DetailTile({
  tile,
  onOpen,
}: {
  tile: ListingDetailTile;
  onOpen: () => void;
}) {
  const hasNote = !!tile.note;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="min-w-0 rounded-md border border-stone/25 bg-white p-4 text-left shadow-[inset_0_0_0_1px_rgba(109,98,87,0.08)] transition hover:border-sage/45 hover:bg-sage-mist/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      aria-label={`Open ${tile.label.toLowerCase()} details`}
    >
      <div className="mb-2 text-sage-deep" aria-hidden>
        {tile.icon}
      </div>
      <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-stone">
        {tile.label}
      </p>
      <p className="mt-1.5 break-words text-[0.96rem] font-extrabold leading-snug text-bark">
        {tile.value}
      </p>
      <p className="mt-2 text-xs font-bold text-sage-deep">
        {hasNote ? "View farmer notes" : "View details"}
      </p>
    </button>
  );
}

function TileDetailDialog({
  tile,
  onClose,
}: {
  tile: ListingDetailTile | null;
  onClose: () => void;
}) {
  if (!tile) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-tile-detail-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sage-deep/35 px-3 py-6 backdrop-blur-sm sm:items-center sm:px-6"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_24px_60px_rgba(34,84,52,0.25)]">
        <div className="flex items-start justify-between gap-3 border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-stone">
              {tile.label}
            </p>
            <h2
              id="listing-tile-detail-title"
              className="mt-1 text-xl font-bold text-sage-deep"
            >
              {tile.value}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-mist bg-warm-white text-bark transition hover:border-sage/40 hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="whitespace-pre-line text-base leading-relaxed text-bark/80">
            {tile.note || tile.fallback}
          </p>
        </div>
      </div>
    </div>
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
