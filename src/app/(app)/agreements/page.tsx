import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  agreements,
  featuredFarmers,
  paddockListings,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
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
        showOnboardingWelcome={showOnboardingWelcome}
        initialFarmerId={initialFarmerId}
      />
    </>
  );
}
