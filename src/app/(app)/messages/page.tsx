import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listAgreementSummariesForUserServer,
  type AgreementSummary,
} from "@/lib/data/serverPaddocks";

export default async function MessagesPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fmessages");
  }

  // One thread per agreement workspace the user is party to.
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
              {summary.lastMessage && (
                <p className="mt-1 truncate text-sm text-bark/80">
                  {summary.lastMessage.senderName}: {summary.lastMessage.body}
                </p>
              )}
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
