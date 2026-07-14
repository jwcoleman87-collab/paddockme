"use client";

import Link from "next/link";
import { CirclePlus, MoveRight } from "lucide-react";
import { FlowShell } from "@/components/paddockme/FlowShell";
import { LivestockTypeCard } from "@/components/paddockme/PmCards";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

const livestockTypes = [
  { label: "Cattle", image: paddockmeImages.stockTypeCattle, icon: null },
  { label: "Sheep", image: paddockmeImages.stockTypeSheep, icon: null },
  { label: "Horses", image: paddockmeImages.stockTypeHorse, icon: null },
  { label: "Other", image: undefined, icon: <CirclePlus className="h-7 w-7" /> },
];

/** Screen 3 — New Agistment Request, Step 1: what stock do you have? */
export default function RequestStockPage() {
  const { state, setRequestDetails } = usePaddockmeWorkflow();

  return (
    <FlowShell
      step={1}
      sideImage={paddockmeImages.requestStepCow}
      sideImageAlt="Cattle grazing in an Australian paddock"
    >
      <h1 className="text-xl font-extrabold text-pm-charcoal">
        What stock do you have?
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {livestockTypes.map((t) => (
          <LivestockTypeCard
            key={t.label}
            label={t.label}
            icon={t.icon}
            image={t.image}
            selected={state.request.livestockType === t.label}
            onSelect={() => setRequestDetails({ livestockType: t.label })}
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <FormField
          label="How many head?"
          name="headCount"
          type="number"
          min={1}
          value={state.request.headCount}
          onChange={(e) =>
            setRequestDetails({ headCount: Number(e.target.value) || 0 })
          }
        />
        <FormField
          label="Where is your stock now?"
          name="location"
          placeholder="e.g. Dubbo NSW"
          value={state.request.location}
          onChange={(e) => setRequestDetails({ location: e.target.value })}
        />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-medium text-pm-muted hover:text-pm-charcoal"
        >
          Cancel
        </Link>
        <PmButton href="/requests/new/requirements">
          Next
          <MoveRight className="h-4 w-4" aria-hidden />
        </PmButton>
      </div>
    </FlowShell>
  );
}
