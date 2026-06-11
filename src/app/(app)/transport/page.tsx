import { redirect } from "next/navigation";

/**
 * The demo-era transport portal is retired (demo mode removed). The real
 * carrier surface is the RFT board; farmer-side jobs are reached from the
 * agreement workspace or the board itself. One path, no duplicates.
 */
export default function TransportPortalPage() {
  redirect("/transport/jobs");
}
