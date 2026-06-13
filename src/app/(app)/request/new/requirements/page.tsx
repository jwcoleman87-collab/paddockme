"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { PageHeader } from "@/components/PageHeader";
import {
  SearchablePicker,
  pickerGroupsFromRegions,
} from "@/components/SearchablePicker";
import { SelectablePill } from "@/components/SelectablePill";
import { RequestProgress } from "@/components/paddockme/RequestProgress";
import { animalOptions } from "@/lib/dummyData";
import { createLivestockRequestRecord } from "@/lib/data/repositories";
import { findRegion, regionsGroupedByState } from "@/lib/regions";
import { clearRequestDraft, loadRequestDraft, saveRequestDraft } from "@/lib/requestDraft";

const durations = ["1-3 months", "3-6 months", "6-12 months", "12+ months", "Ongoing"];

const regionPickerGroups = pickerGroupsFromRegions(regionsGroupedByState());

function regionLabelsFromIds(ids: string[]): string[] {
  return ids
    .map((id) => findRegion(id)?.label)
    .filter((label): label is string => !!label);
}

export default function RequestRequirementsPage() {
  const router = useRouter();
  const flash = useFlash();
  const [loaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState("3-6 months");
  const [regionIds, setRegionIds] = useState<string[]>(["southern-nsw"]);
  const [budget, setBudget] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const draft = loadRequestDraft();
    if (!draft.confirmedOrigin) {
      flash("Start with your stock details first.", "warning");
      router.replace("/request/new");
      return;
    }
    setDuration(draft.duration);
    setRegionIds(draft.preferredRegionIds);
    setBudget(draft.budget);
    setSpecialRequirements(draft.specialRequirements);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchMatches() {
    const draft = loadRequestDraft();
    if (!draft.confirmedOrigin) {
      flash("Start with your stock details first.", "warning");
      router.replace("/request/new");
      return;
    }
    const preferredRegions = regionLabelsFromIds(regionIds);
    if (preferredRegions.length === 0) {
      flash("Choose at least one region you're willing to travel to.", "warning");
      return;
    }

    setSubmitting(true);
    const requiredPasture =
      [budget.trim() ? `Budget: ${budget.trim()}` : null, specialRequirements.trim() || null]
        .filter(Boolean)
        .join(" — ") || null;

    const created = await createLivestockRequestRecord({
      stockType: draft.stockType,
      breed: draft.breed || animalOptions[draft.stockType][0],
      headCount: draft.headCount,
      duration,
      preferredRegions,
      transportRequired: "Unsure",
      originAddress: draft.confirmedOrigin.formattedAddress,
      originLatitude: draft.confirmedOrigin.latitude,
      originLongitude: draft.confirmedOrigin.longitude,
      originPlaceId: draft.confirmedOrigin.placeId,
      requiredPasture,
    });
    setSubmitting(false);

    if (!created) {
      flash("Couldn't save your request. Please try again.", "warning");
      return;
    }
    clearRequestDraft();
    flash("Request created. Matching paddocks now.", "success");
    router.push(`/matches?request=${encodeURIComponent(created.request.id)}`);
  }

  function goBack() {
    saveRequestDraft({
      duration,
      preferredRegionIds: regionIds,
      budget,
      specialRequirements,
    });
    router.push("/request/new");
  }

  if (!loaded) return null;

  return (
    <>
      <PageHeader
        eyebrow="New agistment request"
        title="What are you looking for?"
        description="Tell us your timeframe, budget and any special requirements so we can match you with the right paddocks."
      />

      <RequestProgress current={2} />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.5fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">Need feed until</h2>
            <div className="flex flex-wrap gap-2">
              {durations.map((value) => (
                <SelectablePill
                  key={value}
                  selected={duration === value}
                  onClick={() => setDuration(value)}
                >
                  {value}
                </SelectablePill>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">
              Distance willing to travel
            </h2>
            <SearchablePicker
              label="Choose one or more regions"
              placeholder="Choose a region…"
              searchPlaceholder="Search regions"
              multi
              value={regionIds}
              onChange={setRegionIds}
              groups={regionPickerGroups}
            />
          </Card>

          <Card>
            <h2 className="mb-1 text-xl font-bold text-sage-deep">Budget (optional)</h2>
            <p className="mb-3 text-sm text-bark/60">What you'd expect to pay, e.g. per head per week.</p>
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="e.g. $15/head/week"
              className="min-h-14 w-full rounded-[8px] border border-stone/35 bg-white px-4 text-lg font-extrabold text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:font-semibold placeholder:text-stone/45"
            />
          </Card>

          <Card>
            <h2 className="mb-1 text-xl font-bold text-sage-deep">Special requirements</h2>
            <p className="mb-3 text-sm text-bark/60">Yards, shelter, water access, vet needs — anything the property should have.</p>
            <textarea
              value={specialRequirements}
              onChange={(event) => setSpecialRequirements(event.target.value)}
              placeholder="e.g. Needs covered yards and reliable phone reception"
              rows={4}
              className="w-full rounded-[8px] border border-stone/35 bg-white px-4 py-3 text-base font-medium text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:font-medium placeholder:text-stone/45"
            />
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
            <Button type="button" onClick={searchMatches} disabled={submitting}>
              {submitting ? "Searching…" : "Search Matches"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div
            className="sticky top-24 h-[28rem] overflow-hidden rounded-[8px] bg-sage-deep bg-cover bg-center shadow-[0_14px_36px_rgba(31,42,36,0.1)] relative"
            style={{ backgroundImage: "url(/images/paddockme/request-step-road.jpg)" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-sage-deep/85 via-sage-deep/10 to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-0 bottom-0 p-6 text-lg font-bold leading-snug text-warm-white">
              Step 2 of 3 — set your timeframe and budget so we can find the right fit.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
