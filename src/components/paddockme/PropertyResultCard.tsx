import { LandPlot } from "lucide-react";
import { PmButton } from "./PmButton";
import { Badge, Rating } from "./PmCards";
import type { DemoProperty } from "@/lib/paddockmeDemoData";

/** Real-estate style listing card for the Matches page. */
export function PropertyResultCard({ property }: { property: DemoProperty }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-pm-border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={property.image}
        alt={`${property.name} paddock`}
        className="h-40 w-full rounded-lg object-cover sm:h-28 sm:w-40"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-pm-charcoal">
              {property.name}
            </h3>
            <p className="text-sm text-pm-muted">
              {property.location} · {property.distance}
            </p>
          </div>
          <Rating value={property.rating} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge icon={<LandPlot className="h-3.5 w-3.5" aria-hidden />}>
            {property.acres}
          </Badge>
          {property.badges.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </div>
      <PmButton
        href={`/properties/${property.slug}`}
        className="w-full sm:w-auto"
      >
        View Property
      </PmButton>
    </div>
  );
}
