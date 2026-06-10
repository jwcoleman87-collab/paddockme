import { Route, Truck } from "lucide-react";
import { cookies } from "next/headers";
import { ButtonLink } from "@/components/Button";
import { LiveMap, type LiveMapMarker, type LiveMapRoute } from "@/components/LiveMap";
import { PaddockMap, type PaddockMapMode } from "@/components/PaddockMap";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import {
  listAgreementRoutesForUserServer,
  listAgreementSummariesForUserServer,
  listSupabasePaddockListingsServer,
  listTransportJobsBoardServer,
} from "@/lib/data/serverPaddocks";
import { agreements, farmers, transportJobs } from "@/lib/dummyData";

type SearchParams = {
  mode?: string;
  agreement?: string;
  transport?: string;
  driver?: string;
  region?: string;
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    // Real map: live paddock pins + the user's agreement and transport routes.
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
            secondaryHref="/preview/paddocks"
            secondaryLabel="See how listings work"
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

  const mode = normaliseMode(params.mode);
  const agreementId = params.agreement ?? agreements[0]?.id;
  const transportId = params.transport ?? transportJobs[0]?.id;

  // The Driver map view is only useful to a transporter persona - it shows
  // the driver-perspective job radar. Livestock owners and landowners have
  // no reason to see it, so we hide the toggle for them. They can still
  // visit /map?mode=driver via URL if needed (e.g. the investor demo), but
  // it won't clutter the action bar.
  const personaCookie = (await cookies()).get("paddockme_persona")?.value;
  const activePersona = personaCookie
    ? farmers.find((farmer) => farmer.id === personaCookie)
    : undefined;
  const showDriverToggle = activePersona?.role === "Transport Provider";

  return (
    <>
      {mode === "driver" ? null : (
        <>
          <PageHeader
            eyebrow="Operational map"
            title="PaddockME control tower."
            description="A real map surface for paddock supply, livestock demand, agreement movement, driver jobs, and regional rain/feed pressure. Live GPS and weather APIs come later; the map architecture is ready for them."
            action={
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/map?mode=agreement&agreement=${agreementId}`} variant={mode === "agreement" ? "primary" : "secondary"}>
                  <Route className="h-4 w-4" aria-hidden />
                  Agreement
                </ButtonLink>
                {showDriverToggle && (
                  <ButtonLink href={`/map?mode=driver&transport=${transportId}&driver=driver-1`} variant="secondary">
                    <Truck className="h-4 w-4" aria-hidden />
                    Driver
                  </ButtonLink>
                )}
              </div>
            }
          />
        </>
      )}
      <PaddockMap
        mode={mode}
        agreementId={agreementId}
        transportId={transportId}
        driverId={params.driver ?? "driver-1"}
        region={params.region}
      />
    </>
  );
}

function normaliseMode(value?: string): PaddockMapMode {
  if (value === "agreement" || value === "driver") return value;
  return "regional";
}
