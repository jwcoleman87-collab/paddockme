"use client";

import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { type Message, type TransportJob } from "@/lib/dummyData";
import {
  getTransportJobRecord,
  listTransportMessages,
} from "@/lib/data/repositories";
import { TransportClient } from "./TransportClient";

function formatTransportStatus(status: TransportJob["status"]): string {
  return status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function TransportRouteClient({
  id,
  seedJob,
}: {
  id: string;
  seedJob: TransportJob;
}) {
  const [job, setJob] = useState(seedJob);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    void Promise.all([getTransportJobRecord(id), listTransportMessages(id)]).then(
      ([local, nextMessages]) => {
        if (local) setJob(local);
        setMessages(nextMessages);
      }
    );
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
        eyebrow={`Transport room · ${formatTransportStatus(job.status)}`}
        title={job.routeSummary}
        description={`${job.livestockCount} from ${job.pickup} to ${job.destination}. Pickup ${job.preferredDate}. Driver: ${job.driver}. Agistment rate stays hidden from the driver.`}
        action={
          <ButtonLink href={`/map?mode=driver&transport=${job.id}&driver=${job.driverId}`} variant="secondary">
            <Map className="h-4 w-4" aria-hidden />
            Driver map
          </ButtonLink>
        }
      />
      <TransportClient job={job} messages={messages} />
    </>
  );
}
