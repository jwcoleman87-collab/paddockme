import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { regionalInsights } from "@/lib/dummyData";

const regions = [
  "Southern NSW",
  "Central West NSW",
  "Northern NSW",
  "Gippsland",
  "SE QLD",
];

const transportAvailability: Record<string, string> = {
  "Southern NSW": "Wayne near Wagga",
  "Central West NSW": "2 trucks nearby",
  "Northern NSW": "Sparse",
  Gippsland: "1 float operator",
  "SE QLD": "Sharon fleet",
};

export default function MapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Regional map"
        title="Regional operating picture."
        description="Tap a region to jump into filtered paddock supply. This stays lightweight for MVP review: pressure, listings, requests, and transport availability."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {regions.map((region) => {
          const insight =
            regionalInsights.find((item) => item.region === region || item.region === region.replace(" NSW", "")) ??
            regionalInsights[0];
          const href = `/listings?regions=${encodeURIComponent(region.replace("Central West NSW", "Central West"))}`;
          return (
            <Link key={region} href={href} className="group block">
              <Card className="h-full transition group-hover:border-sage/45 group-hover:bg-sage-mist/30">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sage-deep">
                    <MapPin className="h-5 w-5" aria-hidden />
                    <h2 className="text-xl font-bold">{region}</h2>
                  </div>
                  <ArrowRight className="h-4 w-4 text-sage-deep" aria-hidden />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Feed pressure" value={insight?.pressure ?? "Medium"} />
                  <Metric label="Available paddocks" value={`${insight?.availability ?? 50}%`} />
                  <Metric label="Livestock requests" value={region === "Central West NSW" ? "Dale active" : "Low"} />
                  <Metric label="Transport" value={transportAvailability[region]} />
                </div>
                <div className="mt-4">
                  <StatusBadge tone={insight?.pressure === "High" ? "warning" : "success"}>
                    Feed: {insight?.feed ?? "Good"}
                  </StatusBadge>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mist bg-warm-white px-3 py-2">
      <p className="text-[0.68rem] font-bold uppercase tracking-wide text-stone">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-bark">{value}</p>
    </div>
  );
}
