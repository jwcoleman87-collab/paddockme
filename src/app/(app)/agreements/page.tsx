import { ArrowRight, MapPin, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { agreements, getFarmer, getListing } from "@/lib/dummyData";

export default function AgreementsPage() {
  const currentUser = getFarmer("farmer-a");
  const firstName = currentUser?.name.split(" ")[0] ?? "there";
  const activeAgreement = agreements[0];
  const activeListing = getListing(activeAgreement.listingId);

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title={`Welcome back, ${firstName}.`}
        description="Your current agistment work is gathered here, with the next agreement step kept close."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

      <Card className="mb-5 bg-sage-deep text-cream">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
                <UserRound className="h-3.5 w-3.5" aria-hidden />
                {currentUser?.name}
              </span>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-sage-glow/25 bg-sage-dark px-3 py-1 text-xs font-semibold text-sage-glow">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {currentUser?.region}
              </span>
            </div>
            <h2 className="text-2xl font-bold">Today&apos;s focus</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-sage-glow">
              {activeAgreement.livestock} at {activeListing.title} is still
              negotiating. The terms section needs attention before this can
              move toward final agreement.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 md:w-[22rem]">
            <InfoTile
              tone="subtle"
              label="Role"
              value={currentUser?.role}
              className="bg-warm-white/95"
            />
            <InfoTile
              tone="subtle"
              label="Next step"
              value="Review terms"
              className="bg-warm-white/95"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {agreements.map((agreement) => {
          const listing = getListing(agreement.listingId);
          return (
            <Card key={agreement.id} className="flex flex-col gap-5">
              <div>
                <StatusBadge tone="warning">{agreement.status}</StatusBadge>
                <h2 className="mt-3 text-xl font-bold text-sage-deep">
                  {listing.title}
                </h2>
                <p className="mt-1 text-sm text-bark/65">{listing.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoTile tone="subtle" size="sm" label="Livestock" value={agreement.livestock} />
                <InfoTile tone="subtle" size="sm" label="Weeks remaining" value={`${agreement.weeksRemaining}`} />
                <InfoTile tone="subtle" size="sm" label="Transport" value={agreement.transportRequired ? "Required" : "No"} />
                <InfoTile tone="subtle" size="sm" label="Last update" value="18 min ago" />
              </div>
              <p className="text-sm leading-relaxed text-bark/70">
                {agreement.lastUpdate}
              </p>
              <ButtonLink href={`/workspace/${agreement.id}`} className="mt-auto">
                Open workspace
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </Card>
          );
        })}
      </div>
    </>
  );
}
