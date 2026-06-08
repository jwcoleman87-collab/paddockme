import { Route, Truck } from "lucide-react";
import { cookies } from "next/headers";
import { ButtonLink } from "@/components/Button";
import { PaddockMap, type PaddockMapMode } from "@/components/PaddockMap";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { agreements, farmers, transportJobs } from "@/lib/dummyData";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

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
    return (
      <>
        <PageHeader
          eyebrow="Operational map"
          title="Map."
          description="Live map layers will appear once you create requests, listings, agreements, or transport jobs."
        />
        <RealAccountEmptyState
          title="No live map records yet."
          body="Start with a request or paddock listing and PaddockME will build the map around real customer activity."
          primaryHref="/request/new"
          primaryLabel="Create request"
          secondaryHref="/listings/new"
          secondaryLabel="List a paddock"
        />
      </>
    );
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
