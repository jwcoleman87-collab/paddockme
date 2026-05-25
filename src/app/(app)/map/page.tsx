import { Route, Truck } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { GoogleOperationalMap } from "@/components/GoogleOperationalMap";
import { PaddockMap, type PaddockMapMode } from "@/components/PaddockMap";
import { PageHeader } from "@/components/PageHeader";
import { PersonaIntroBanner } from "@/components/PersonaIntroBanner";
import { agreements, transportJobs } from "@/lib/dummyData";

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
  const mode = normaliseMode(params.mode);
  const agreementId = params.agreement ?? agreements[0]?.id;
  const transportId = params.transport ?? transportJobs[0]?.id;
  // Prefer the Vercel env var (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) so the
  // production key can be rotated without a code change. Falls back to a
  // baked default for the investor demo — restricted by HTTP referrer in
  // Google Cloud Console to paddockme-oz51.vercel.app + localhost.
  const googleApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    "AIzaSyAG3EVoUUNfk0amP7J40Dy1NpmGG3_1L18";
  const useGoogle = !!googleApiKey && mode !== "driver";

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
                <ButtonLink href={`/map?mode=driver&transport=${transportId}&driver=driver-1`} variant="secondary">
                  <Truck className="h-4 w-4" aria-hidden />
                  Driver
                </ButtonLink>
              </div>
            }
          />
          <PersonaIntroBanner page="map" />
        </>
      )}
      {useGoogle ? (
        <GoogleOperationalMap
          apiKey={googleApiKey}
          highlightTransportId={transportId}
          highlightDriverId={params.driver ?? "driver-1"}
        />
      ) : (
        <PaddockMap
          mode={mode}
          agreementId={agreementId}
          transportId={transportId}
          driverId={params.driver ?? "driver-1"}
          region={params.region}
        />
      )}
    </>
  );
}

function normaliseMode(value?: string): PaddockMapMode {
  if (value === "agreement" || value === "driver") return value;
  return "regional";
}
