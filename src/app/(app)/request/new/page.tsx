"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { PageHeader } from "@/components/PageHeader";
import { SearchablePicker } from "@/components/SearchablePicker";
import {
  CattleIcon,
  HorseIcon,
  SheepIcon,
} from "@/components/paddockme/AnimalIcons";
import { RequestProgress } from "@/components/paddockme/RequestProgress";
import { StockTypeCard } from "@/components/paddockme/StockTypeCard";
import { animalOptions, stockTypes, type StockType } from "@/lib/dummyData";
import {
  geocodeLocation,
  type GeocodedLocation,
} from "@/lib/locationGeocode";
import { loadRequestDraft, saveRequestDraft } from "@/lib/requestDraft";

const primaryCards: { value: StockType; label: string; icon: React.ReactNode }[] = [
  { value: "Cattle", label: "Cattle", icon: <CattleIcon className="h-6 w-6" /> },
  { value: "Sheep", label: "Sheep", icon: <SheepIcon className="h-6 w-6" /> },
  { value: "Horses", label: "Horses", icon: <HorseIcon className="h-6 w-6" /> },
];
const primaryStockTypes = primaryCards.map((card) => card.value);
const otherStockTypes = stockTypes.filter(
  (type) => !primaryStockTypes.includes(type)
);

export default function RequestStockPage() {
  const router = useRouter();
  const flash = useFlash();
  const [cardSelection, setCardSelection] = useState<StockType | "Other">("Cattle");
  const [otherType, setOtherType] = useState<StockType>(otherStockTypes[0]);
  const [headCount, setHeadCount] = useState(100);
  const [originAddress, setOriginAddress] = useState("");
  const [confirmedOrigin, setConfirmedOrigin] = useState<GeocodedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Hydrate from a draft saved earlier in this session (e.g. coming back
  // from Step 2 via "Back").
  useEffect(() => {
    const draft = loadRequestDraft();
    if (primaryStockTypes.includes(draft.stockType)) {
      setCardSelection(draft.stockType);
    } else {
      setCardSelection("Other");
      setOtherType(draft.stockType);
    }
    setHeadCount(draft.headCount);
    setOriginAddress(draft.originAddress);
    setConfirmedOrigin(draft.confirmedOrigin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stockType: StockType = cardSelection === "Other" ? otherType : cardSelection;

  async function confirmOriginLocation() {
    if (!originAddress.trim()) {
      flash("Add your property location first.", "warning");
      return;
    }
    setGeocoding(true);
    const result = await geocodeLocation({ query: originAddress.trim() });
    setGeocoding(false);
    if (!result) {
      flash("Could not confirm that location. Try a fuller address or nearby town.", "warning");
      return;
    }
    setOriginAddress(result.formattedAddress);
    setConfirmedOrigin(result);
    flash("Location confirmed.", "success");
  }

  function persist() {
    const draft = loadRequestDraft();
    const breed = draft.stockType === stockType ? draft.breed : animalOptions[stockType][0];
    saveRequestDraft({
      stockType,
      breed,
      headCount,
      originAddress,
      confirmedOrigin,
    });
  }

  function saveAndExit() {
    persist();
    flash("Saved. Pick up your request from Home anytime.", "success");
    router.push("/agreements");
  }

  function goNext() {
    if (headCount < 1) {
      flash("Enter how many head you have.", "warning");
      return;
    }
    if (!confirmedOrigin) {
      flash("Confirm your current location before continuing.", "warning");
      return;
    }
    persist();
    router.push("/request/new/requirements");
  }

  return (
    <>
      <PageHeader
        eyebrow="New agistment request"
        title="What stock do you have?"
        description="Tell us what you're moving and where it's coming from. We'll line up suitable paddocks next."
      />

      <RequestProgress current={1} />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.5fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">Stock type</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryCards.map(({ value, label, icon }) => (
                <StockTypeCard
                  key={value}
                  label={label}
                  icon={icon}
                  selected={cardSelection === value}
                  onClick={() => setCardSelection(value)}
                />
              ))}
              <StockTypeCard
                label="Other"
                icon={<PawPrint className="h-6 w-6" aria-hidden />}
                selected={cardSelection === "Other"}
                onClick={() => setCardSelection("Other")}
              />
            </div>
            {cardSelection === "Other" && (
              <div className="mt-4">
                <SearchablePicker
                  label="Choose the stock type"
                  placeholder="Choose a stock type…"
                  searchPlaceholder="Search stock types"
                  value={otherType}
                  onChange={(next) => next && setOtherType(next as StockType)}
                  groups={[
                    {
                      id: "other-stock",
                      label: "Stock types",
                      options: otherStockTypes.map((type) => ({ id: type, label: type })),
                    },
                  ]}
                />
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-sage-deep">How many head?</h2>
              <p className="text-4xl font-extrabold text-sage-deep">{headCount}</p>
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

          <Card>
            <h2 className="mb-4 text-xl font-bold text-sage-deep">Current location</h2>
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={saveAndExit}>
              Save &amp; Exit
            </Button>
            <Button type="button" onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div
            className="sticky top-24 h-[28rem] overflow-hidden rounded-[8px] bg-sage-deep bg-cover bg-center shadow-[0_14px_36px_rgba(31,42,36,0.1)] relative"
            style={{ backgroundImage: "url(/images/paddockme/request-step-cow.jpg)" }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-sage-deep/85 via-sage-deep/10 to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-0 bottom-0 p-6 text-lg font-bold leading-snug text-warm-white">
              Step 1 of 3 — tell us what&apos;s moving and where it&apos;s coming from.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
