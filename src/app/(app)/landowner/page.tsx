import { ArrowRight, Sprout, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function LandownerHomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Landowner home"
        title="Brett's paddock inbox."
        description="A prototype home for Farmer B: manage listings, see incoming stock requests, and decide what needs a reply."
        action={<ButtonLink href="/listings/new">List another paddock</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <Card className="bg-warm-white">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge tone="warning">Needs response</StatusBadge>
            <StatusBadge tone="info">Incoming request</StatusBadge>
          </div>
          <h2 className="text-2xl font-bold text-sage-deep">
            Dale wants to agist 100 Angus at Glenbarra.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-bark/85">
            Dale Morgan is looking for 3 months in Southern NSW. Rate and final
            terms still need attention before either side can lock it in.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile size="sm" label="Stock" value="100 Angus cattle" />
            <InfoTile size="sm" label="Duration" value="3 months" />
            <InfoTile size="sm" label="Next step" value="Reply to terms" />
          </div>
          <ButtonLink
            href="/workspace/agreement-glenbarra?as=landowner"
            className="mt-5"
          >
            Review Dale's request
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
              <Sprout className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-sage-deep">My paddocks</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
              Glenbarra River Paddocks is live. Keep feed, water, access and
              availability current so stock owners know what is real.
            </p>
            <ButtonLink
              href="/listings/paddock-glenbarra?as=landowner"
              variant="secondary"
              className="mt-4"
            >
              Open listing
            </ButtonLink>
          </Card>

          <Card>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-light text-amber">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-sage-deep">Demand signal</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
              Southern NSW has active cattle demand in this prototype. Later,
              this becomes "boost visibility here" and "see requests from this
              region."
            </p>
            <ButtonLink href="/map?as=landowner" variant="secondary" className="mt-4">
              View regional demand
            </ButtonLink>
          </Card>
        </div>
      </div>
    </>
  );
}
