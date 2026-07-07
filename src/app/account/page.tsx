"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle2, RotateCcw, CheckCircle2, Circle } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoLivestockOwner } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  needUntilLabel,
} from "@/lib/paddockmeWorkflow";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type BetaProfile = {
  fullName: string | null;
  email: string | null;
  accountTypes: string[];
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * Profile / account screen. In private-beta mode it displays the signed-in
 * Supabase profile; without Supabase env/session it keeps the guided demo
 * identity so the visual flow remains available.
 */
export default function AccountPage() {
  const router = useRouter();
  const { state, isComplete, resetWorkflow } = usePaddockmeWorkflow();
  const { agreement } = state;
  const [profile, setProfile] = useState<BetaProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!isSupabaseConfigured()) {
        if (isActive) setAuthChecked(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isActive) setAuthChecked(true);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const metadataName =
        typeof metadata.full_name === "string" ? metadata.full_name : null;
      const metadataAccountTypes = stringArray(metadata.account_types);

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name, account_types")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileRow) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name: metadataName,
            account_types: metadataAccountTypes,
          },
          { onConflict: "id" },
        );
      }

      if (!isActive) return;
      setProfile({
        fullName: profileRow?.full_name ?? metadataName,
        email: user.email ?? null,
        accountTypes: profileRow?.account_types ?? metadataAccountTypes,
      });
      setAuthChecked(true);
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const progressItems = [
    { label: "Price agreed", done: agreement.priceAgreed },
    { label: "Dates confirmed", done: agreement.datesConfirmed },
    { label: "Payment terms confirmed", done: agreement.paymentTermsConfirmed },
    { label: "Transport arranged", done: agreement.transportArranged },
  ];

  const accountName =
    profile?.fullName || profile?.email || demoLivestockOwner.name;
  const accountMeta = profile
    ? [profile.email, profile.accountTypes.join(", ")].filter(Boolean).join(" - ")
    : `${demoLivestockOwner.location} - Member since ${demoLivestockOwner.memberSince}`;
  const statusLabel = profile
    ? "Signed in (beta)"
    : authChecked
      ? "Demo mode"
      : "Checking session";

  function handleReset() {
    resetWorkflow();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white">
              <UserCircle2 className="h-8 w-8" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-pm-charcoal">
                {accountName}
              </h1>
              <p className="text-sm text-pm-muted">{accountMeta}</p>
            </div>
            <span className="ml-auto rounded-full bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
              {statusLabel}
            </span>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Your current request
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-pm-muted">Livestock</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {livestockLabel(state.request)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-pm-muted">Location</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {state.request.location}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-pm-muted">Timing</dt>
                <dd className="text-sm font-bold text-pm-charcoal">
                  {needUntilLabel(state.request)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Agreement progress
            </h2>
            <ul className="mt-3 space-y-2">
              {progressItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-2 text-sm"
                >
                  {item.done ? (
                    <CheckCircle2
                      className="h-4 w-4 text-pm-success"
                      aria-hidden
                    />
                  ) : (
                    <Circle className="h-4 w-4 text-pm-muted" aria-hidden />
                  )}
                  <span
                    className={
                      item.done ? "text-pm-charcoal" : "text-pm-muted"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <PmButton
              href={
                isComplete
                  ? "/workspaces/1023/live"
                  : "/workspaces/1023/agreement"
              }
              variant="outline"
              className="mt-4"
            >
              {isComplete ? "View Live Agreement" : "Continue Agreement"}
            </PmButton>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Workflow controls
            </h2>
            <p className="mt-1 text-sm text-pm-muted">
              Reset the guided agistment request and agreement back to their
              starting state.
            </p>
            <PmButton variant="ghost" className="mt-3" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset Workflow
            </PmButton>
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
