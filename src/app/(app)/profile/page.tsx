import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fprofile");
  }

  return (
    <>
      <PageHeader
        eyebrow="Profile and verification"
        title="Your profile."
        description="Your account details, roles, and regions as other parties will rely on them."
        action={<ButtonLink href="/agreements" variant="secondary">Back to dashboard</ButtonLink>}
      />

      <ProfileClient currentUserProfile={currentUserProfile} />
    </>
  );
}
