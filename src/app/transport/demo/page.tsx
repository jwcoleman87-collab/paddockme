import {
  isTransporterView,
  type TransporterView,
} from "@/components/paddockme/transporter/TransporterStatusNav";
import { TransporterHub } from "@/components/paddockme/transporter/TransporterHub";

export default async function TransporterDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const params = await searchParams;
  const view: TransporterView = isTransporterView(params.view)
    ? params.view
    : "available";
  return <TransporterHub view={view} />;
}
