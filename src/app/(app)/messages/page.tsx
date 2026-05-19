import { PageHeader } from "@/components/PageHeader";
import {
  agreements,
  farmers,
  getMessages,
  getTransportMessages,
  transportJobs,
  type Message,
} from "@/lib/dummyData";
import { MessagesClient } from "./MessagesClient";

export default function MessagesPage() {
  const agreementMessages: Record<string, Message[]> = {};
  for (const agreement of agreements) {
    agreementMessages[agreement.id] = getMessages(agreement.id);
  }
  const transportMessagesById: Record<string, Message[]> = {};
  for (const job of transportJobs) {
    transportMessagesById[job.id] = getTransportMessages(job.id);
  }

  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title="Your conversations."
        description="Every workspace and transport room you're part of. The latest message lives on top."
      />
      <MessagesClient
        agreements={agreements}
        transportJobs={transportJobs}
        farmers={farmers}
        agreementMessages={agreementMessages}
        transportMessages={transportMessagesById}
      />
    </>
  );
}
