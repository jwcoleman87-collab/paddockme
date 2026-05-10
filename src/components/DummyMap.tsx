import { regionalInsights } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";

export function DummyMap() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-mist bg-sage-mist p-5">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-[12%] top-[18%] h-28 w-40 rounded-full bg-match-light" />
          <div className="absolute right-[14%] top-[28%] h-32 w-52 rounded-full bg-amber-light" />
          <div className="absolute bottom-[16%] left-[28%] h-36 w-56 rounded-full bg-ochre-light" />
          <div className="absolute bottom-[26%] right-[26%] h-24 w-36 rounded-full bg-cream" />
        </div>
        <div className="relative flex h-full min-h-[380px] flex-col justify-between">
          <div>
            <StatusBadge tone="info">Regional intelligence placeholder</StatusBadge>
            <h2 className="mt-4 max-w-lg text-3xl font-bold text-sage-deep">
              Availability, feed status, and drought pressure by region.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MapStat label="High availability" value="Southern NSW" />
            <MapStat label="Feed pressure" value="Northern NSW" />
            <MapStat label="Watch list" value="SE QLD" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {regionalInsights.map((region) => (
          <article
            key={region.region}
            className="rounded-xl border border-mist bg-cream p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-bold text-sage-deep">{region.region}</h3>
              <StatusBadge
                tone={region.pressure === "High" ? "warning" : "success"}
              >
                {region.pressure} pressure
              </StatusBadge>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-warm-white">
              <div
                className="h-full rounded-full bg-sage"
                style={{ width: `${region.availability}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-bark/70">
              {region.availability}% indicative availability - feed is {region.feed.toLowerCase()}.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sage-glow bg-warm-white/80 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone">{label}</p>
      <p className="mt-1 font-semibold text-sage-deep">{value}</p>
    </div>
  );
}
