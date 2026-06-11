import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/Button";
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
import { AgreementsClient } from "./AgreementsClient";

type SearchParams = {
  onboarded?: string;
};

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

  return (
    <>
      <PageHeader
        eyebrow="My work"
        title="Your work, by role."
        description="Livestock owners and landowners see their agreements; transport providers see their jobs."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

      <AgreementsClient
        currentUserProfile={currentUserProfile}
        realCounts={realCounts}
        realAgreements={agreementSummaries}
        showOnboardingWelcome={params.onboarded === "true"}
      />
    </>
  );
}
