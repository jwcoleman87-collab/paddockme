import { PageHeader } from "@/components/PageHeader";
import {
  getDrivers,
  getFarmer,
  getTransportJob,
  getTransportMessages,
} from "@/lib/dummyData";
import { TransportRoomClient } from "./TransportRoomClient";

export default async function TransportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ driver?: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const driverParam = Array.isArray(search.driver) ? search.driver[0] : search.driver;
  const job = getTransportJob(id);
  const messages = getTransportMessages(job.id);
  const fallbackDriver = getDrivers()[0];
  const farmerA = getFarmer(job.farmerAId ?? "farmer-a") ?? getFarmer("farmer-a");
  const farmerB = getFarmer(job.farmerBId ?? "farmer-b") ?? getFarmer("farmer-b");
  const driver = getFarmer(job.driverId ?? driverParam ?? fallbackDriver?.id ?? "");

  if (!farmerA || !farmerB || !driver) {
    throw new Error("Missing dummy transport participants");
  }

  return (
    <>
      <PageHeader
        eyebrow="Transport coordination"
        title={job.state === "open" ? "Open movement brief." : "Three-party transport room."}
        description={
          job.state === "open"
            ? "Driver can review logistics and express interest. Private agistment terms stay out of this workspace."
            : "Farmer A, Farmer B and the driver coordinate movement details. Contract pricing stays out of this workspace."
        }
      />

      <TransportRoomClient
        job={job}
        farmerA={farmerA}
        farmerB={farmerB}
        driver={driver}
        messages={messages}
      />
    </>
  );
}
