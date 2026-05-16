import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { farmers, type Farmer } from "@/lib/dummyData";
import {
  getCurrentUserProfile,
  type CurrentUserProfile,
} from "@/lib/supabase/currentUser";
import { ProfileClient } from "./ProfileClient";

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
    tagline: "Signed in - your live PaddockME profile.",
    bio: "Pulled from Supabase. Verification placeholders below remain blank until those services land - the schema is in place to receive them.",
    mobileVerified: false,
    preparednessScore: 0,
    verifications: [
      {
        label: "Email verified",
        status: profile.email ? "Verified" : "Not started",
        detail: profile.email ?? undefined,
      },
      {
        label: "Mobile verified",
        status: "Not started",
      },
      {
        label: "ABN",
        status: "Not started",
      },
      {
        label: "PIC of origin",
        status: "Not started",
      },
    ],
    readiness: [
      { label: "Account created", complete: true },
      {
        label: "Onboarding completed",
        complete:
          profile.accountTypes.length > 0 || profile.regions.length > 0,
      },
      { label: "First request or listing posted", complete: false },
    ],
  };
}

export default async function ProfilePage() {
  const currentUserProfile = await getCurrentUserProfile();
  const signedInFarmer = currentUserProfile
    ? profileToFarmer(currentUserProfile)
    : null;
  const personaList = signedInFarmer ? [signedInFarmer, ...farmers] : farmers;

  return (
    <>
      <PageHeader
        eyebrow="Profile and verification"
        title="Persona profiles."
        description="Six personas across livestock, land and transport. Same profile schema - the role and the sub-profile carry the difference between Wayne (single-truck) and Sharon (multi-truck)."
        action={<ButtonLink href="/agreements" variant="secondary">Back to agreements</ButtonLink>}
      />

      <ProfileClient farmers={personaList} />
    </>
  );
}
