"use client";

import { useRouter } from "next/navigation";
import { Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes } from "@/lib/dummyData";
import { createPaddockListingRecord } from "@/lib/data/repositories";

const feed = ["Excellent", "Good", "Tight", "Needs rain"];
const water = ["Permanent", "Seasonal", "Tank", "Creek access"];
const fencing = ["Secure", "Good", "Needs inspection"];

export default function NewListingPage() {
  const router = useRouter();
  const flash = useFlash();

  async function publishListing() {
    const { listing } = await createPaddockListingRecord({
      title: "Glenbarra River Paddocks",
      location: "Near Gundagai, NSW",
      region: "Southern NSW",
      acres: 280,
      suitableLivestock: ["Cattle", "Sheep"],
      feedStatus: "Excellent",
      waterStatus: "Permanent",
      fencingStatus: "Secure",
      availabilityWindow: "18 May to 30 September",
      guideTerms: "Discuss terms",
      summary:
        "River flats with strong autumn feed, permanent troughs, and north-gate truck access.",
    });
    flash("Listing published.", "success");
    router.push(`/listings/${listing.id}?published=1`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Offer agistment"
        title="List spare paddock capacity."
        description="Add the location, acres, livestock fit, feed, water, fencing and access notes farmers need before they enquire."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          <Card>
            <SectionTitle eyebrow="Step 1" title="Property basics" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Location" value="Near Gundagai, NSW" />
              <Field label="Available acres" value="280" />
              <Field label="Availability window" value="18 May to 30 September" />
              <Field label="Access note" value="North gate for wet weather" />
            </div>
          </Card>

          <ChoiceSection title="Suitable livestock" options={stockTypes} selected={["Cattle", "Sheep"]} />
          <ChoiceSection title="Feed quality" options={feed} selected={["Excellent"]} />
          <ChoiceSection title="Water availability" options={water} selected={["Permanent"]} />
          <ChoiceSection title="Fencing condition" options={fencing} selected={["Secure"]} />
        </div>

        <aside className="space-y-5">
          <Card>
            <div className="flex min-h-52 flex-col items-center justify-center rounded-[8px] border border-dashed border-sage/45 bg-sage-mist/80 px-5 text-center">
              <Camera className="mb-3 h-8 w-8 text-sage-deep" aria-hidden />
              <p className="text-lg font-extrabold text-sage-deep">Paddock photos</p>
              <p className="mt-1 max-w-xs text-sm font-medium text-bark/85">
                Add paddock, water point, fencing and yards photos when they are available.
              </p>
            </div>
          </Card>

          <Card className="sticky top-24">
            <SectionTitle eyebrow="Checklist" title="Publish readiness" />
            <div className="mt-4 space-y-3">
              {["Location set", "Livestock suitability selected", "Water and fencing declared"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-bark">
                  <CheckCircle className="h-5 w-5 text-match" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
            <Button type="button" onClick={publishListing} className="mt-5 w-full">
              Publish listing
            </Button>
          </Card>
        </aside>
      </div>
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-ochre">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold leading-tight text-sage-deep">
        {title}
      </h2>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-2 min-h-14 w-full rounded-[8px] border border-stone/35 bg-white px-4 text-lg font-extrabold text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25"
      />
    </label>
  );
}

function ChoiceSection({
  title,
  options,
  selected,
}: {
  title: string;
  options: string[];
  selected: string[];
}) {
  return (
    <Card>
      <SectionTitle eyebrow="Select" title={title} />
      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((option) => (
          <SelectablePill key={option} selected={selected.includes(option)}>
            {option}
          </SelectablePill>
        ))}
      </div>
    </Card>
  );
}
