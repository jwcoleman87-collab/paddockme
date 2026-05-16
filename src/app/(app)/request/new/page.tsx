"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/types/database";

const animalOptions = {
  Cattle: [
    "Angus",
    "Hereford",
    "Brahman",
    "Charolais",
    "Murray Grey",
    "Shorthorn",
    "Limousin",
    "Simmental",
    "Wagyu",
    "Droughtmaster",
    "Santa Gertrudis",
    "Brangus",
    "Friesian",
    "Jersey",
    "Mixed cattle",
    "Other cattle",
  ],
  Sheep: [
    "Merino",
    "Poll Merino",
    "Dohne Merino",
    "Border Leicester",
    "White Suffolk",
    "Poll Dorset",
    "Dorper",
    "Australian White",
    "Corriedale",
    "Romney",
    "Southdown",
    "Wiltipoll",
    "Composite sheep",
    "Mixed sheep",
    "Other sheep",
  ],
  Horses: [
    "Thoroughbred",
    "Standardbred",
    "Quarter Horse",
    "Australian Stock Horse",
    "Warmblood",
    "Arabian",
    "Appaloosa",
    "Paint Horse",
    "Clydesdale",
    "Percheron",
    "Welsh Pony",
    "Shetland Pony",
    "Brumby",
    "Miniature Horse",
    "Mixed horses",
    "Other horses",
  ],
  Goats: [
    "Boer",
    "Rangeland",
    "Kalahari Red",
    "Savanna",
    "Saanen",
    "Toggenburg",
    "British Alpine",
    "Anglo-Nubian",
    "Nigerian Dwarf",
    "Pygmy",
    "Cashmere",
    "Angora",
    "Dairy goats",
    "Meat goats",
    "Mixed goats",
    "Other goats",
  ],
  Bees: [
    "Italian honey bees",
    "Carniolan honey bees",
    "Caucasian honey bees",
    "Buckfast bees",
    "Australian commercial honey bees",
    "Native stingless bees",
    "Queen rearing hives",
    "Pollination hives",
    "Honey production hives",
    "Mixed apiary",
    "Other bees",
  ],
  Alpacas: [
    "Huacaya",
    "Suri",
    "Wethers",
    "Breeding females",
    "Males",
    "Mixed alpacas",
    "Other alpacas",
  ],
  Deer: [
    "Red deer",
    "Fallow deer",
    "Rusa deer",
    "Sambar deer",
    "Chital deer",
    "Mixed deer",
    "Other deer",
  ],
  Pigs: [
    "Large White",
    "Landrace",
    "Duroc",
    "Berkshire",
    "Hampshire",
    "Tamworth",
    "Wessex Saddleback",
    "Growers",
    "Sows",
    "Mixed pigs",
    "Other pigs",
  ],
  Poultry: [
    "Layer hens",
    "Broilers",
    "Free-range chickens",
    "Ducks",
    "Geese",
    "Turkeys",
    "Guinea fowl",
    "Mixed poultry",
    "Other poultry",
  ],
} as const;

type StockType = keyof typeof animalOptions;

const stockTypes = Object.keys(animalOptions) as StockType[];
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
  const [stockType, setStockType] = useState<StockType>("Cattle");
  const [breed, setBreed] = useState("Angus");
  const [duration, setDuration] = useState("3-6 months");
  const [selectedRegions, setSelectedRegions] = useState(["Southern NSW"]);
  const [transportRequired, setTransportRequired] = useState("Yes");
  const [headCount, setHeadCount] = useState(100);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const breedOptions = animalOptions[stockType];
  const countUnit = stockType === "Bees" ? "hives" : stockType === "Poultry" ? "birds" : "head";

  function selectStockType(value: StockType) {
    setStockType(value);
    setBreed(animalOptions[value][0]);
  }

  function toggleRegion(region: string) {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedRegions.length === 0) {
      setError("Choose at least one preferred region.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError && userError.name !== "AuthSessionMissingError") {
      setSaving(false);
      setError(userError.message);
      return;
    }

    if (!user) {
      setSaving(false);
      router.push("/listings?request=request-100-cattle");
      return;
    }

    const payload: TablesInsert<"agistment_requests"> = {
      requester_id: user.id,
      stock_type: stockType,
      breed,
      head_count: headCount,
      duration,
      preferred_regions: selectedRegions,
      urgency: "standard",
      status: "matching",
    };

    const { data, error: insertError } = await supabase
      .from("agistment_requests")
      .insert(payload)
      .select("id")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/listings?request=${data.id}`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 4"
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
                onClick={() => selectStockType(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection title={stockType === "Bees" ? "Bee or hive type" : "Breed or class"}>
            {breedOptions.map((value) => (
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
                <p className="text-sm font-medium text-bark/80">
                  Set the approximate {countUnit === "head" ? "head count" : countUnit}.
                </p>
              </div>
              <p className="text-4xl font-extrabold text-sage-deep">
                {headCount}
              </p>
            </div>
            <input
              type="range"
              min={10}
              max={1200}
              step={10}
              value={headCount}
              onChange={(event) => setHeadCount(Number(event.target.value))}
              className="paddockme-range w-full accent-sage-deep"
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
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-sage-deep">Your request</h2>
              <span className="rounded-md border border-amber/35 bg-amber-light px-3 py-1 text-xs font-bold text-amber">
                Draft preview
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <InfoTile tone="subtle" size="sm" label="Stock" value={`${headCount} ${countUnit} ${breed} ${stockType}`} />
              <InfoTile tone="subtle" size="sm" label="Duration" value={duration} />
              <InfoTile tone="subtle" size="sm" label="Regions" value={selectedRegions.join(", ") || "Choose one"} />
              <InfoTile tone="subtle" size="sm" label="Transport" value={transportRequired} />
            </div>
            {error && (
              <p className="mt-4 rounded-md border border-terra/25 bg-terra-light px-4 py-3 text-sm font-semibold text-bark" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-5 w-full" disabled={saving}>
              {saving ? (
                <>
                  Saving request
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                </>
              ) : (
                <>
                  See available paddocks
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
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
