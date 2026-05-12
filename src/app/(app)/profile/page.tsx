import { CheckCircle, CircleDot, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { farmers } from "@/lib/dummyData";

export default function ProfilePage() {
  const farmer = farmers[0];

  return (
    <>
      <PageHeader
        eyebrow="Profile and verification"
        title={farmer.name}
        description="Basic user identity, verification and preparedness placeholders for the skeleton."
        action={<StatusBadge tone="success">Mobile verified</StatusBadge>}
      />

      <div className="grid gap-5 lg:grid-cols-[0.7fr_0.3fr]">
        <Card>
          <h2 className="text-xl font-bold text-sage-deep">Operational profile</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoTile label="Role" value={farmer.role} />
            <InfoTile label="Region" value={farmer.region} />
            <InfoTile label="ABN" value="Placeholder pending" />
            <InfoTile label="PIC" value="Placeholder pending" />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3 text-sage-deep">
            <ShieldCheck className="h-7 w-7" aria-hidden />
            <h2 className="text-xl font-bold">Preparedness score</h2>
          </div>
          <p className="text-5xl font-extrabold text-sage-deep">
            72
          </p>
          <p className="mt-2 text-sm font-medium text-bark/85">
            Placeholder score based on verification, documents and transport readiness.
          </p>
        </Card>
      </div>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        <Readiness complete label="Mobile verified" />
        <Readiness label="ABN/PIC to verify" />
        <Readiness label="Insurance documents later" />
      </section>

      <ButtonLink href="/agreements" className="mt-5">
        Back to agreements
      </ButtonLink>
    </>
  );
}

function Readiness({ label, complete }: { label: string; complete?: boolean }) {
  const Icon = complete ? CheckCircle : CircleDot;
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border border-mist bg-cream px-4">
      <Icon className={complete ? "h-5 w-5 text-match" : "h-5 w-5 text-bark/75"} aria-hidden />
      <span className="font-semibold text-bark">{label}</span>
    </div>
  );
}
