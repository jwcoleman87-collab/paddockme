import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { LandingMarketing } from "./LandingMarketing";

/**
 * Public marketing landing. Signed-in users skip it entirely and go
 * straight to the app shell - showing "Log in" + sign-up CTAs to someone
 * who is already logged in is confusing.
 */
export default async function HomePage() {
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    redirect("/agreements");
  }
  return <LandingMarketing />;
}
