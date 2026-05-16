import { redirect } from "next/navigation";
import { agreements } from "@/lib/dummyData";

export default function WorkspaceIndexPage() {
  const first = agreements[0];
  if (!first) {
    redirect("/agreements");
  }
  redirect(`/workspace/${first.id}`);
}
