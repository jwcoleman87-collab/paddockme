import { CirclePlus, Pencil, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { listMyPaddockListingsServer } from "@/lib/data/serverPaddocks";

export default async function MyPaddocksPage() {
  const listings = await listMyPaddockListingsServer();

  return (
    <>
      <PageHeader
        eyebrow="My paddocks"
        title="Your paddock listings."
        description="See the paddocks you have published, open each to view, or edit the details when things change."
        action={
          <ButtonLink href="/listings/new">
            <CirclePlus className="h-4 w-4" aria-hidden />
            List a paddock
          </ButtonLink>
        }
      />

      {listings.length === 0 ? (
        <RealAccountEmptyState
          title="You haven't listed a paddock yet."
          body="Publish your first paddock so livestock owners can find available agistment. It will show up here for you to manage."
          primaryHref="/listings/new"
          primaryLabel="List a paddock"
          secondaryHref="/requests"
          secondaryLabel="See open livestock requests"
        />
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone="success">Published</StatusBadge>
                    <span className="text-xs font-semibold uppercase tracking-wide text-stone">
                      {listing.region}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-sage-deep">
                    {listing.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-bark/75">
                    {listing.summary}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 md:max-w-xl">
                    <InfoTile size="sm" label="Acres" value={`${listing.acres}`} />
                    <InfoTile size="sm" label="Water" value={listing.waterStatus} />
                    <InfoTile size="sm" label="Feed" value={listing.feedStatus} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 md:w-44">
                  <ButtonLink href={`/listings/${listing.id}/edit`}>
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit listing
                  </ButtonLink>
                  <ButtonLink
                    href={`/listings/${listing.id}`}
                    variant="secondary"
                  >
                    View
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </ButtonLink>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
