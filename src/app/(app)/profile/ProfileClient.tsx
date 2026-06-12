"use client";

import { Mail, UserRound } from "lucide-react";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { StatusBadge } from "@/components/StatusBadge";
import type { CurrentUserProfile } from "@/lib/supabase/currentUser";

/**
 * Production profile view. The demo persona browser (role
 * switching) is retired with demo mode; this renders the signed-in user's
 * live profile record only. Public profile mode (spec §6.14) is a future
 * brief - logged in SPEC_DRIFT.md.
 */
export function ProfileClient({
  currentUserProfile,
}: {
  currentUserProfile?: CurrentUserProfile | null;
}) {
  if (!currentUserProfile) return null;
  return <ProfileSummary profile={currentUserProfile} />;
}

function ProfileSummary({ profile }: { profile: CurrentUserProfile }) {
  const accountTypes = formatList(profile.accountTypes);
  const regions = formatList(profile.regions);
  const stockTypes = formatList(profile.stockTypes);

  return (
    <Card className="mb-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              Your profile
            </span>
            <StatusBadge tone="success">Signed in</StatusBadge>
          </div>
          <h2 className="text-2xl font-bold text-sage-deep">
            {profile.fullName ?? "Profile name pending"}
          </h2>
          {profile.email && (
            <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-semibold text-bark/70">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{profile.email}</span>
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:min-w-[28rem]">
          <InfoTile label="Account types" value={accountTypes} />
          <InfoTile label="Regions" value={regions} />
          <InfoTile label="Stock types" value={stockTypes} />
        </div>
      </div>
    </Card>
  );
}

function formatList(values: string[]) {
  return values.length ? values.join(", ") : "Not set";
}
