import { getAgreement } from "@/lib/dummyData";
import { WorkspaceRouteClient } from "./WorkspaceRouteClient";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceRouteClient id={id} seedAgreement={getAgreement(id)} />;
}
