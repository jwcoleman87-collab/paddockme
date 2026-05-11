import { PageHeader } from "@/components/PageHeader";
import { getAgreement, getMessages } from "@/lib/dummyData";
import { WorkspaceClient } from "./WorkspaceClient";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agreement = getAgreement(id);
  const messages = getMessages(agreement.id);

  return (
    <>
      <PageHeader
        eyebrow="Agistment workspace"
        title="Shared agreement room."
        description="A split-screen workspace where Farmer A and Farmer B step through each section of the agreement, anchor the chat to the section under discussion, and mark mutual agreement when the wording holds up."
      />
      <WorkspaceClient agreement={agreement} messages={messages} />
    </>
  );
}
