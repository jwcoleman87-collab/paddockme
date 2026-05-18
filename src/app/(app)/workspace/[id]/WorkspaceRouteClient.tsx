"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { FlowContextBar } from "@/components/FlowContextBar";
import { PageHeader } from "@/components/PageHeader";
import { getMessages, type Agreement } from "@/lib/dummyData";
import { loadPrototypeState } from "@/lib/prototypeStore";
import { WorkspaceClient } from "./WorkspaceClient";

export function WorkspaceRouteClient({
  id,
  seedAgreement,
}: {
  id: string;
  seedAgreement: Agreement;
}) {
  const [agreement, setAgreement] = useState<Agreement | null>(seedAgreement);

  useEffect(() => {
    const local = loadPrototypeState().agreements.find((item) => item.id === id);
    if (local) setAgreement(local);
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

  return (
    <>
      <PageHeader
        eyebrow="Agreement workspace"
        title="Resolve the shared agreement."
        description="Work through each section, chat beside the agreement, and only finalise when both sides have resolved the important details."
      />
      <FlowContextBar
        label="Closed-loop prototype"
        step="Dale request -> Brett paddock -> agreement -> transport"
        backHref={`/listings/${agreement.listingId}`}
        backLabel="Back to paddock"
      />
      <WorkspaceClient agreement={agreement} messages={getMessages(agreement.id)} />
    </>
  );
}
