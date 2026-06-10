import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
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
import {
  listAgreementSummariesForUserServer,
  type AgreementSummary,
} from "@/lib/data/serverPaddocks";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    // Real inbox: one thread per agreement workspace the user is party to.
    // This page used to be a hardcoded empty state, which meant signed-in
    // users could never find their conversations again.
    const summaries = await listAgreementSummariesForUserServer();
    return (
      <>
        <PageHeader
          eyebrow="Messages"
          title="Your conversations."
          description="Every agreement workspace you're part of. The latest message lives on top."
        />
        {summaries.length === 0 ? (
          <RealAccountEmptyState
            title="No live conversations yet."
            body="Create a request, listing, or transport availability to start a real customer conversation."
            primaryHref="/request/new"
            primaryLabel="Create request"
            secondaryHref="/listings/new"
            secondaryLabel="List a paddock"
          />
        ) : (
          <RealThreadList summaries={summaries} />
        )}
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

function RealThreadList({ summaries }: { summaries: AgreementSummary[] }) {
  return (
    <div className="space-y-3">
      {summaries.map((summary) => (
        <Link
          key={summary.id}
          href={`/workspace/${summary.id}`}
          className="block rounded-2xl border border-mist bg-warm-white p-4 transition hover:border-sage/40 hover:bg-sage-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="truncate text-base font-bold text-sage-deep">
                  {summary.otherPartyName}
                </p>
                <span className="text-xs font-semibold uppercase tracking-wide text-bark/55">
                  {summary.status}
                </span>
              </div>
              <p className="truncate text-sm text-bark/70">
                {summary.listingTitle}
              </p>
              <p className="mt-1 truncate text-sm text-bark/80">
                {summary.lastMessage
                  ? `${summary.lastMessage.senderName}: ${summary.lastMessage.body}`
                  : "No messages yet - say g'day."}
              </p>
            </div>
            <ArrowRight
              className="mt-1 h-4 w-4 shrink-0 text-sage-deep"
              aria-hidden
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
