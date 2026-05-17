import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { farmers } from "@/lib/dummyData";
import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Profile and verification"
        title="Persona profiles."
        description="Six personas across livestock, land and transport. Same profile schema - the role and the sub-profile carry the difference between Wayne (single-truck) and Sharon (multi-truck)."
        action={<ButtonLink href="/agreements" variant="secondary">Back to agreements</ButtonLink>}
      />

      <ProfileClient farmers={farmers} />
    </>
  );
}
