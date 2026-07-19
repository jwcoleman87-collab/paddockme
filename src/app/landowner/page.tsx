"use client";

import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmAvatar } from "@/components/paddockme/PmAvatar";
import { PmButton } from "@/components/paddockme/PmButton";
import {
  demoLandowner,
  demoLivestockOwner,
  demoRequest,
  demoWorkspace,
} from "@/lib/paddockmeDemoData";
import { livestockLabel, usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/**
 * Landowner guided-demo hub — John's front door. Surfaces his paddock
 * listing, the incoming request waiting on him, and his existing
 * agreements, all in one place, instead of dropping him straight onto a
 * single accept/decline screen with nowhere else to go.
 */
export default function LandownerHubPage() {
  const { state } = usePaddockmeWorkflow();
  const { paddockListed, listing } = state.landowner;

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
            <PmAvatar
              src={demoLandowner.avatar}
              initials="JS"
              className="h-14 w-14"
              fallbackClassName="bg-pm-green-900 text-white text-lg"
            />
            <div>
              <h1 className="text-xl font-extrabold text-pm-charcoal">
                {demoLandowner.name}
              </h1>
              <p className="text-sm text-pm-muted">
                Member since {demoLandowner.memberSince} &middot; &#9733;{" "}
                {demoLandowner.rating}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Your paddock
            </h2>
            {paddockListed && listing ? (
              <>
                <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-pm-muted">Acres</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {listing.acres}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Stock accepted</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {listing.stockTypesAccepted.join(", ") || "None selected"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Rate</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {listing.ratePerHeadWeek}/head/week
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Water</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {listing.waterAvailability}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Fencing</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {listing.fencingCondition}
                    </dd>
                  </div>
                </dl>
                <PmButton
                  href="/landowner/listings/new"
                  variant="outline"
                  className="mt-4"
                >
                  Edit listing
                </PmButton>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-pm-muted">
                  List your paddock capacity so incoming requests are
                  matched to what you can actually offer.
                </p>
                <PmButton href="/landowner/listings/new" className="mt-3">
                  List your paddock
                </PmButton>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              New request
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-pm-cream-50 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-pm-green-900">
                  {livestockLabel(state.request)}
                </p>
                <p className="text-xs text-pm-muted">
                  {demoLivestockOwner.name} &middot; Located near{" "}
                  {state.request.location}
                </p>
              </div>
              <PmButton
                href={`/landowner/requests/${demoRequest.id}`}
                variant="outline"
              >
                Review request
              </PmButton>
            </div>
          </div>

          <div className="mt-6 border-t border-pm-border pt-6">
            <h2 className="text-sm font-bold text-pm-charcoal">
              Your agreements
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-pm-cream-50 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-pm-charcoal">
                  {demoWorkspace.title}
                </p>
                <p className="text-xs text-pm-muted">
                  {demoWorkspace.parties} &middot; {demoWorkspace.status}
                </p>
              </div>
              <PmButton
                href={`/workspaces/${demoWorkspace.id}`}
                variant="outline"
              >
                Open workspace
              </PmButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
