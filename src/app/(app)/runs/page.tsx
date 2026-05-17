import { ArrowRight, CheckCircle2, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

const pipeline = [
  { label: "Interested", value: "2", detail: "Waiting on farmer response" },
  { label: "Confirmed", value: "1", detail: "Friday pickup at 7 AM" },
  { label: "Completed", value: "6", detail: "Last 30 days" },
];

export default function RunsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Driver home"
        title="Trav's run pipeline."
        description="A prototype view for owner-operators: work you've put your hand up for, confirmed runs, and completed jobs."
        action={<ButtonLink href="/jobs">Find more jobs</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <Card className="bg-sage-deep text-cream">
          <Truck className="mb-4 h-8 w-8 text-sage-glow" aria-hidden />
          <h2 className="text-2xl font-bold">Next confirmed run</h2>
          <p className="mt-2 font-medium leading-relaxed text-sage-glow">
            Orange district to Gundagai, 100 cattle. Pickup Friday 22 May.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoTile tone="subtle" label="Status" value="Confirmed driver" className="bg-warm-white/95" />
            <InfoTile tone="subtle" label="ETA" value="5 h 45 min" className="bg-warm-white/95" />
          </div>
          <ButtonLink
            href="/transport/transport-glenbarra?as=driver"
            variant="secondary"
            className="mt-5"
          >
            Open run room
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {pipeline.map((item) => (
            <Card key={item.label}>
              <StatusBadge tone={item.label === "Confirmed" ? "success" : "info"}>
                {item.label}
              </StatusBadge>
              <p className="mt-4 text-4xl font-extrabold text-sage-deep">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
                {item.detail}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-sage-deep">
              Pre-flight checks land here next.
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-bark/85">
              Truck fit, wet-weather gate access, loading-yard photos and route
              constraints will sit before the driver commits to a confirmed run.
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 shrink-0 text-match" aria-hidden />
        </div>
      </Card>
    </>
  );
}
