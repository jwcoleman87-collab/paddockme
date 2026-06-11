import { CirclePlus } from "lucide-react";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { listSupabasePaddockListingsServer } from "@/lib/data/serverPaddocks";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";
import { ListingsClient, type InitialFilters } from "./ListingsClient";

type SearchParams = {
  request?: string;
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
  if (!currentUserProfile) {
    redirect("/sign-in?next=%2Flistings");
  }

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
          secondaryHref="/requests"
          secondaryLabel="See open livestock requests"
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
        requestId={params.request}
        realAccount
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
