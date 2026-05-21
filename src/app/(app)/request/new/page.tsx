"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { animalOptions, stockTypes, type StockType } from "@/lib/dummyData";
import { createLivestockRequestRecord } from "@/lib/data/repositories";

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
  const flash = useFlash();
  const [stockType, setStockType] = useState<StockType>("Cattle");
  const [breed, setBreed] = useState("Angus");
  const [duration, setDuration] = useState("3-6 months");
  const [selectedRegions, setSelectedRegions] = useState(["Southern NSW"]);
  const [transportRequired, setTransportRequired] = useState("Yes");
  const [headCount, setHeadCount] = useState(100);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("paddockme.onboarding");
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        stockTypes?: string[];
        region?: string;
        headCountBracket?: string;
      };
      let applied = false;
      if (
        parsed.stockTypes &&
        parsed.stockTypes.length > 0 &&
        stockTypes.includes(parsed.stockTypes[0] as StockType)
      ) {
        const nextStockType = parsed.stockTypes[0] as StockType;
        setStockType(nextStockType);
        setBreed(animalOptions[nextStockType][0]);
        applied = true;
      }
      if (parsed.region) {
        const mapped = mapOnboardingRegion(parsed.region);
        if (mapped) {
          setSelectedRegions([mapped]);
          applied = true;
        }
      }
      if (parsed.headCountBracket) {
        const count = headCountFromBracket(parsed.headCountBracket);
        if (count !== null) {
          setHeadCount(count);
          applied = true;
        }
      }
      if (applied) {
        flash("Pre-filled from your onboarding answers.", "info");
      }
    } catch {
      // ignore - localStorage may be unavailable
    }
    // Intentionally run once on mount: we hydrate from onboarding state
    // without re-running when other deps change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleRegion(region: string) {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((item) => item !== region)
        : [...current, region]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("stock", stockType);
    params.set("breed", breed);
    params.set("headCount", String(headCount));
    params.set("duration", duration);
    if (selectedRegions.length > 0) {
      params.set("regions", selectedRegions.join(","));
    }
    if (transportRequired) {
      params.set("transport", transportRequired);
    }
    // Single Supabase write happens inside createLivestockRequestRecord
    // when the user is signed in. Returns supabaseError when the insert
    // was attempted but failed so we can flag it to the user rather than
    // pretending everything saved.
    const result = await createLivestockRequestRecord({
      stockType,
      breed,
      headCount,
      duration,
      preferredRegions: selectedRegions,
      transportRequired: transportRequired as "Yes" | "No" | "Unsure",
    });
    if (result.attemptedSupabase && result.supabaseError) {
      // eslint-disable-next-line no-console
      console.warn("agistment_requests insert failed", result.supabaseError);
      flash(
        "Request created locally - saving to your account failed. Try again or check your connection.",
        "warning"
      );
    } else {
      flash("Request created. Matching paddocks now.", "success");
    }
    router.push(`/matches?${params.toString()}`);
  }

  function selectStockType(value: StockType) {
    setStockType(value);
    setBreed(animalOptions[value][0]);
  }

  const breedOptions = animalOptions[stockType];
  const countUnit =
    stockType === "Bees" ? "hives" : stockType === "Poultry" ? "birds" : "head";

  return (
    <>
      <PageHeader
        eyebrow="Need agistment"
        title="Tell us what needs placing."
        description="Choose the stock, count, timing, regions and transport need so the app can line up suitable paddocks."
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
                <p className="text-sm text-bark/65">
                  Set the approximate {countUnit === "head" ? "head count" : countUnit}.
                </p>
              </div>
              <p className="text-4xl font-extrabold text-sage-deep">
                {headCount}
              </p>
            </div>
            <input
              type="range"
              min={1}
              max={1200}
              step={1}
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
            <div className="mt-4 space-y-3 text-sm">
              <InfoTile tone="subtle" size="sm" label="Stock" value={`${headCount} ${countUnit} ${breed} ${stockType}`} />
              <InfoTile tone="subtle" size="sm" label="Duration" value={duration} />
              <InfoTile tone="subtle" size="sm" label="Regions" value={selectedRegions.join(", ")} />
              <InfoTile tone="subtle" size="sm" label="Transport" value={transportRequired} />
            </div>
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

function mapOnboardingRegion(onboardingRegion: string): string | null {
  if (regions.includes(onboardingRegion)) return onboardingRegion;
  if (onboardingRegion === "Central West NSW") return "Central West";
  if (onboardingRegion === "Gippsland VIC") return "Gippsland";
  return null;
}

function headCountFromBracket(bracket: string): number | null {
  switch (bracket) {
    case "1-20":
      return 10;
    case "20-100":
      return 50;
    case "100-500":
      return 250;
    case "500+":
      return 600;
    default:
      return null;
  }
}
