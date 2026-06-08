import { ListingDetailClient } from "./ListingDetailClient";
import { RealAccountEmptyState } from "@/components/RealAccountEmptyState";
import { getCurrentUserProfile } from "@/lib/supabase/currentUser";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ published?: string | string[] }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const currentUserProfile = await getCurrentUserProfile();
  if (currentUserProfile) {
    return (
      <RealAccountEmptyState
        title="No live listing detail found."
        body="Customer listing details will open here once real paddocks are published."
        primaryHref="/listings/new"
        primaryLabel="Create listing"
        secondaryHref="/listings"
        secondaryLabel="Back to paddocks"
      />
    );
  }

  const publishedParam = Array.isArray(search.published)
    ? search.published[0]
    : search.published;

  return <ListingDetailClient id={id} published={publishedParam === "1"} />;
}
