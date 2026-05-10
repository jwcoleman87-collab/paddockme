import { AgreementPanel } from "@/components/AgreementPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { PageHeader } from "@/components/PageHeader";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { Timeline } from "@/components/Timeline";
import { getAgreement, getMessages } from "@/lib/dummyData";

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
        description="A split-screen workspace where Farmer A and Farmer B discuss terms while viewing the same agreement artifact."
      />

      <SplitWorkspace
        leftLabel="Agreement"
        rightLabel="Chat"
        left={
          <div className="space-y-5">
            <AgreementPanel agreement={agreement} />
            <section className="rounded-xl border border-mist bg-cream p-5">
              <h2 className="mb-4 text-xl font-bold text-sage-deep">
                Workspace timeline
              </h2>
              <Timeline
                items={[
                  {
                    title: "Request matched to paddock",
                    detail: "100 cattle request matched with Glenbarra River Paddocks.",
                    complete: true,
                  },
                  {
                    title: "Terms under discussion",
                    detail: "Price and special terms still require farmer alignment.",
                    complete: false,
                  },
                  {
                    title: "Final agreement record",
                    detail: "When both farmers agree, the artifact becomes the agreement record.",
                    complete: false,
                  },
                ]}
              />
            </section>
          </div>
        }
        right={<ChatPanel title="Farmer A and Farmer B" messages={messages} />}
      />
    </>
  );
}
