import { CirclePlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { paddockListings } from "@/lib/dummyData";
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
        initialFilters={initialFilters}
      />
    </>
  );
}
