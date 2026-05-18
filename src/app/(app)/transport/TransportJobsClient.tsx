"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CircleDollarSign, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import { useFlash } from "@/components/FlashProvider";
import {
  formatTransportStatus,
  loadPrototypeState,
  setPrototypePersona,
  updateTransportStatus,
} from "@/lib/prototypeStore";
import type { TransportJob, TransportJobStatus } from "@/lib/dummyData";

type Mode = "portal" | "jobs" | "calendar";

export function TransportJobsClient({ mode }: { mode: Mode }) {
  const router = useRouter();
  const flash = useFlash();
  const [jobs, setJobs] = useState<TransportJob[]>([]);

  useEffect(() => {
    setJobs(loadPrototypeState().transportJobs);
  }, []);

  const available = useMemo(
    () => jobs.filter((job) => job.status === "available"),
    [jobs]
  );
  const accepted = useMemo(
    () => jobs.filter((job) => job.status !== "available" && job.status !== "cancelled"),
    [jobs]
  );

  function acceptJob(job: TransportJob) {
    setPrototypePersona("driver-1");
    const { state } = updateTransportStatus(job.id, "accepted");
    setJobs(state.transportJobs);
    flash("Job accepted. It has been added to Wayne's calendar.", "success");
    router.push(`/transport/${job.id}`);
  }

  if (mode === "portal") {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        <PortalCard
          icon={<Truck />}
          title="Available jobs"
          value={`${available.length}`}
          href="/transport/jobs"
          cta="Browse jobs"
        />
        <PortalCard
          icon={<CalendarDays />}
          title="Calendar"
          value={`${accepted.length}`}
          href="/transport/calendar"
          cta="Accepted jobs"
        />
        <PortalCard
          icon={<CircleDollarSign />}
          title="Earnings"
          value="Prototype"
          href="/transport/earnings"
          cta="Open earnings"
        />
      </div>
    );
  }

  const list = mode === "jobs" ? available : accepted;

  if (list.length === 0) {
    return (
      <Card className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
          {mode === "jobs" ? <Truck className="h-6 w-6" /> : <CalendarDays className="h-6 w-6" />}
        </div>
        <h2 className="text-lg font-bold text-sage-deep">
          {mode === "jobs" ? "No available transport jobs." : "No accepted jobs yet."}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
          {mode === "jobs"
            ? "Request transport from an agreement workspace to create a job Wayne can accept."
            : "Accepted jobs appear here after Wayne accepts them from the job board."}
        </p>
        <ButtonLink href={mode === "jobs" ? "/agreements" : "/transport/jobs"} className="mt-4 inline-flex">
          {mode === "jobs" ? "Open agreements" : "Browse jobs"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {list.map((job) => (
        <TransportJobCard
          key={job.id}
          job={job}
          mode={mode}
          onAccept={() => acceptJob(job)}
        />
      ))}
    </div>
  );
}

function PortalCard({
  icon,
  title,
  value,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-sage-deep">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sage-mist">
          {icon}
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-sm text-bark/65">{value}</p>
        </div>
      </div>
      <ButtonLink href={href} className="mt-auto">
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </Card>
  );
}

function TransportJobCard({
  job,
  mode,
  onAccept,
}: {
  job: TransportJob;
  mode: Mode;
  onAccept: () => void;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <StatusBadge tone={toneForStatus(job.status)}>
          {formatTransportStatus(job.status)}
        </StatusBadge>
        <h2 className="mt-3 text-xl font-bold text-sage-deep">
          {job.livestockCount}
        </h2>
        <p className="mt-1 text-sm text-bark/65">{job.routeSummary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoTile tone="subtle" size="sm" label="Pickup" value={job.pickup} />
        <InfoTile tone="subtle" size="sm" label="Destination" value={job.destination} />
        <InfoTile tone="subtle" size="sm" label="Date" value={job.preferredDate} />
        <InfoTile tone="subtle" size="sm" label="Driver" value={job.driver} />
      </div>
      {mode === "jobs" ? (
        <Button type="button" onClick={onAccept} className="mt-auto">
          Accept job
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      ) : (
        <ButtonLink href={`/transport/${job.id}`} className="mt-auto">
          Open transport room
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      )}
    </Card>
  );
}

function toneForStatus(status: TransportJobStatus) {
  if (status === "completed" || status === "arrived") return "success";
  if (status === "available") return "warning";
  if (status === "cancelled") return "neutral";
  return "info";
}
