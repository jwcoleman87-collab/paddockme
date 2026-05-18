"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { getTransportMessages, type TransportJob } from "@/lib/dummyData";
import { loadPrototypeState } from "@/lib/prototypeStore";
import { TransportClient } from "./TransportClient";

export function TransportRouteClient({
  id,
  seedJob,
}: {
  id: string;
  seedJob: TransportJob;
}) {
  const [job, setJob] = useState(seedJob);

  useEffect(() => {
    const local = loadPrototypeState().transportJobs.find((item) => item.id === id);
    if (local) setJob(local);
  }, [id]);

  if (!job) {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">No transport job found.</h2>
        <ButtonLink href="/transport/jobs" className="mt-4 inline-flex">
          Browse jobs
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Transport coordination"
        title="Three-party transport room."
        description="Farmer A, Farmer B and the driver coordinate the move here. Agistment pricing stays hidden from Wayne."
      />
      <TransportClient job={job} messages={getTransportMessages(job.id)} />
    </>
  );
}
