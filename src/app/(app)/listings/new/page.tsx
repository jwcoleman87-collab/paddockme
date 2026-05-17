import { Camera, CheckCircle } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes } from "@/lib/dummyData";

const feed = ["Excellent", "Good", "Tight", "Needs rain"];
const water = ["Permanent", "Seasonal", "Tank", "Creek access"];
const fencing = ["Secure", "Good", "Needs inspection"];

export default function NewListingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Offer agistment"
        title="List spare paddock capacity."
        description="Farmer B creates the available paddock record. This is a static prototype form with the real fields we expect later."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-xl font-bold text-sage-deep">Property basics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-sage/35 bg-sage-mist text-center">
              <Camera className="mb-3 h-8 w-8 text-sage-deep" aria-hidden />
              <p className="font-semibold text-sage-deep">Photos placeholder</p>
              <p className="mt-1 max-w-xs text-sm font-medium text-bark/85">
                Later this becomes paddock, water point, fencing and yards photos.
              </p>
            </div>
          </Card>

          <Card className="sticky top-24">
            <h2 className="text-xl font-bold text-sage-deep">Publish readiness</h2>
            <div className="mt-4 space-y-3">
              {["Location set", "Livestock suitability selected", "Water and fencing declared"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-bark">
                  <CheckCircle className="h-5 w-5 text-match" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
            <ButtonLink
              href="/listings/paddock-glenbarra?as=landowner&published=1"
              className="mt-5 w-full"
            >
              Publish listing
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-bark/90">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-1 min-h-12 w-full rounded-xl border border-mist bg-warm-white px-4 text-base font-semibold text-bark"
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
      <h2 className="mb-4 text-xl font-bold text-sage-deep">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <SelectablePill key={option} selected={selected.includes(option)}>
            {option}
          </SelectablePill>
        ))}
      </div>
    </Card>
  );
}
