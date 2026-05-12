import { ArrowRight, Camera, Droplets, Fence, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { FlowContextBar } from "@/components/FlowContextBar";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { agreements, getListing } from "@/lib/dummyData";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ as?: string | string[]; published?: string | string[] }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const persona = Array.isArray(search.as) ? search.as[0] : search.as;
  const published = Array.isArray(search.published) ? search.published[0] : search.published;
  const isLandowner = persona === "landowner";
  const listing = getListing(id);
  const agreement = agreements[0];

  return (
    <>
      <PageHeader
        eyebrow={listing.region}
        title={listing.title}
        description={listing.summary}
        action={<StatusBadge tone="success">{listing.verificationStatus}</StatusBadge>}
      />
      {isLandowner ? (
        <Card className="mb-5 border-match/30 bg-match-light">
          <StatusBadge tone="success">
            {published ? "Your listing is live" : "Landowner preview"}
          </StatusBadge>
          <h2 className="mt-3 text-xl font-bold text-sage-deep">
            This is how Glenbarra appears to stock owners.
          </h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
            Next step: incoming requests from livestock owners will appear on
            your Home screen. You can share this preview or edit the listing as
            conditions change.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/listings/paddock-glenbarra?request=request-100-cattle" variant="secondary">
              Preview as livestock owner
            </ButtonLink>
            <ButtonLink href="/landowner" variant="secondary">
              View incoming requests
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <FlowContextBar
          step="Step 3 of 4: Reviewing paddock"
          backHref="/listings?request=request-100-cattle"
          backLabel="Back to matches"
        />
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.42fr]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <PhotoPlaceholder label="Paddock view" />
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
            <p className="mt-3 font-medium leading-relaxed text-bark/90">
              Suitable for {listing.suitableLivestock.join(" and ").toLowerCase()}.
              Access is best discussed before stock move. Terms are intentionally
              kept as "{listing.guideTerms.toLowerCase()}" at this stage.
            </p>
          </Card>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
              Landowner
            </p>
            <h2 className="mt-1 text-xl font-bold text-sage-deep">
              Brett Donnelly
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
              Verified Southern NSW landowner. Prototype trust signal: paddock
              details and access notes supplied.
            </p>
          </Card>
          {isLandowner ? (
            <>
              <ButtonLink href="/listings/new" className="w-full">
                Edit listing
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/landowner" variant="secondary" className="w-full">
                Open landowner home
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href={`/workspace/${agreement.id}`} className="w-full">
                Message Brett
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href={`/workspace/${agreement.id}`} variant="secondary" className="w-full">
                Request to agist here
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
    <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-sage/55 bg-sage-mist/85 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <Camera className="mb-2 h-7 w-7 text-sage-deep" aria-hidden />
      <p className="text-sm font-semibold text-sage-deep">{label}</p>
    </div>
  );
}
