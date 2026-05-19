"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { type Message, type TransportJob } from "@/lib/dummyData";
import {
  getTransportJobRecord,
  listTransportMessages,
} from "@/lib/data/repositories";
import { TransportClient } from "./TransportClient";

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
        eyebrow="Transport coordination"
        title="Three-party transport room."
        description="Farmer A, Farmer B and the driver coordinate the move here. Agistment pricing stays hidden from Wayne."
      />
      <TransportClient job={job} messages={messages} />
    </>
  );
}
