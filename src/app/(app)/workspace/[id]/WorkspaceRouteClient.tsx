"use client";

import { useEffect, useState } from "react";
import { Map } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { FlowContextBar } from "@/components/FlowContextBar";
import { PageHeader } from "@/components/PageHeader";
import { getListing, type Agreement, type Message } from "@/lib/dummyData";
import {
  getAgreementRecord,
  listAgreementMessages,
} from "@/lib/data/repositories";
import { WorkspaceClient } from "./WorkspaceClient";

export function WorkspaceRouteClient({
  id,
  seedAgreement = null,
}: {
  id: string;
  seedAgreement?: Agreement | null;
}) {
  const [agreement, setAgreement] = useState<Agreement | null>(seedAgreement);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([getAgreementRecord(id), listAgreementMessages(id)]).then(
      ([record, nextMessages]) => {
        if (!active) return;
        if (record) setAgreement(record);
        setMessages(nextMessages);
        setLoaded(true);
      }
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (!agreement) {
    // Still waiting on the first load - avoid flashing the empty state.
    if (!loaded) {
      return (
        <Card className="text-center">
          <h2 className="text-lg font-bold text-sage-deep">Loading workspace.</h2>
          <p className="mt-2 text-sm text-bark/70">
            Fetching the agreement details.
          </p>
        </Card>
      );
    }
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">
          No agreement workspace found.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-bark/70">
          A workspace opens once a livestock owner and a landowner agree to pair
          a request with a paddock. Create a request or list a paddock to get
          started.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/request/new" className="inline-flex">
            Create request
          </ButtonLink>
          <ButtonLink
            href="/listings/new"
            variant="secondary"
            className="inline-flex"
          >
            List a paddock
          </ButtonLink>
        </div>
      </Card>
    );
  }

  // Real agreements carry their listing title from Supabase; demo agreements
  // fall back to the seed listing lookup.
  const listingTitle =
    agreement.listingTitle ??
    getListing(agreement.listingId)?.title ??
    "Agreement workspace";
  const partyLine = [
    agreement.farmerAName ?? "Livestock owner",
    agreement.farmerBName ?? "Landowner",
  ]
    .filter(Boolean)
    .join(" & ");
  const partyPrefix = partyLine ? partyLine + ". " : "";
  const description =
    partyPrefix +
    agreement.livestock +
    " for " +
    agreement.duration +
    ". Work each section, chat beside it, finalise when both sides agree.";

  return (
    <>
      <PageHeader
        eyebrow={`Agreement workspace · ${agreement.status}`}
        title={`${listingTitle}.`}
        description={description}
        action={
          <ButtonLink
            href={`/map?mode=agreement&agreement=${agreement.id}`}
            variant="secondary"
          >
            <Map className="h-4 w-4" aria-hidden />
            Agreement map
          </ButtonLink>
        }
      />
      <FlowContextBar
        label="Agreement flow"
        step="Livestock request -> paddock offer -> agreed terms -> transport"
        backHref={`/listings/${agreement.listingId}`}
        backLabel="Back to paddock"
      />
      <WorkspaceClient agreement={agreement} messages={messages} />
    </>
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
