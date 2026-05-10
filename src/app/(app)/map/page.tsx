import { DummyMap } from "@/components/DummyMap";
import { PageHeader } from "@/components/PageHeader";

export default function MapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Regional intelligence"
        title="Availability by region."
        description="A static map and heatmap placeholder for feed status, drought pressure and paddock availability. Real maps come later."
      />
      <DummyMap />
    </>
  );
}
