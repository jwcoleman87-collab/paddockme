import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listAgreementSummariesForUserServer,
  type AgreementSummary,
} from "@/lib/data/serverPaddocks";
import type { AgreementLifecycleState } from "@/lib/dummyData";

const lifecycleTone: Record<
  AgreementLifecycleState,
  "success" | "warning" | "info" | "neutral"
> = {
  Draft: "neutral",
  Negotiating: "warning",
  "Ready to finalise": "info",
  Active: "success",
  Completed: "info",
  Cancelled: "neutral",
};

/** Plain-language "where this agistment is up to" line, by lifecycle stage. */
const lifecycleHint: Record<AgreementLifecycleState, string> = {
  Draft: "Just started — open to set the terms.",
  Negotiating: "Terms under discussion — some sections still need both parties to agree.",
  "Ready to finalise": "All terms agreed — ready to finalise and arrange transport.",
  Active: "Live agreement — share records and track transport here.",
  Completed: "Agistment complete.",
  Cancelled: "This agreement was cancelled.",
};

/** Photos cycled through the cards so the list feels alive. */
const cardImages = [
  "/images/paddockme/workspace-cattle.jpg",
  "/images/paddockme/workspace-property.jpg",
  "/images/paddockme/matches-paddock-card.jpg",
  "/images/paddockme/matches-riverbend-card.jpg",
];

/**
 * Workspace index — the "all my agistments" dashboard.
 *
 * The Workspace tab used to bounce straight into the most recent agreement;
 * it now lists every agreement the signed-in user is a party to so they can
 * see where each deal is up to and click into the one they want. Each card
 * opens the per-agreement workspace at /workspace/[id].
 */
export default async function WorkspaceIndexPage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fworkspace");
  }

  const summaries = await listAgreementSummariesForUserServer();

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-5">
        <h1 className="text-xl font-extrabold text-sage-deep sm:text-2xl">
          Your workspaces
        </h1>
        <p className="mt-1 text-sm text-bark/70">
          Every agistment you&apos;re part of. Open one to share records, track
          where it&apos;s up to, and message the other party.
        </p>
      </header>

      {summaries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {summaries.map((agreement, index) => (
            <li key={agreement.id}>
              <WorkspaceCard agreement={agreement} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkspaceCard({
  agreement,
  index,
}: {
  agreement: AgreementSummary;
  index: number;
}) {
  const status = agreement.status as AgreementLifecycleState;
  return (
    <Link
      href={`/workspace/${agreement.id}`}
      className="group block h-full overflow-hidden rounded-[8px] border border-sage-deep/10 bg-warm-white shadow-[0_10px_28px_rgba(31,42,36,0.04)] transition duration-200 ease-in-out hover:border-sage/35 hover:shadow-[0_16px_36px_rgba(31,42,36,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <div
        className="h-32 w-full bg-cover bg-center transition-transform duration-200 ease-in-out group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${cardImages[index % cardImages.length]})` }}
        aria-hidden
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-sage-deep">
              {agreement.listingTitle}
            </p>
            <p className="mt-0.5 text-sm text-bark/75">
              With {agreement.otherPartyName} · you are the{" "}
              {agreement.viewerRole.toLowerCase()}
            </p>
          </div>
          <StatusBadge tone={lifecycleTone[status] ?? "neutral"}>
            {agreement.status}
          </StatusBadge>
        </div>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-bark/70">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
          <span>{lifecycleHint[status] ?? "Open to see where this is up to."}</span>
        </p>

        {agreement.lastMessage && (
          <p className="mt-2 truncate text-sm text-bark/60">
            {agreement.lastMessage.senderName}: {agreement.lastMessage.body}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sage-deep">
          Open workspace
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sage-deep/20 bg-warm-white px-6 py-12 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        <Sparkles className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-bold text-sage-deep">No workspaces yet</h2>
      <p className="max-w-sm text-sm text-bark/70">
        When you match with a paddock and start an agreement, it shows up here
        so you can manage every agistment in one place.
      </p>
      <ButtonLink href="/matches" className="mt-1">
        Find a paddock
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </section>
  );
}
