import { redirect } from "next/navigation";
import { LiveMap, type LiveMapMarker, type LiveMapRoute } from "@/components/LiveMap";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listAgreementRoutesForUserServer,
  listAgreementSummariesForUserServer,
  listSupabasePaddockListingsServer,
  listTransportJobsBoardServer,
} from "@/lib/data/serverPaddocks";

type SearchParams = {
  agreement?: string;
  transport?: string;
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Fmap");
  }

  // Live map: real paddock pins + the user's agreement and transport routes.
  const [paddocks, agreementSummaries, agreementRoutes, jobs] =
    await Promise.all([
      listSupabasePaddockListingsServer(),
      listAgreementSummariesForUserServer(),
      listAgreementRoutesForUserServer(),
      listTransportJobsBoardServer(),
    ]);

  const markers: LiveMapMarker[] = paddocks.flatMap((paddock) =>
    paddock.coordinates
      ? [
          {
            id: `paddock-${paddock.id}`,
            latitude: paddock.coordinates.latitude,
            longitude: paddock.coordinates.longitude,
            title: paddock.title,
            subtitle: `${paddock.acres} acres · ${paddock.region}`,
            href: `/listings/${paddock.id}`,
          },
        ]
      : []
  );

  const summaryById = new Map(
    agreementSummaries.map((summary) => [summary.id, summary])
  );
  const routes: LiveMapRoute[] = [];
  for (const route of agreementRoutes) {
    if (!route.from || !route.to) continue;
    const summary = summaryById.get(route.id);
    routes.push({
      id: `agreement-${route.id}`,
      title: summary?.listingTitle ?? "Agreement route",
      subtitle: summary
        ? `With ${summary.otherPartyName} · ${route.status}`
        : route.status,
      href: `/workspace/${route.id}`,
      from: route.from,
      to: route.to,
      fromAddress: route.fromAddress,
      toAddress: route.toAddress,
      tone: "active",
    });
  }
  for (const job of jobs) {
    if (!job.pickupPoint || !job.destinationPoint) continue;
    routes.push({
      id: `transport-${job.id}`,
      title: job.routeSummary,
      subtitle: `${job.livestockCount} · ${formatJobStatus(job.status)}`,
      href: `/transport/${job.id}`,
      from: job.pickupPoint,
      to: job.destinationPoint,
      fromAddress: job.pickup,
      toAddress: job.destination,
      tone: job.status === "available" ? "available" : "active",
    });
  }

  const hasContent = markers.length > 0 || routes.length > 0;
  const focusRouteId = params.agreement
    ? `agreement-${params.agreement}`
    : params.transport
      ? `transport-${params.transport}`
      : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Map"
        title="Your paddocks and routes."
        description="Live paddocks across the marketplace, plus your agreement and transport routes. Tap a pin or route for details."
      />
      {hasContent ? (
        <div className="space-y-3">
          <LiveMap
            markers={markers}
            routes={routes}
            focusRouteId={focusRouteId}
          />
          <p className="text-xs font-semibold text-bark/65">
            Pins: paddocks · Green routes: your agreements and accepted
            transport · Amber routes: transport waiting for a carrier.
          </p>
        </div>
      ) : (
        <RealAccountEmptyState
          title="Nothing to map yet."
          body="Once you have live paddocks, agreements, or transport routes, they'll show on the map here."
          primaryHref="/listings"
          primaryLabel="Browse paddocks"
          secondaryHref="/request/new"
          secondaryLabel="Post a request"
        />
      )}
    </>
  );
}

function formatJobStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
