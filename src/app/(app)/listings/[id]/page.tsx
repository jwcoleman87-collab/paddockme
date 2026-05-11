import { ArrowRight, Camera, Droplets, Fence, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { agreements, getListing } from "@/lib/dummyData";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
            <p className="mt-3 leading-relaxed text-bark/75">
              Suitable for {listing.suitableLivestock.join(" and ").toLowerCase()}.
              Access is best discussed before stock move. Terms are intentionally
              kept as "{listing.guideTerms.toLowerCase()}" at this stage.
            </p>
          </Card>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <ButtonLink href={`/workspace/${agreement.id}`} className="w-full">
            Discuss terms
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={`/workspace/${agreement.id}`} variant="secondary" className="w-full">
            Start agreement
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
