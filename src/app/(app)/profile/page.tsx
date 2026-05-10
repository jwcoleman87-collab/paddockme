"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display italic text-4xl text-sage-deep mb-2">
        Profile.
      </h1>
      <p className="text-bark/80 mb-6">Placeholder — profile, verifications, and account settings land here.</p>
      <button
        onClick={signOut}
        className="inline-flex items-center gap-2 rounded-full border border-sage-deep/30 px-5 py-3 font-medium text-sage-deep hover:bg-sage-mist transition"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
