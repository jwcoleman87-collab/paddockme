import { redirect } from "next/navigation";
import { PaddockHomepage } from "./PaddockHomepage";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

/**
 * Screen 1 — Homepage (guided-workflow MVP rebuild).
 *
 * Signed-out visitors see the guided marketing homepage. Signed-in users
 * are sent straight into the real app (same landing spot as a fresh
 * sign-in) so "/" never feels like a separate, older site.
 */
export default async function HomePage() {
  const profile = await getCurrentUserProfile();
  if (profile) {
    redirect("/agreements");
  }

  return <PaddockHomepage />;
}
