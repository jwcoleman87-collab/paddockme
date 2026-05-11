import { CirclePlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ListingCard } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { paddockListings } from "@/lib/dummyData";

const filters = ["All", "Cattle", "Sheep", "Permanent water", "Verified"];

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Available paddocks"
        title="Paddocks that could take stock."
        description="Dummy listings for the first skeleton. Price stays light here: the product should prove coordination value before over-focusing on rate cards."
        action={
          <ButtonLink href="/listings/new">
            <CirclePlus className="h-4 w-4" aria-hidden />
            Create listing
          </ButtonLink>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter, index) => (
          <SelectablePill key={filter} selected={index === 0}>
            {filter}
          </SelectablePill>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {paddockListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}
