"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  MapPin,
  MessagesSquare,
  MoveRight,
  Route,
  Truck,
  Warehouse,
} from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { Badge } from "@/components/paddockme/PmCards";
import { TransporterPrerequisite } from "@/components/paddockme/transporter/TransporterPrerequisite";
import { TransporterShell } from "@/components/paddockme/transporter/TransporterShell";
import {
  demoPrimaryTransportJob,
  demoTransportJobs,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

export default function TransporterJobDetailPage() {
  const params = useParams<{ id: string }>();
  const { selectTransporterJob, hasHydrated } = usePaddockmeWorkflow();
  const job = demoTransportJobs.find(
    (candidate) =>
      candidate.agreementId === params.id || candidate.id === params.id,
  );

  useEffect(() => {
    // Wait for the stored session first: on a hard page load this effect
    // fires before the provider re-reads localStorage, and an early write
    // would be clobbered by the (older) stored state.
    if (hasHydrated && job) selectTransporterJob(job.id);
    // Selecting the route's job once is intentional; context actions are not
    // stable callbacks and must not retrigger this effect on each state write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, hasHydrated]);

  if (!job) {
    return (
      <TransporterShell title="Transport job not found" backHref="/transport/demo">
        <TransporterPrerequisite
          title="This transport job is not on the board"
          body="Return to Wayne's available work to choose a current livestock movement."
          href="/transport/demo"
          action="View available jobs"
        />
      </TransporterShell>
    );
  }

  const isPrimary = job.id === demoPrimaryTransportJob.id;

  return (
    <TransporterShell
      title={`${job.livestock}: ${job.pickupRegion} to ${job.destinationRegion}`}
      description="Everything Wayne needs to decide whether the load suits his equipment, timing and route."
      backHref="/transport/demo"
      status="Open for quotes"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-pm-gold-600">
                  Request for transport · Agistment #{job.agreementId}
                </p>
                <h2 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-extrabold text-pm-charcoal">
                  {job.pickup}
                  <MoveRight className="h-4 w-4 text-pm-gold-600" aria-label="to" />
                  {job.destination}
                </h2>
              </div>
              <Badge>{job.distanceKm} km</Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-pm-border pt-5 sm:grid-cols-3">
              <Fact icon={Truck} label="Livestock" value={job.livestock} />
              <Fact icon={CalendarDays} label="Preferred pickup" value={job.preferredDate} />
              <Fact icon={Clock3} label="Date flexibility" value={job.dateFlexibility} />
              <Fact icon={Route} label="Equipment" value={job.equipmentRequirement} />
              <Fact icon={MapPin} label="Pickup access" value={job.pickupAccess} />
              <Fact icon={Warehouse} label="Delivery access" value={job.deliveryAccess} />
            </dl>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <DetailSection title="Loading and pickup" icon={Truck}>
              <p>{job.loadingArrangements}</p>
              <p className="mt-2">{job.pickupAccess}</p>
            </DetailSection>
            <DetailSection title="Delivery and unloading" icon={Warehouse}>
              <p>{job.unloadingArrangements}</p>
              <p className="mt-2">{job.deliveryAccess}</p>
            </DetailSection>
            <DetailSection title="Commercial details" icon={CircleDollarSign}>
              <p>{job.commercialDetails}</p>
              <p className="mt-2 font-semibold text-pm-charcoal">{job.quoteCloses}</p>
            </DetailSection>
            <DetailSection title="Outstanding questions" icon={HelpCircle}>
              {job.outstandingQuestions.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5">
                  {job.outstandingQuestions.map((question) => <li key={question}>{question}</li>)}
                </ul>
              ) : (
                <p>All key access, timing and handling details are ready to confirm with both farmers.</p>
              )}
            </DetailSection>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 md:sticky md:top-24 md:self-start">
          <section className="rounded-2xl border-2 border-pm-green-900 bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pm-green-900 text-white">
              <MessagesSquare className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-pm-charcoal">
              Discuss before quoting
            </h2>
            <p className="mt-2 text-base leading-relaxed text-pm-muted">
              Wayne speaks directly with James and John, so access, yards and timing are shared rather than assumed.
            </p>
            <p className="mt-3 text-sm font-semibold text-pm-green-900">
              {job.discussionCount} discussion updates · 3 participants
            </p>

            {isPrimary ? (
              <div className="mt-5 space-y-2">
                <PmButton href={`/transport/demo/jobs/${job.agreementId}/discussion`} className="w-full">
                  <MessagesSquare className="h-4 w-4" aria-hidden />
                  Discuss job
                </PmButton>
                <PmButton href={`/transport/demo/jobs/${job.agreementId}/quote`} variant="outline" className="w-full">
                  Submit quote
                  <MoveRight className="h-4 w-4" aria-hidden />
                </PmButton>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-pm-cream-100 p-4">
                <p className="text-sm text-pm-charcoal">
                  This seeded movement gives the board realistic depth. The guided three-party journey follows the featured Dubbo job.
                </p>
                <PmButton href="/transport/demo/jobs/1023" variant="outline" className="mt-3 w-full">
                  Open featured job
                </PmButton>
              </div>
            )}
          </section>
        </aside>
      </div>
    </TransporterShell>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-pm-muted">
        <Icon className="h-4 w-4 shrink-0 text-pm-green-900" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-bold leading-snug text-pm-charcoal">{value}</dd>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: typeof Truck; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-pm-charcoal">
        <Icon className="h-5 w-5 text-pm-green-900" aria-hidden />
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-pm-muted">{children}</div>
    </section>
  );
}
