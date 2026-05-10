import { AlertTriangle, CheckCircle, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Agreement } from "@/lib/dummyData";

export function AgreementPanel({ agreement }: { agreement: Agreement }) {
  return (
    <section className="rounded-xl border border-mist bg-cream">
      <div className="border-b border-mist px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge tone="warning">Agreement status: {agreement.status}</StatusBadge>
          {agreement.transportRequired && (
            <StatusBadge tone="info">
              <Truck className="h-3.5 w-3.5" aria-hidden />
              Transport required
            </StatusBadge>
          )}
        </div>
        <h2 className="text-2xl font-bold text-sage-deep">
          Shared agistment agreement
        </h2>
        <p className="mt-1 text-sm text-bark/65">
          A shared artifact both farmers can review before the agreement is finalised.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Fact label="Livestock" value={agreement.livestock} />
          <Fact label="Duration" value={agreement.duration} />
          <Fact label="Feed" value={agreement.feed} />
          <Fact label="Water" value={agreement.water} />
          <Fact label="Fencing" value={agreement.fencing} />
          <Fact label="Transport" value={agreement.transportRequired ? "Yes" : "No"} />
        </div>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
            Livestock readiness checklist
          </h3>
          <div className="space-y-2">
            {agreement.readinessChecklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-mist bg-warm-white px-4 py-3"
              >
                <span className="font-semibold text-bark">{item.label}</span>
                {item.complete ? (
                  <CheckCircle className="h-5 w-5 text-match" aria-label="Complete" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber" aria-label="Needs attention" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
            Agreement alignment
          </h3>
          <div className="space-y-2">
            {agreement.alignment.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-mist bg-warm-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-bark">{item.label}</p>
                  <StatusBadge tone={item.status === "matched" ? "success" : "warning"}>
                    {item.status === "matched" ? "Matched" : "Needs attention"}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-sm text-bark/65">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <ButtonLink href={`/workspace/${agreement.id}`} variant="secondary">
            Counter offer
          </ButtonLink>
          <ButtonLink href="/transport/transport-glenbarra" variant="secondary">
            Request transport
          </ButtonLink>
          <ButtonLink href={`/agreements`} className="sm:col-span-1">
            Finalise agreement
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-mist bg-warm-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-1 text-base font-semibold text-bark">{value}</p>
    </div>
  );
}
