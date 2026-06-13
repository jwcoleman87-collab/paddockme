"use client";

import { CirclePlus } from "lucide-react";
import { CattleIcon, SheepIcon, HorseIcon } from "@/components/paddockme/AnimalIcons";
import { FlowShell } from "@/components/paddockme/FlowShell";
import { LivestockTypeCard } from "@/components/paddockme/PmCards";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

const livestockTypes = [
  { label: "Cattle", icon: <CattleIcon className="h-7 w-7" /> },
  { label: "Sheep", icon: <SheepIcon className="h-7 w-7" /> },
  { label: "Horses", icon: <HorseIcon className="h-7 w-7" /> },
  { label: "Other", icon: <CirclePlus className="h-7 w-7" /> },
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
          lab