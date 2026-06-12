"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Truck } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { offerPaddockForRequest } from "@/lib/data/repositories";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";
import type {
  Farmer,
  LivestockRequest,
  PaddockListing,
} from "@/lib/dummyData";

type Props = {
  requests: LivestockRequest[];
  requestersById: Record<string, Farmer>;
  /** All published paddock listings; the client filters to the active
   * persona's so the "Offer a paddock" picker lists only what they own. */
  paddockListings: PaddockListing[];
  /** Supabase user id when signed in - used instead of the old browser
   * persona so real landowners always see their own paddocks here. */
  currentUserId?: string;
};

/**
 * Landowner-side marketplace: browse open livestock requests.
 *
 * Mirror surface to /transport/jobs (drivers' RFT board) and
 * /listings (livestock owners browsing paddocks). Closes the third leg of
 * the marketplace symmetry so landowners can proactively offer paddocks
 * against open requests rather than waiting to be found.
 */
export function RequestsClient({
  requests,
  requestersById,
  paddockListings,
  currentUserId,
}: Props) {
  const router = useRouter();
  const flash = useFlash();

  const myPaddocks = useMemo(
    () =>
      currentUserId
        ? paddockListings.filter((listing) => listing.ownerId === currentUserId)
        : [],
    [paddockListings, currentUserId]
  );

  async function offerPaddock(request: LivestockRequest, listingId: string) {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/sign-in?next=${encodeURIComponent("/requests")}`);
        return;
      }
    }
    const { agreement } = await offerPaddockForRequest(request.id, listingId);
    if (!agreement) {
      flash(
        "Couldn't open the agreement workspace. Refresh and try again.",
        "warning"
      );
      return;
    }
    const requester = requestersById[request.requesterId];
    flash(
      `Workspace opened with ${
        requester?.name.split(" ")[0] ?? "the livestock owner"
      }. Confirm the open sections to lock the deal in.`,
      "success"
    );
    router.push(`/workspace/${agreement.id}`);
  }

  return (
    <>
      <p className="mb-3 text-sm font-medium text-bark/75">
        {requests.length} open {requests.length === 1 ? "request" : "requests"}
      </p>

      {requests.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              requester={requestersById[request.requesterId]}
              myPaddocks={myPaddocks}
              onOffer={(listingId) => offerPaddock(request, listingId)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <h3 className="text-lg font-bold text-sage-deep">
            No open requests.
          </h3>
        </Card>
      )}
    </>
  );
}

function RequestCard({
  request,
  requester,
  myPaddocks,
  onOffer,
}: {
  request: LivestockRequest;
  requester?: Farmer;
  myPaddocks: PaddockListing[];
  onOffer: (listingId: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-3">
        {requester && (
          <Avatar
            name={requester.name}
            src={requester.avatarUrl}
            size="md"
            className="shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
            {requester?.name ?? "Livestock owner"}
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-sage-deep">
            {request.headCount} {request.breed}
          </h3>
          <p className="text-sm text-bark/85">{request.stockType}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile
          tone="subtle"
          size="sm"
          label="Duration"
          value={request.duration}
        />
        <InfoTile
          tone="subtle"
          size="sm"
          label="Transport"
          value={
            request.transportRequired === "Yes"
              ? "Needs transport"
              : request.transportRequired === "No"
                ? "Self-haul"
                : "Unsure"
          }
        />
      </div>

      <p
        className={cn(
          "rounded-xl border border-mist bg-warm-white px-3 py-2 text-sm leading-snug text-bark/85"
        )}
      >
        <MapPin className="-mt-0.5 mr-1 inline h-3.5 w-3.5 text-sage-deep" aria-hidden />
        Preferred regions: {request.preferredRegions.join(", ") || "Anywhere"}
      </p>

      {request.transportRequired === "Yes" && (
        <p className="flex items-start gap-1.5 text-xs font-semibold text-stone">
          <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-deep" aria-hidden />
          Driver will need to be sourced - raise an RFT from the agreement workspace.
        </p>
      )}

      {pickerOpen && myPaddocks.length > 0 && (
        <div
          aria-label="Pick a paddock to offer"
          className="rounded-xl border border-sage-deep/15 bg-cream/55 p-3"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-bark/65">
            Pick a paddock to offer
          </p>
          <ul className="space-y-1.5">
            {myPaddocks.map((paddock) => (
              <li key={paddock.id}>
                <button
                  type="button"
                  onClick={() => onOffer(paddock.id)}
                  className="flex w-full min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg border border-mist bg-warm-white px-3 text-left text-sm transition hover:border-sage/40 hover:bg-sage-mist/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-sage-deep">
                      {paddock.title}
                    </span>
                    <span className="block truncate text-xs text-bark/65">
                      {paddock.location}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-sage-deep">
                    Offer →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setPickerOpen(false)}
            className="mt-2 cursor-pointer text-xs font-bold text-bark/65 underline-offset-2 hover:text-sage-deep hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {myPaddocks.length > 0 ? (
          <Button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            className="min-h-10"
          >
            {pickerOpen ? "Hide paddocks" : "Offer a paddock"}
          </Button>
        ) : (
          <ButtonLink href="/listings/new" className="min-h-10">
            List a paddock to offer
          </ButtonLink>
        )}
        <ButtonLink href="/listings/new" variant="secondary" className="min-h-10">
          List a new paddock
        </ButtonLink>
      </div>
    </Card>
  );
}
