import type { Metadata } from "next";
import { WorkspaceRouteClient } from "./WorkspaceRouteClient";

export const metadata: Metadata = {
  title: "Agreement workspace — PaddockME",
};

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // The agreement loads client-side from Supabase via the repository layer.
  return <WorkspaceRouteClient id={id} />;
}
