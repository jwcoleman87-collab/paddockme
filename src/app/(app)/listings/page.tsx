import { FlowContextBar } from "@/components/FlowContextBar";
import { PageHeader } from "@/components/PageHeader";
import { ListingsExplorer } from "./ListingsExplorer";

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 4"
        title="Choose a paddock for your request."
        description="These are prototype matches for Dale's 100 Angus cattle request. Refine the list, inspect a paddock, then message the landowner."
      />

      <FlowContextBar step="Step 2 of 4: Choosing a paddock" />

      <ListingsExplorer />
    </>
  );
}
