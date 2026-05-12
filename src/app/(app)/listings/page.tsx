import { SlidersHorizontal } from "lucide-react";
import { FlowContextBar } from "@/components/FlowContextBar";
import { ListingCard } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { paddockListings } from "@/lib/dummyData";

const filters = ["All", "Cattle", "Sheep", "Permanent water", "Verified"];

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 4"
        title="Choose a paddock for your request."
        description="These are prototype matches for Dale's 100 Angus cattle request. Refine the list, inspect a paddock, then message the landowner."
      />

      <FlowContextBar step="Step 2 of 4: Choosing a paddock" />

      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-bark/85">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Refine results
      </div>
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
