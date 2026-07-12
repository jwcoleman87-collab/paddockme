"use client";

import Link from "next/link";
import { MoveRight } from "lucide-react";
import { FlowShell } from "@/components/paddockme/FlowShell";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/** Screen 4 — New Agistment Request, Step 2: feed requirements. */
export default function RequestRequirementsPage() {
  const { state, setRequestDetails } = usePaddockmeWorkflow();

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
          value={state.request.needUntil}
          onChange={(e) => setRequestDetails({ needUntil: e.target.value })}
        />
        <FormField
          label="Distance willing to travel"
          name="distance"
          value={state.request.distanceKm}
          onChange={(e) => setRequestDetails({ distanceKm: e.target.value })}
        />
      </div>
      <div className="mt-4 space-y-4">
        <FormField
          label="Budget"
          hint="optional"
          name="budget"
          placeholder="e.g. $12/head/week"
          value={state.request.budget}
          onChange={(e) => setRequestDetails({ budget: e.target.value })}
        />
        <FormField
          label="Special requirements"
          hint="optional"
          as="textarea"
          name="specialRequirements"
          placeholder="Yards, loading ramp, permanent water, agistment type..."
          value={state.request.specialRequirements}
          onChange={(e) =>
            setRequestDetails({ specialRequirements: e.target.value })
          }
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Link
          href="/requests/new"
          className="text-sm font-medium text-pm-muted hover:text-pm-charcoal"
        >
          Back
        </Link>
        <PmButton href="/requests/matches">
          Find Matches
          <MoveRight className="h-4 w-4" aria-hidden />
        </PmButton>
      </div>
    </FlowShell>
  );
}
