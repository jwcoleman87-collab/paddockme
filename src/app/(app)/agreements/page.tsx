import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { agreements, getListing } from "@/lib/dummyData";

export default function AgreementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Active agreements"
        title="Work already in motion."
        description="A simple operational dashboard for active and negotiating agistment agreements."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

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
