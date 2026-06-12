"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { InfoTile } from "@/components/InfoTile";
import { PageHeader } from "@/components/PageHeader";
import {
  SearchablePicker,
  pickerGroupsFromRegions,
} from "@/components/SearchablePicker";
import { SelectablePill } from "@/components/SelectablePill";
import { animalOptions, stockTypes, type StockType } from "@/lib/dummyData";
import { createLivestockRequestRecord } from "@/lib/data/repositories";
import {
  geocodeLocation,
  type GeocodedLocation,
} from "@/lib/locationGeocode";
import {
  findRegion,
  regionsByLabel,
  regionsGroupedByState,
} from "@/lib/regions";

const durations = ["1-3 months", "3-6 months", "6-12 months", "12+ months", "Ongoing"];
const transport = ["Yes", "No", "Unsure"];

// Region picker groups are built from the canonical Australian region
// list grouped by state. Stored selection is by region id; we convert
// to/from human labels at the request/URL boundary so existing seed and
// /matches filters keep working unchanged.
const regionPickerGroups = pickerGroupsFromRegions(regionsGroupedByState());

function regionIdsFromLabels(labels: string[]): string[] {
  return labels
    .map((label) => regionsByLabel[label]?.id)
    .filter((id): id is string => !!id);
}

function regionLabelsFromIds(ids: string[]): string[] {
  return ids
    .map((id) => findRegion(id)?.label)
    .filter((label): label is string => !!label);
}

export default function NewRequestPage() {
  const router = useRouter();
  const flash = useFlash();
  const [stockType, setStockType] = useState<StockType>("Cattle");
  const [breed, setBreed] = useState("Angus");
  const [duration, setDuration] = useState("3-6 months");
  // Stored as region ids. selectedRegionLabels is derived only when we
  // need to pass labels to URL params / persistence (keeps existing
  // downstream filters and seed names working).
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([
    "southern-nsw",
  ]);
  const selectedRegions = regionLabelsFromIds(selectedRegionIds);
  const [transportRequired, setTransportRequired] = useState("Yes");
  const [headCount, setHeadCount] = useState(100);
  const [originAddress, setOriginAddress] = useState("");
  const [confirmedOrigin, setConfirmedOrigin] =
    useState<GeocodedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmedOrigin) {
      flash("Confirm the pickup property location before matching paddocks.", "warning");
      return;
    }
    const created = await createLivestockRequestRecord({
      stockType,
      breed,
      headCount,
      duration,
      preferredRegions: selectedRegions,
      transportRequired: transportRequired as "Yes" | "No" | "Unsure",
      originAddress: confirmedOrigin.formattedAddress,
      originLatitude: confirmedOrigin.latitude,
      originLongitude: confirmedOrigin.longitude,
      originPlaceId: confirmedOrigin.placeId,
    });
    if (!created) {
      flash("Couldn't save your request. Please try again.", "warning");
      return;
    }
    flash("Request created. Matching paddocks now.", "success");
    router.push(`/matches?request=${encodeURIComponent(created.request.id)}`);
  }

  function selectStockType(value: StockType) {
    setStockType(value);
    setBreed(animalOptions[value][0]);
  }

  async function confirmOriginLocation() {
    if (!originAddress.trim()) {
      flash("Add the pickup property location first.", "warning");
      return;
    }
    setGeocoding(true);
    const result = await geocodeLocation({
      query: originAddress.trim(),
      region: selectedRegions[0],
    });
    setGeocoding(false);
    if (!result) {
      flash("Could not confirm that location. Try a fuller address or nearby town.", "warning");
      return;
    }
    setOriginAddress(result.formattedAddress);
    setConfirmedOrigin(result);
    flash("Pickup location confirmed.", "success");
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

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">
              {stockType === "Bees" ? "Bee or hive type" : "Breed or class"}
            </h2>
            <SearchablePicker
              label={
                stockType === "Bees"
                  ? "Choose the bee or hive type"
                  : `Choose the ${stockType.toLowerCase()} breed or class`
              }
              placeholder="Choose a breed…"
              searchPlaceholder="Search breeds"
              value={breed}
              onChange={(next) => next && setBreed(next)}
              groups={[
                {
                  id: stockType,
                  label: stockType,
                  options: breedOptions.map((option) => ({
                    id: option,
                    label: option,
                  })),
                },
              ]}
            />
          </Card>

          <Card>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="text-xl font-bold text-sage-deep">Head count</h2>
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

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">
              Pickup property location
            </h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block">
                <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
                  Address or property locality
                </span>
                <input
                  value={originAddress}
                  onChange={(event) => {
                    setOriginAddress(event.target.value);
                    setConfirmedOrigin(null);
                  }}
                  placeholder="e.g. 42 River Road, Gundagai NSW"
                  className="mt-2 min-h-14 w-full rounded-[8px] border border-stone/35 bg-white px-4 text-lg font-extrabold text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:font-semibold placeholder:text-stone/45"
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={confirmOriginLocation}
                disabled={geocoding}
                className="sm:min-h-14"
              >
                {geocoding ? "Checking" : "Confirm"}
              </Button>
            </div>
            {confirmedOrigin && (
              <p className="mt-3 rounded-md border border-match/20 bg-match-light/55 px-3 py-2 text-sm font-bold text-match">
                Confirmed: {confirmedOrigin.formattedAddress}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">
              Preferred regions
            </h2>
            <SearchablePicker
              label="Choose one or more regions"
              placeholder="Choose a region…"
              searchPlaceholder="Search regions"
              multi
              value={selectedRegionIds}
              onChange={setSelectedRegionIds}
              groups={regionPickerGroups}
            />
          </Card>
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
              <InfoTile tone="subtle" size="sm" label="Pickup" value={confirmedOrigin?.formattedAddress ?? "Not confirmed"} />
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

