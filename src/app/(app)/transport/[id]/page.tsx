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
        eyebrow="Transport room"
        title={
          job.state === "open"
            ? "Open transport brief: review and express interest."
            : "Transport chat room: coordinate the stock move."
        }
        description={
          job.state === "open"
            ? "This page lets a driver inspect pickup, destination, livestock, timing, and route details before putting their hand up."
            : "This page is where Farmer A, Farmer B, and the driver chat, confirm movement details, and keep private agistment terms out of view."
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
