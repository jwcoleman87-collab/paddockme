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
        title="Profile records."
        description="Manage the people involved in the agreement: livestock owner, landowner, and driver."
        action={<ButtonLink href="/agreements" variant="secondary">Back to agreements</ButtonLink>}
      />

      <ProfileClient farmers={featuredFarmers} currentUserProfile={currentUserProfile} />
    </>
  );
}
