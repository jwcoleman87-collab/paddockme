import { Card } from "@/components/Card";
import { FlowContextBar } from "@/components/FlowContextBar";
import { PageHeader } from "@/components/PageHeader";
import { getAgreement, getFarmer, getMessages } from "@/lib/dummyData";
import { WorkspaceClient } from "./WorkspaceClient";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agreement = getAgreement(id);
  const messages = getMessages(agreement.id);
  const farmerA = getFarmer(agreement.farmerAId);
  const farmerB = getFarmer(agreement.farmerBId);

  return (
    <>
      <PageHeader
        eyebrow="Step 4 of 4"
        title={`Agree terms with ${farmerB?.name.split(" ")[0] ?? "the landowner"}.`}
        description="Work through each section, chat beside the agreement, and only finalise when both sides have agreed the important details."
      />
      <FlowContextBar
        step="Step 4 of 4: Agreeing terms"
        backHref="/listings/paddock-glenbarra?request=request-100-cattle"
        backLabel="Back to paddock"
      />
      <Card className="mb-5 border-sage/30 bg-sage-mist/70">
        <p className="text-sm font-bold text-sage-deep">
          You are {farmerA?.name ?? "Dale Morgan"} ({farmerA?.role ?? "Livestock Owner"}).
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-bark/85">
          You are working with {farmerB?.name ?? "Brett Donnelly"} ({farmerB?.role ?? "Landowner"}).
          The agreement becomes real only after both sides agree the open sections.
        </p>
      </Card>
      <WorkspaceClient agreement={agreement} messages={messages} />
    </>
  );
}
