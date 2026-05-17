import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import {
  agreements,
  farmers,
  paddockListings,
  transportJobs,
  type Farmer,
} from "@/lib/dummyData";
import {
  getCurrentUserProfile,
  type CurrentUserProfile,
} from "@/lib/supabase/currentUser";
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

function profileToFarmer(profile: CurrentUserProfile): Farmer {
  const inferredRole: Farmer["role"] = profile.accountTypes.includes(
    "Transport Provider"
  )
    ? "Transport Provider"
    : profile.accountTypes.includes("Landowner")
      ? "Landowner"
      : "Livestock Owner";
  return {
    id: profile.id,
    name: profile.fullName ?? profile.email ?? "Your account",
    role: inferredRole,
    region: profile.regions[0] ?? "Region not set",
    verified: false,
    tagline: "Signed in - your live PaddockME account.",
    bio: "Profile pulled from Supabase. Finish onboarding to set role and region; data here updates as you go.",
    mobileVerified: false,
    preparednessScore: 0,
    verifications: [],
    readiness: [],
  };
}

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

  const currentUserProfile = await getCurrentUserProfile();
  const signedInFarmer = currentUserProfile
    ? profileToFarmer(currentUserProfile)
    : null;
  const personaList = signedInFarmer ? [signedInFarmer, ...farmers] : farmers;

  const initialFarmerId = signedInFarmer
    ? signedInFarmer.id
    : hintedRole
      ? farmers.find((farmer) => farmer.role === hintedRole)?.id
      : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="Your work, by role."
        description="Switch personas to see how the home view adapts. Livestock owners and landowners see their agreements; transport providers see their jobs."
        action={<ButtonLink href="/request/new">New request</ButtonLink>}
      />

      <AgreementsClient
        farmers={personaList}
        agreements={agreements}
        transportJobs={transportJobs}
        listings={paddockListings}
        showOnboardingWelcome={showOnboardingWelcome}
        initialFarmerId={initialFarmerId}
      />
    </>
  );
}
