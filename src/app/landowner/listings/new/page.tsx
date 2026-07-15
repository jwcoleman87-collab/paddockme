"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { LivestockTypeCard } from "@/components/paddockme/PmCards";
import { FormField } from "@/components/paddockme/FormField";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";
import {
  usePaddockmeWorkflow,
  type LandownerListing,
} from "@/lib/paddockmeWorkflow";

const stockTypeOptions = [
  { label: "Cattle", image: paddockmeImages.stockTypeCattle, icon: null },
  { label: "Sheep", image: paddockmeImages.stockTypeSheep, icon: null },
  { label: "Horses", image: paddockmeImages.stockTypeHorse, icon: null },
  { label: "Other", image: undefined, icon: <CirclePlus className="h-7 w-7" /> },
];

const waterOptions: LandownerListing["waterAvailability"][] = [
  "Permanent",
  "Seasonal",
  "Tank",
  "None",
];

const fencingOptions: LandownerListing["fencingCondition"][] = [
  "Excellent",
  "Good",
  "Needs work",
];

const selectCls =
  "mt-1.5 w-full rounded-lg border border-pm-border bg-white px-4 py-3 text-sm text-pm-charcoal focus:border-pm-green-700 focus:outline-none focus:ring-2 focus:ring-pm-green-700/20";

/**
 * Landowner guided lane — list a paddock's capacity so incoming livestock
 * requests are matched to what John can actually offer. Prefilled with
 * Green Hills Farm's own facts (docs/paddockmeDemoData.ts demoPropertyDetail)
 * so the first save reads as real rather than empty.
 */
export default function LandownerListingPage() {
  const router = useRouter();
  const { state, listPaddock } = usePaddockmeWorkflow();
  const existing = state.landowner.listing;

  const [acres, setAcres] = useState(existing?.acres ?? "120");
  const [stockTypesAccepted, setStockTypesAccepted] = useState<string[]>(
    existing?.stockTypesAccepted ?? ["Cattle"],
  );
  const [waterAvailability, setWaterAvailability] = useState<
    LandownerListing["waterAvailability"]
  >(existing?.waterAvailability ?? "Permanent");
  const [fencingCondition, setFencingCondition] = useState<
    LandownerListing["fencingCondition"]
  >(existing?.fencingCondition ?? "Excellent");
  const [ratePerHeadWeek, setRatePerHeadWeek] = useState(
    existing?.ratePerHeadWeek ?? "$8",
  );

  function toggleStockType(label: string) {
    setStockTypesAccepted((prev) =>
      prev.includes(label)
        ? prev.filter((t) => t !== label)
        : [...prev, label],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    listPaddock({
      acres,
      stockTypesAccepted,
      waterAvailability,
      fencingCondition,
      ratePerHeadWeek,
    });
    router.push("/landowner");
  }

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8"
        >
          <h1 className="text-xl font-extrabold text-pm-charcoal">
            {existing ? "Edit your paddock listing" : "List your paddock capacity"}
          </h1>
          <p className="mt-1 text-sm text-pm-muted">
            Tell livestock owners what you can offer, so incoming requests
            match your paddock instead of a generic one.
          </p>

          <div className="mt-6">
            <p className="text-sm font-semibold text-pm-charcoal">
              Stock you can accept
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stockTypeOptions.map((t) => (
                <LivestockTypeCard
                  key={t.label}
                  label={t.label}
                  icon={t.icon}
                  image={t.image}
                  selected={stockTypesAccepted.includes(t.label)}
                  onSelect={() => toggleStockType(t.label)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Acres available"
              name="acres"
              value={acres}
              onChange={(e) => setAcres(e.target.value)}
            />
            <FormField
              label="Rate per head, per week"
              name="ratePerHeadWeek"
              placeholder="e.g. $8"
              value={ratePerHeadWeek}
              onChange={(e) => setRatePerHeadWeek(e.target.value)}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="waterAvailability"
                className="block text-sm font-semibold text-pm-charcoal"
              >
                Water availability
              </label>
              <select
                id="waterAvailability"
                value={waterAvailability}
                onChange={(e) =>
                  setWaterAvailability(
                    e.target.value as LandownerListing["waterAvailability"],
                  )
                }
                className={selectCls}
              >
                {waterOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="fencingCondition"
                className="block text-sm font-semibold text-pm-charcoal"
              >
                Fencing condition
              </label>
              <select
                id="fencingCondition"
                value={fencingCondition}
                onChange={(e) =>
                  setFencingCondition(
                    e.target.value as LandownerListing["fencingCondition"],
                  )
                }
                className={selectCls}
              >
                {fencingOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Link
              href="/landowner"
              className="text-sm font-medium text-pm-muted hover:text-pm-charcoal"
            >
              Cancel
            </Link>
            <PmButton type="submit">
              {existing ? "Save changes" : "List paddock"}
            </PmButton>
          </div>
        </form>
      </main>
    </div>
  );
}
