import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { featuredFarmers } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const currentUserProfile = await getCurrentUserProfile();

  return (
    <>
      <PageHeader
        eyebrow="Profile and verification"
        title="Persona profiles."
        description="Three personas - one livestock owner, one landowner, one driver - sharing the same profile schema. The role and sub-profile carry the difference."
        action={<ButtonLink href="/agreements" variant="secondary">Back to agreements</ButtonLink>}
      />

      <ProfileClient farmers={featuredFarmers} currentUserProfile={currentUserProfile} />
    </>
  );
}
