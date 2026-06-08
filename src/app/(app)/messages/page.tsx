import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import {
  agreements,
  farmers,
  getMessages,
  getTransportMessages,
  transportJobs,
  type Message,
} from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <>
        <PageHeader
          eyebrow="Messages"
          title="Your conversations."
          description="Agreement and transport conversations will appear here once you start working with other customers."
        />
        <RealAccountEmptyState
          title="No live conversations yet."
          body="Create a request, listing, or transport availability to start a real customer conversation."
          primaryHref="/request/new"
          primaryLabel="Create request"
          secondaryHref="/listings/new"
          secondaryLabel="List a paddock"
        />
      </>
    );
  }

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
