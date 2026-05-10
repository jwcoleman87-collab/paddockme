"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";

const stockTypes = ["Cattle", "Sheep", "Horses", "Goats"];
const breeds = [
  "Angus",
  "Hereford",
  "Brahman",
  "Charolais",
  "Murray Grey",
  "Mixed",
  "Other",
];
const durations = ["1-3 months", "3-6 months", "6-12 months", "12+ months", "Ongoing"];
const regions = [
  "Southern NSW",
  "Central West",
  "Northern NSW",
  "Gippsland",
  "Western VIC",
  "SE QLD",
];
const transport = ["Yes", "No", "Unsure"];

export default function NewRequestPage() {
  const router = useRouter();
  const [stockType, setStockType] = useState("Cattle");
  const [breed, setBreed] = useState("Angus");
  const [duration, setDuration] = useState("3-6 months");
  const [selectedRegions, setSelectedRegions] = useState(["Southern NSW"]);
  const [transportRequired, setTransportRequired] = useState("Yes");
  const [headCount, setHeadCount] = useState(100);

  function toggleRegion(region: string) {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/listings?request=request-100-cattle");
  }

  return (
    <>
      <PageHeader
        eyebrow="Need agistment"
        title="Tell us what needs placing."
        description="A low-typing request flow for Farmer A. These choices will become match inputs later; for now they drive the clickable skeleton."
      />

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[0.95fr_0.55fr]">
        <div className="space-y-5">
          <ChoiceSection title="Stock type">
            {stockTypes.map((value) => (
              <SelectablePill
                key={value}
                selected={stockType === value}
                onClick={() => setStockType(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection title="Breed">
            {breeds.map((value) => (
              <SelectablePill
                key={value}
                selected={breed === value}
                onClick={() => setBreed(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <Card>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="text-xl font-bold text-sage-deep">Head count</h2>
                <p className="text-sm text-bark/65">Big touch target now, smarter selector later.</p>
              </div>
              <p className="font-display text-4xl text-sage-deep">{headCount}</p>
            </div>
            <input
              type="range"
              min={10}
              max={1200}
              step={10}
              value={headCount}
              onChange={(event) => setHeadCount(Number(event.target.value))}
              className="w-full accent-sage-deep"
            />
          </Card>

          <ChoiceSection title="Duration">
            {durations.map((value) => (
              <SelectablePill
                key={value}
                selected={duration === value}
                onClick={() => setDuration(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection title="Preferred regions">
            {regions.map((value) => (
              <SelectablePill
                key={value}
                selected={selectedRegions.includes(value)}
                onClick={() => toggleRegion(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>
        </div>

        <aside className="space-y-5">
          <ChoiceSection title="Transport required">
            {transport.map((value) => (
              <SelectablePill
                key={value}
                selected={transportRequired === value}
                onClick={() => setTransportRequired(value)}
                className="w-full"
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <Card className="sticky top-24">
            <h2 className="text-xl font-bold text-sage-deep">Request summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Summary label="Stock" value={`${headCount} ${breed} ${stockType}`} />
              <Summary label="Duration" value={duration} />
              <Summary label="Regions" value={selectedRegions.join(", ")} />
              <Summary label="Transport" value={transportRequired} />
            </dl>
            <Button type="submit" className="mt-5 w-full">
              Find matches
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Card>
        </aside>
      </form>
    </>
  );
}

function ChoiceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h2 className="mb-4 text-xl font-bold text-sage-deep">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-warm-white p-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-stone">{label}</dt>
      <dd className="mt-1 font-semibold text-bark">{value}</dd>
    </div>
  );
}
