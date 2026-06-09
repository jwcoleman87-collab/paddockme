import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  agreements,
  featuredFarmers,
  paddockListings,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  countAgreementsForUserServer,
  listLivestockRequestsServer,
  listMyPaddockListingsServer,
  listSupabasePaddockListingsServer,
} from "@/lib/data/serverPaddocks";
import { AgreementsClient } from "./AgreementsClient";

type SearchParams = {
  onboarded?: string;
  role?: string;
};

const roleToProfileRole: Record<string, Farmer["role"]> = {
  livestock: "Livestock Owner",
  landowner: "Landowner",
  transport: "Transport Provider",
};

export default async function AgreementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  let realCounts:
    | {
        paddocks: number;
        requests: number;
        transport: number;
        agreements: number;
        myListings: number;
      }
    | undefined;
  if (currentUserProfile) {
    const [paddocks, myListings, requests, agreementCount] = await Promise.all([
      listSupabasePaddockListingsServer(),
      listMyPaddockListingsServer(),
      listLivestockRequestsServer(),
      countAgreementsForUserServer(),
    ]);
    realCounts = {
      paddocks: paddocks.length,
      myListings: myListings.length,
      requests: requests.length,
      transport: 0,
      agreements: agreementCount,
    };
  }
  const showOnboardingWelcome = params.onboarded === "true";
  const hintedRole = params.role
    ? roleToProfileRole[params.role]
    : undefined;

  const initialFarmerId = hintedRole
    ? featuredFarmers.find((farmer) => farmer.role === hintedRole)?.id
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="My work"
        title="Your work, by role."
        description="Livestock owners and landowners see their agreements; transport providers see their jobs."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

      <AgreementsClient
        farmers={featuredFarmers}
        agreements={agreements}
        transportJobs={transportJobs}
        listings={paddockListings}
        currentUserProfile={currentUserProfile}
        realCounts={realCounts}
        showOnboardingWelcome={showOnboardingWelcome}
        initialFarmerId={initialFarmerId}
      />
    </>
  );
}
