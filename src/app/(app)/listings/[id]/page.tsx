import { ListingDetailClient } from "./ListingDetailClient";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ published?: string | string[] }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const publishedParam = Array.isArray(search.published)
    ? search.published[0]
    : search.published;

  return <ListingDetailClient id={id} published={publishedParam === "1"} />;
}
