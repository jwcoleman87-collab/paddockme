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
import { RealTransportRoom } from "./RealTransportRoom";

function formatTransportStatus(status: TransportJob["status"]): string {
  return status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function TransportRouteClient({ id }: { id: string }) {
  const [job, setJob] = useState<TransportJob | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([getTransportJobRecord(id), listTransportMessages(id)]).then(
      ([record, nextMessages]) => {
        if (!active) return;
        if (record) setJob(record);
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
          Open the RFT board
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Transport room · ${formatTransportStatus(job.status)}`}
        title={job.routeSummary}
        description={`${job.livestockCount} from ${job.pickup} to ${job.destination}. Pickup ${job.preferredDate}. Agistment terms stay private to the farmers.`}
        action={
          <ButtonLink href={`/map?transport=${job.id}`} variant="secondary">
            <Map className="h-4 w-4" aria-hidden />
            Route map
          </ButtonLink>
        }
      />
      <RealTransportRoom job={job} messages={messages} />
    </>
  );
}
