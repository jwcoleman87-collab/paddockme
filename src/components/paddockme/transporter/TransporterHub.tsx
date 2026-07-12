"use client";

import { MessageSquareText, MoveRight, Search, Truck } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import {
  demoPrimaryTransportJob,
  demoTransportJobs,
} from "@/lib/paddockmeDemoData";
import {
  TRANSPORTER_MOVEMENT_STEPS,
  usePaddockmeWorkflow,
} from "@/lib/paddockmeWorkflow";
import { formatAudPrice, formatDateTimeAu } from "./format";
import { TransporterShell } from "./TransporterShell";
import { TransportJobCard } from "./TransportJobCard";
import {
  TransporterStatusNav,
  type TransporterView,
} from "./TransporterStatusNav";

export function TransporterHub({ view }: { view: TransporterView }) {
  const { state, hasHydrated, selectTransporterJob } = usePaddockmeWorkflow();
  const { transporter } = state;
  const mainIsAvailable = transporter.stage === "available";
  const availableJobs = mainIsAvailable
    ? demoTransportJobs
    : demoTransportJobs.filter((job) => !job.featured);
  const hasMessages = transporter.discussionStarted || transporter.stage !== "available";
  const counts: Record<TransporterView, number> = {
    available: availableJobs.length,
    quotes: transporter.stage === "quoted" ? 1 : 0,
    awarded: transporter.stage === "awarded" ? 1 : 0,
    active: transporter.stage === "active" ? 1 : 0,
    completed: transporter.stage === "completed" ? 1 : 0,
    messages: hasMessages ? 1 : 0,
  };

  const currentMovementLabel =
    TRANSPORTER_MOVEMENT_STEPS.find(
      (step) => step.key === transporter.movementStep,
    )?.label ?? "Active movement";

  return (
    <TransporterShell
      title="Transport work for Wayne"
      description="Open PaddockME each morning to find livestock movements, clarify the job with both farmers and manage work from quote to delivery."
    >
      <TransporterStatusNav active={view} counts={counts} />

      <div className="mt-6">
        {!hasHydrated ? (
          <div className="h-64 animate-pulse rounded-2xl border border-pm-border bg-white" aria-label="Loading transport work" />
        ) : view === "available" ? (
          <JobList
            title="Available jobs"
            description="Livestock movements that match Wayne's equipment and operating area."
            jobs={availableJobs.map((job) => ({ job }))}
            onOpen={(id) => selectTransporterJob(id)}
          />
        ) : view === "quotes" ? (
          transporter.stage === "quoted" && transporter.quote ? (
            <JobList
              title="My quotes"
              description={`Submitted ${formatDateTimeAu(transporter.quote.submittedAt)} · ${formatAudPrice(transporter.quote.totalPrice)} inc. GST`}
              jobs={[{
                job: demoPrimaryTransportJob,
                status: `Quote submitted · ${formatAudPrice(transporter.quote.totalPrice)}`,
                href: "/transport/demo/jobs/1023/quote",
                actionLabel: "View submitted quote",
              }]}
              onOpen={(id) => selectTransporterJob(id)}
            />
          ) : (
            <EmptyView title="No quotes submitted yet" body="Discuss an available job with both farmers, then quote from the confirmed plan." href="/transport/demo" action="Browse available jobs" />
          )
        ) : view === "awarded" ? (
          transporter.stage === "awarded" ? (
            <JobList
              title="Awarded work"
              description="James selected Wayne's quote. The shared room is ready."
              jobs={[{
                job: demoPrimaryTransportJob,
                status: "Awarded to you",
                href: "/transport/demo/jobs/1023/awarded",
                actionLabel: "View awarded job",
              }]}
              onOpen={(id) => selectTransporterJob(id)}
            />
          ) : (
            <EmptyView title="No awarded jobs" body="Jobs appear here once a livestock owner accepts one of Wayne's quotes." href="/transport/demo?view=quotes" action="View my quotes" />
          )
        ) : view === "active" ? (
          transporter.stage === "active" ? (
            <JobList
              title="Active work"
              description="One shared status keeps James and John informed."
              jobs={[{
                job: demoPrimaryTransportJob,
                status: currentMovementLabel,
                href: "/transport/demo/jobs/1023/room",
                actionLabel: "Open active job",
              }]}
              onOpen={(id) => selectTransporterJob(id)}
            />
          ) : (
            <EmptyView title="No active movement" body="Awarded work moves here when Wayne posts Heading to pickup." href="/transport/demo?view=awarded" action="View awarded work" />
          )
        ) : view === "completed" ? (
          transporter.stage === "completed" ? (
            <JobList
              title="Completed work"
              description="Delivered livestock, commercial outcome and the shared movement record."
              jobs={[{
                job: demoPrimaryTransportJob,
                status: "Delivery complete",
                href: "/transport/demo/jobs/1023/complete",
                actionLabel: "View completed job",
              }]}
              onOpen={(id) => selectTransporterJob(id)}
            />
          ) : (
            <EmptyView title="No completed jobs" body="Completed deliveries remain here as a shared record for Wayne and both farmers." href="/transport/demo" action="Find available jobs" />
          )
        ) : hasMessages ? (
          <section>
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-pm-charcoal">Messages</h2>
                <p className="mt-1 text-base text-pm-muted">One private RFT conversation with James and John.</p>
              </div>
            </div>
            <TransportJobCard
              job={demoPrimaryTransportJob}
              status="3 participants"
              href={transporter.stage === "awarded" || transporter.stage === "active" || transporter.stage === "completed"
                ? "/transport/demo/jobs/1023/room"
                : "/transport/demo/jobs/1023/discussion"}
              actionLabel={transporter.stage === "available" || transporter.stage === "quoted" ? "Open discussion" : "Open shared job room"}
              onOpen={() => selectTransporterJob(demoPrimaryTransportJob.id)}
            />
          </section>
        ) : (
          <EmptyView title="No messages yet" body="Open the featured RFT and start a three-party discussion with James and John." href="/transport/demo/jobs/1023" action="Open featured job" />
        )}
      </div>
    </TransporterShell>
  );
}

function JobList({
  title,
  description,
  jobs,
  onOpen,
}: {
  title: string;
  description: string;
  jobs: {
    job: typeof demoPrimaryTransportJob;
    status?: string;
    href?: string;
    actionLabel?: string;
  }[];
  onOpen: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-pm-charcoal">{title}</h2>
      <p className="mt-1 text-base text-pm-muted">{description}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {jobs.map(({ job, ...card }) => (
          <TransportJobCard
            key={job.id}
            job={job}
            {...card}
            onOpen={() => onOpen(job.id)}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyView({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <section className="rounded-2xl border border-pm-border bg-white p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
        <Search className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-extrabold text-pm-charcoal">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-pm-muted">{body}</p>
      <PmButton href={href} className="mt-6 w-full sm:w-auto">
        <Truck className="h-4 w-4" aria-hidden />
        {action}
        <MoveRight className="h-4 w-4" aria-hidden />
      </PmButton>
    </section>
  );
}
