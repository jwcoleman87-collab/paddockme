import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  countAgreementsForUserServer,
  listAgreementSummariesForUserServer,
  listLivestockRequestsServer,
  listMyPaddockListingsServer,
  listSupabasePaddockListingsServer,
  listTransportJobsBoardServer,
} from "@/lib/data/serverPaddocks";
import { AgreementsClient, type DashboardNextAction } from "./AgreementsClient";

type SearchParams = {
  onboarded?: string;
};

const ACTIVE_MOVEMENT_STATUSES = ["accepted", "loading", "in_transit", "arrived"];
const OPEN_AGREEMENT_STATUSES = ["Draft", "Negotiating", "Ready to finalise"];

export default async function AgreementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fagreements");
  }

  const [
    paddocks,
    myListings,
    requests,
    agreementCount,
    agreementSummaries,
    transportJobsBoard,
  ] = await Promise.all([
    listSupabasePaddockListingsServer(),
    listMyPaddockListingsServer(),
    listLivestockRequestsServer(),
    countAgreementsForUserServer(),
    listAgreementSummariesForUserServer(),
    listTransportJobsBoardServer(),
  ]);
  const realCounts = {
    paddocks: paddocks.length,
    myListings: myListings.length,
    requests: requests.length,
    transport: transportJobsBoard.length,
    agreements: agreementCount,
  };

  // One visually primary next step, in loop order: an active movement beats
  // an unresolved agreement beats the role's starting action (spec ss6.3).
  const activeJob = transportJobsBoard.find(
    (job) =>
      job.relation === "mine" && ACTIVE_MOVEMENT_STATUSES.includes(job.status)
  );
  const pendingAgreement = agreementSummaries.find((summary) =>
    OPEN_AGREEMENT_STATUSES.includes(summary.status)
  );

  let nextAction: DashboardNextAction;
  if (activeJob) {
    nextAction = {
      title: activeJob.routeSummary,
      detail: `Movement ${formatJobStatus(activeJob.status)} - follow the milestones live.`,
      ctaLabel: "Track your stock",
      ctaHref: `/transport/${activeJob.id}`,
    };
  } else if (pendingAgreement) {
    nextAction = {
      title: `${pendingAgreement.listingTitle} · with ${pendingAgreement.otherPartyName}`,
      detail: `${pendingAgreement.status} - resolve the open sections to lock the deal in.`,
      ctaLabel: "Resolve agreement",
      ctaHref: `/workspace/${pendingAgreement.id}`,
    };
  } else {
    const role = currentUserProfile.accountTypes[0] ?? "Livestock Owner";
    if (role === "Landowner") {
      nextAction = {
        title: realCounts.myListings > 0
          ? "Keep your paddocks in front of livestock owners."
          : "List your first paddock.",
        detail:
          "Open livestock requests are waiting - a listed paddock can be matched the same day.",
        ctaLabel: "List a paddock",
        ctaHref: "/listings/new",
      };
    } else if (role === "Transport Provider") {
      nextAction = {
        title: "Livestock routes are waiting for carriers.",
        detail:
          "Open the RFT board to see live movements raised from agistment agreements.",
        ctaLabel: "Open the RFT board",
        ctaHref: "/transport/jobs",
      };
    } else {
      nextAction = {
        title: "Start your next agistment search.",
        detail:
          "Tell us the stock, numbers and where - matching starts straight away.",
        ctaLabel: "Post a request",
        ctaHref: "/request/new",
      };
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="My work"
        title="Your work at a glance."
        description="Your live agreements and movements, with the one thing that needs you next."
      />
      <AgreementsClient
        currentUserProfile={currentUserProfile}
        nextAction={nextAction}
        realCounts={realCounts}
        realAgreements={agreementSummaries}
        showOnboardingWelcome={params.onboarded === "true"}
      />
    </>
  );
}

function formatJobStatus(status: string): string {
  return status.replace(/_/g, " ");
}
