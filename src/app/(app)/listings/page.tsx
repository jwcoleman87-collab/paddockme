import { CirclePlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { paddockListings } from "@/lib/dummyData";
import { listSupabasePaddockListingsServer } from "@/lib/data/serverPaddocks";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { ListingsClient, type InitialFilters } from "./ListingsClient";

type SearchParams = {
  stock?: string;
  regions?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  // For a real signed-in account we never want to surface the prototype
  // Dale/Brett/Wayne seed paddocks. Read whatever live listings exist via
  // the repository (Supabase + local-only rows the user has created) and
  // either render them or show the empty-state invite.
  if (currentUserProfile) {
    const live = await listSupabasePaddockListingsServer();
    if (live.length === 0) {
      return (
        <>
          <PageHeader
            eyebrow="Available paddocks"
            title="Paddocks that could take stock."
            description="Once landowners list paddocks they will appear here."
            action={
              <ButtonLink href="/listings/new">
                <CirclePlus className="h-4 w-4" aria-hidden />
                Create listing
              </ButtonLink>
            }
          />
          <RealAccountEmptyState
            title="No paddocks listed yet."
            body="Be the first to publish a paddock, or invite landowners you know to list theirs. Real listings will appear here as they come in."
            primaryHref="/listings/new"
            primaryLabel="List a paddock"
            secondaryHref="/preview/paddocks"
            secondaryLabel="See how listings work"
          />
        </>
      );
    }
    return (
      <>
        <PageHeader
          eyebrow="Available paddocks"
          title="Paddocks that could take stock."
          description="Filter by region, stock fit, feed, water, fencing, and verification."
          action={
            <ButtonLink href="/listings/new">
              <CirclePlus className="h-4 w-4" aria-hidden />
              Create listing
            </ButtonLink>
          }
        />
        <ListingsClient
          listings={live}
          initialFilters={initialFiltersFrom(params)}
          realAccount
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Available paddocks"
        title="Paddocks that could take stock."
        description="Filter by region, stock fit, feed, water, fencing, and verification. Chips AND across groups so each one you tap narrows the shortlist."
        action={
          <ButtonLink href="/listings/new">
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create listing
          </ButtonLink>
        }
      />

      <ListingsClient
        listings={paddockListings}
        initialFilters={initialFiltersFrom(params)}
      />
    </>
  );
}

function initialFiltersFrom(params: SearchParams): InitialFilters {
  const initialFilters: InitialFilters = {};
  if (params.stock) {
    initialFilters.stockTypes = [params.stock];
  }
  if (params.regions) {
    initialFilters.regions = params.regions
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return initialFilters;
}
