import { CirclePlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { paddockListings } from "@/lib/dummyData";
import { ListingsClient } from "./ListingsClient";

export default function ListingsPage() {
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

      <ListingsClient listings={paddockListings} />
    </>
  );
}
