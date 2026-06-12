import { BadgeCheck, Sprout, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Farmer } from "@/lib/dummyData";

type PartyRosterProps = {
  farmerA: Farmer;
  farmerB: Farmer;
  driver: Farmer;
  driverStatus?: "candidate" | "assigned";
};

export function PartyRoster({
  farmerA,
  farmerB,
  driver,
  driverStatus = "assigned",
}: PartyRosterProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sage-deep/20 bg-warm-white shadow-[0_18px_45px_rgba(34,84,52,0.08)]">
      <div className="border-b border-sage-deep/15 bg-cream/55 px-5 py-4">
        <h2 className="text-lg font-bold text-sage-deep">
          Parties
        </h2>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        <PartyCard
          farmer={farmerA}
          label="Livestock owner"
          note="Agreement party"
          tone="agreement"
          icon={<Sprout className="h-4 w-4" aria-hidden />}
        />
        <PartyCard
          farmer={farmerB}
          label="Landowner"
          note="Agreement party"
          tone="agreement"
          icon={<Sprout className="h-4 w-4" aria-hidden />}
        />
        <PartyCard
          farmer={driver}
          label={driverStatus === "candidate" ? "Candidate driver" : "Driver"}
          note="Logistics only"
          tone="driver"
          icon={<Truck className="h-4 w-4" aria-hidden />}
        />
      </div>

    </section>
  );
}
function PartyCard({
  farmer,
  label,
  note,
  tone,
  icon,
}: {
  farmer: Farmer;
  label: string;
  note: string;
  tone: "agreement" | "driver";
  icon: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-xl border px-4 py-4",
        tone === "agreement"
          ? "border-sage-deep/15 bg-sage-mist/40"
          : "border-ochre/30 bg-ochre-light/55"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
            tone === "agreement" ? "bg-sage-deep text-cream" : "bg-ochre text-bark"
          )}
          aria-hidden
        >
          {getInitials(farmer.name)}
        </div>
        <div className="min-w-0">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide text-bark/85">
            {label}
          </p>
          <p className="truncate text-base font-bold text-bark">{farmer.name}</p>
          <p className="truncate text-xs font-semibold text-bark/85">
            {farmer.role} - {farmer.region}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold",
            tone === "agreement"
              ? "bg-sage-deep/10 text-sage-deep"
              : "bg-bark/10 text-bark/80"
          )}
        >
          {icon}
          {note}
        </span>
        {farmer.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-match-light px-2.5 py-1 text-[0.7rem] font-bold text-match">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Verified
          </span>
        )}
      </div>
    </article>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
