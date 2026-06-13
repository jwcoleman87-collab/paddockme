import { FlowShell } from "@/components/paddockme/FlowShell";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";

/** Screen 4 — New Agistment Request, Step 2: feed requirements. */
export default function RequestRequirementsPage() {
  return (
    <FlowShell
      step={2}
      sideImage={paddockmeImages.requestStepRoad}
      sideImageAlt="Dirt road leading to an Australian paddock"
    >
      <h1 className="text-xl font-extrabold text-pm-charcoal">
        Feed Requirements
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Need feed until"
          name="needUntil"
          type="date"
          defaultValue="2025-06-30"
        />
        <FormField
          label="Distance willing to travel"
          name="distance"
          defaultValue="300 km"
        />
      </div>
      <div className="mt-4 space-y-4">
        <FormField
          label="Budget"
          hint="optional"
          name="budget"
          placeholder="e.g. $12/head/week"
        />
        <FormField
          label="Special requirements"
          name="specialRequirements"
          as="textarea"
          placeholder="Any specific needs or notes..."
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <PmButton variant="outline" href="/requests/new">
          Back
        </PmButton>
        <PmButton href="/requests/matches">Search Matches</PmButton>
      </div>
    </FlowShell>
  );
}
