import { redirect } from "next/navigation";
import { LandingMarketing } from "./LandingMarketing";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

/**
 * Screen 1 — Homepage.
 *
 * Signed-out visitors see the marketing homepage with quick-start links
 * (Need agistment / Have agistment / Need transport). Signed-in users are
 * sent straight into the real app (same landing spot as a fresh sign-in)
 * so "/" never feels like a separate, older site.
 */
export default async function HomePage() {
  const profile = await getCurrentUserProfile();
  if (profile) {
    redirect("/agreements");
  }

  return <LandingMarketing />;
}
