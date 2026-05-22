"use client";

import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { FlowContextBar } from "@/components/FlowContextBar";
import { PageHeader } from "@/components/PageHeader";
import { farmers, getListing, type Agreement, type Message } from "@/lib/dummyData";
import {
  getAgreementRecord,
  listAgreementMessages,
} from "@/lib/data/repositories";
import { WorkspaceClient } from "./WorkspaceClient";

export function WorkspaceRouteClient({
  id,
  seedAgreement,
}: {
  id: string;
  seedAgreement: Agreement;
}) {
  const [agreement, setAgreement] = useState<Agreement | null>(seedAgreement);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    void Promise.all([getAgreementRecord(id), listAgreementMessages(id)]).then(
      ([local, nextMessages]) => {
        if (local) setAgreement(local);
        setMessages(nextMessages);
      }
    );
  }, [id]);

  if (!agreement) {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">No agreement found.</h2>
        <p className="mt-2 text-sm text-bark/70">
          Open a paddock and select it to create a workspace.
        </p>
        <ButtonLink href="/listings" className="mt-4 inline-flex">
          Browse paddocks
        </ButtonLink>
      </Card>
    );
  }

  const listing = getListing(agreement.listingId);
  const farmerA = farmers.find((f) => f.id === agreement.farmerAId);
  const farmerB = farmers.find((f) => f.id === agreement.farmerBId);
  const partyLine = [farmerA?.name, farmerB?.name].filter(Boolean).join(" & ");

  return (
    <>
      <PageHeader
        eyebrow={`Agreement workspace · ${agreement.status}`}
        title={`${listing.title}.`}
        description={`${partyLine}. ${agreement.livestock} for ${agreement.duration}. Work each section, chat beside it, finalise when both sides agree.`}
        action={
          <ButtonLink href={`/map?mode=agreement&agreement=${agreement.id}`} variant="secondary">
            <Map className="h-4 w-4" aria-hidden />
            Agreement map
          </ButtonLink>
        }
      />
      <FlowContextBar
        label="Coordination flow"
        step="Dale request -> Brett paddock -> agreement -> transport"
        backHref={`/listings/${agreement.listingId}`}
        backLabel="Back to paddock"
      />
      <WorkspaceClient agreement={agreement} messages={messages} />
    </>
  );
}
