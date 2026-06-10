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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function TransportRouteClient({
  id,
  seedJob = null,
}: {
  id: string;
  seedJob?: TransportJob | null;
}) {
  const [job, setJob] = useState<TransportJob | null>(seedJob);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([getTransportJobRecord(id), listTransportMessages(id)]).then(
      ([local, nextMessages]) => {
        if (!active) return;
        if (local) setJob(local);
        setMessages(nextMessages);
        setLoaded(true);
      }
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (!job) {
    if (!loaded) {
      return (
        <Card className="text-center">
          <h2 className="text-lg font-bold text-sage-deep">Loading transport room.</h2>
          <p className="mt-2 text-sm text-bark/70">Fetching the job details.</p>
        </Card>
      );
    }
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
          // The /map page only renders seed data for demo visitors - hide the
          // button for real (uuid) jobs so it doesn't dead-end.
          isUuid(job.id) ? undefined : (
            <ButtonLink href={`/map?mode=driver&transport=${job.id}&driver=${job.driverId}`} variant="secondary">
              <Map className="h-4 w-4" aria-hidden />
              Driver map
            </ButtonLink>
          )
        }
      />
      <TransportClient job={job} messages={messages} />
    </>
  );
}
