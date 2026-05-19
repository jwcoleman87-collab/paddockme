import { notFound } from "next/navigation";
import {
  CheckCircle2,
  CircleDot,
  FileText,
  MapPin,
  Truck,
} from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getAgreement,
  getListing,
  getTransportJobForAgreement,
  farmers,
  type Agreement,
} from "@/lib/dummyData";

/**
 * Read-only tear-sheet view of an agreement. Designed to screenshot or print
 * and send to a vet, accountant, or anyone outside the room who needs the
 * canonical status.
 *
 * No interactive controls: sections are listed with who agreed; lifecycle is
 * the audit trail; transport status comes from the linked transport job.
 */
export default async function WorkspaceSnapshotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agreement = getAgreement(id);
  if (!agreement) notFound();

  const listing = getListing(agreement.listingId);
  const transportJob = getTransportJobForAgreement(agreement.id);
  const farmerA = farmers.find((f) => f.id === agreement.farmerAId);
  const farmerB = farmers.find((f) => f.id === agreement.farmerBId);

  return (
    <>
      <PageHeader
        eyebrow="Snapshot"
        title="Agreement record."
        description="A readonly snapshot to print or screenshot. Live changes happen in the workspace; this view is the canonical status as of the last update."
        action={
          <ButtonLink href={`/workspace/${agreement.id}`} variant="secondary">
            Back to workspace
          </ButtonLink>
        }
      />

      <Card className="mb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <StatusBadge tone={lifecycleTone(agreement.status)}>
              {agreement.status}
            </StatusBadge>
            <h2 className="mt-3 text-2xl font-bold text-sage-deep">
              {listing.title}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-bark/75">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {listing.location}
            </p>
          </div>
          <PrintButton />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoTile tone="subtle" size="sm" label="Livestock owner" value={farmerA?.name ?? "—"} />
          <InfoTile tone="subtle" size="sm" label="Landowner" value={farmerB?.name ?? "—"} />
          <InfoTile tone="subtle" size="sm" label="Livestock" value={agreement.livestock} />
          <InfoTile tone="subtle" size="sm" label="Duration" value={agreement.duration} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <InfoTile tone="subtle" size="sm" label="Feed" value={agreement.feed} />
          <InfoTile tone="subtle" size="sm" label="Water" value={agreement.water} />
          <InfoTile tone="subtle" size="sm" label="Fencing" value={agreement.fencing} />
        </div>
      </Card>

      <section className="mb-5" aria-label="Sections">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Sections
        </h2>
        <div className="grid gap-3">
          {agreement.sections.map((section) => {
            const both = section.agreedByA && section.agreedByB;
            return (
              <Card key={section.id} className="flex items-start gap-3">
                {both ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-match" aria-hidden />
                ) : (
                  <CircleDot className="mt-0.5 h-5 w-5 shrink-0 text-stone" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-sage-deep">{section.label}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wide text-stone">
                      {both
                        ? "Both agreed"
                        : section.agreedByA
                          ? `Awaiting ${farmerB?.name.split(" ")[0] ?? "Farmer B"}`
                          : section.agreedByB
                            ? `Awaiting ${farmerA?.name.split(" ")[0] ?? "Farmer A"}`
                            : "Not yet agreed"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-bark/85">
                    {section.summary}
                  </p>
                  {section.detail.length > 0 && (
                    <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                      {section.detail.map((row) => (
                        <div
                          key={row.label}
                          className="rounded-lg border border-mist bg-warm-white px-3 py-1.5"
                        >
                          <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-stone">
                            {row.label}
                          </dt>
                          <dd className="mt-0.5 text-sm font-medium text-bark/85">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {agreement.artefacts.length > 0 && (
        <section className="mb-5" aria-label="Artefacts">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
            Artefacts on file
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {agreement.artefacts.map((artefact) => (
              <Card key={artefact.id} className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-sage-deep">{artefact.label}</p>
                  {artefact.description && (
                    <p className="mt-1 text-sm text-bark/75">{artefact.description}</p>
                  )}
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone">
                    {artefact.kind} · uploaded by{" "}
                    {artefact.uploadedBy === "farmerA"
                      ? farmerA?.name.split(" ")[0] ?? "Farmer A"
                      : farmerB?.name.split(" ")[0] ?? "Farmer B"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {transportJob && (
        <section className="mb-5" aria-label="Transport status">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
            Transport status
          </h2>
          <Card className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-sage-deep" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-bold text-sage-deep">{transportJob.routeSummary}</p>
              <p className="mt-1 text-sm text-bark/75">
                {transportJob.pickup} → {transportJob.destination}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge tone="info">{formatTransportStatus(transportJob.status)}</StatusBadge>
                <span className="text-xs font-semibold uppercase tracking-wide text-stone">
                  Driver: {transportJob.driver}
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}

      <section aria-label="Audit trail">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone">
          Lifecycle audit
        </h2>
        <Card>
          <ol className="space-y-3">
            {agreement.lifecycleHistory.length === 0 ? (
              <li className="text-sm text-bark/75">
                No lifecycle events recorded.
              </li>
            ) : (
              agreement.lifecycleHistory.map((event, index) => (
                <li
                  key={`${event.at}-${index}`}
                  className="flex items-start gap-3 border-b border-mist pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-sage-deep" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-sage-deep">
                      {event.from ? `${event.from} → ${event.to}` : event.to}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-stone">
                      {event.at} · {event.byParty}
                    </p>
                    {event.note && (
                      <p className="mt-1 text-sm leading-relaxed text-bark/85">
                        {event.note}
                      </p>
                    )}
                  </div>
                </li>
              ))
            )}
          </ol>
        </Card>
      </section>
    </>
  );
}

function lifecycleTone(status: Agreement["status"]) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Negotiating":
      return "warning" as const;
    case "Ready to finalise":
    case "Completed":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function formatTransportStatus(status: string) {
  return status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}
