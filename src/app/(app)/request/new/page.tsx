"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * /request/new — agistment request creation flow.
 *
 * Mobile-first single-page form. Low typing, high selection.
 * Every field is chips, slider, or toggle — never a free-text input.
 * Submits straight into public.agistment_requests with status='matching'.
 *
 * Schema fields populated:
 *   stock_type, head_count, duration, preferred_regions,
 *   urgency, required_pasture, required_water, required_yards,
 *   required_ramp, required_shelter
 */

// --- option data ----------------------------------------------------------

const STOCK_TYPES = [
  { value: "cattle", label: "Cattle" },
  { value: "sheep", label: "Sheep" },
  { value: "horses", label: "Horses" },
  { value: "goats", label: "Goats" },
] as const;

const DURATIONS = [
  { value: "1_week", label: "1 week" },
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "6_months", label: "6 months" },
  { value: "12_months", label: "12 months" },
  { value: "open_ended", label: "Open-ended" },
] as const;

const URGENCIES = [
  { value: "flexible", label: "Flexible — anytime in the next month" },
  { value: "standard", label: "Standard — within 2 weeks" },
  { value: "urgent", label: "Urgent — this week" },
] as const;

const PASTURES = [
  { value: "no_preference", label: "No preference" },
  { value: "improved", label: "Improved" },
  { value: "native", label: "Native" },
  { value: "mixed", label: "Mixed" },
] as const;

// Australian agistment regions, organised by state. Starter set — refine later.
const REGIONS: { state: string; regions: string[] }[] = [
  {
    state: "NSW",
    regions: [
      "Central West",
      "Hunter Valley",
      "Riverina",
      "Northern Tablelands",
      "North Coast",
      "South Coast",
      "Monaro",
    ],
  },
  {
    state: "VIC",
    regions: [
      "Gippsland",
      "Western Victoria",
      "Goulburn Valley",
      "Wimmera",
      "Mallee",
      "North East",
    ],
  },
  {
    state: "QLD",
    regions: [
      "Darling Downs",
      "Central Queensland",
      "North Queensland",
      "South East Queensland",
      "Western Queensland",
    ],
  },
  {
    state: "SA",
    regions: ["Riverland", "Murraylands", "Mid North", "South East", "Eyre Peninsula"],
  },
  {
    state: "WA",
    regions: ["South West", "Wheatbelt", "Great Southern", "Mid West"],
  },
  {
    state: "TAS",
    regions: ["Northern Tasmania", "Southern Tasmania", "North West Tasmania"],
  },
  { state: "NT", regions: ["Top End", "Centre"] },
];

// --- page -----------------------------------------------------------------

export default function NewRequestPage() {
  const router = useRouter();

  const [stockType, setStockType] = useState<string | null>(null);
  const [headCount, setHeadCount] = useState<number>(50);
  const [duration, setDuration] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<string>("standard");
  const [pasture, setPasture] = useState<string>("no_preference");
  const [water, setWater] = useState<boolean>(true);
  const [yards, setYards] = useState<boolean>(false);
  const [ramp, setRamp] = useState<boolean>(false);
  const [shelter, setShelter] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    stockType !== null && duration !== null && regions.length > 0 && headCount > 0;

  function toggleRegion(r: string) {
    setRegions((current) =>
      current.includes(r) ? current.filter((x) => x !== r) : [...current, r]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You need to be signed in to post a request.");
      setSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("agistment_requests")
      .insert([
        {
          requester_id: user.id,
          stock_type: stockType!,
          head_count: headCount,
          duration: duration!,
          preferred_regions: regions,
          urgency,
          required_pasture: pasture === "no_preference" ? null : pasture,
          required_water: water,
          required_yards: yards,
          required_ramp: ramp,
          required_shelter: shelter,
          status: "matching",
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // For now, send them to /matches. Later we'll route to the request detail page.
    router.push(`/matches?request=${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 md:py-12">
      <header className="mb-10">
        <h1 className="font-display italic text-4xl md:text-5xl text-sage-deep mb-3">
          Find a paddock for your stock.
        </h1>
        <p className="text-bark/70 max-w-xl leading-relaxed">
          A few taps. We&rsquo;ll match you with landowners who have the pasture,
          water, and fencing your livestock need.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-12">
        {/* 1. Stock type */}
        <Section
          step="1"
          question="What stock are we placing?"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STOCK_TYPES.map(({ value, label }) => (
              <ChipBig
                key={value}
                selected={stockType === value}
                onClick={() => setStockType(value)}
              >
                {label}
              </ChipBig>
            ))}
          </div>
        </Section>

        {/* 2. Head count */}
        <Section step="2" question="How many head?">
          <div className="rounded-2xl bg-cream border border-mist p-6">
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-display italic text-3xl text-sage-deep">
                {headCount}
              </span>
              <span className="text-sm text-bark/60">head</span>
            </div>
            <input
              type="range"
              min={1}
              max={2000}
              step={headCount < 50 ? 1 : headCount < 200 ? 5 : 10}
              value={headCount}
              onChange={(e) => setHeadCount(parseInt(e.target.value, 10))}
              className="w-full accent-sage-deep cursor-pointer"
            />
            <div className="flex justify-between text-xs text-stone mt-2">
              <span>1</span>
              <span>500</span>
              <span>1,000</span>
              <span>1,500</span>
              <span>2,000</span>
            </div>
          </div>
        </Section>

        {/* 3. Duration */}
        <Section step="3" question="For how long?">
          <ChipRow>
            {DURATIONS.map(({ value, label }) => (
              <Chip
                key={value}
                selected={duration === value}
                onClick={() => setDuration(value)}
              >
                {label}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        {/* 4. Regions (multi-select) */}
        <Section
          step="4"
          question="Where can you send them?"
          hint="Pick every region you'll consider — more options means better matches."
        >
          <div className="space-y-5">
            {REGIONS.map(({ state, regions: rs }) => (
              <div key={state}>
                <div className="text-xs font-semibold tracking-widest text-stone mb-2">
                  {state}
                </div>
                <ChipRow>
                  {rs.map((r) => (
                    <Chip
                      key={r}
                      selected={regions.includes(r)}
                      onClick={() => toggleRegion(r)}
                    >
                      {r}
                    </Chip>
                  ))}
                </ChipRow>
              </div>
            ))}
          </div>
          {regions.length > 0 && (
            <p className="text-xs text-sage-deep mt-4">
              {regions.length} region{regions.length === 1 ? "" : "s"} selected
            </p>
          )}
        </Section>

        {/* 5. Urgency */}
        <Section step="5" question="How urgent is this?">
          <div className="space-y-2">
            {URGENCIES.map(({ value, label }) => (
              <ChipWide
                key={value}
                selected={urgency === value}
                onClick={() => setUrgency(value)}
              >
                {label}
              </ChipWide>
            ))}
          </div>
        </Section>

        {/* 6. Pasture preference */}
        <Section step="6" question="Pasture preference?">
          <ChipRow>
            {PASTURES.map(({ value, label }) => (
              <Chip
                key={value}
                selected={pasture === value}
                onClick={() => setPasture(value)}
              >
                {label}
              </Chip>
            ))}
          </ChipRow>
        </Section>

        {/* 7. Required facilities */}
        <Section
          step="7"
          question="Required facilities?"
          hint="Toggle on what you need. We'll only show paddocks that have them."
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Toggle on={water} onClick={() => setWater(!water)}>
              Permanent water
            </Toggle>
            <Toggle on={yards} onClick={() => setYards(!yards)}>
              Stock yards
            </Toggle>
            <Toggle on={ramp} onClick={() => setRamp(!ramp)}>
              Loading ramp
            </Toggle>
            <Toggle on={shelter} onClick={() => setShelter(!shelter)}>
              Shelter
            </Toggle>
          </div>
        </Section>

        {/* Error + submit */}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-terra/40 bg-terra-light text-terra px-4 py-3 text-sm"
          >
            {error}
          </p>
        )}

        <div className="sticky bottom-24 z-10 bg-warm-white/90 backdrop-blur-sm pt-2 pb-2 -mx-6 px-6 border-t border-mist">
          <button
            type="submit"
            disabled={!valid || submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-sage-deep px-6 py-4 font-medium text-cream hover:bg-sage-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {submitting ? "Posting your request…" : "Post request and find matches"}
          </button>
          {!valid && !submitting && (
            <p className="mt-2 text-center text-xs text-stone">
              Pick a stock type, duration, and at least one region to continue.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

// --- inline UI primitives -------------------------------------------------
// Kept inline for now. When we add a second form (paddock listing flow),
// extract Chip / Toggle / Section into src/components/ui/.

function Section({
  step,
  question,
  hint,
  children,
}: {
  step: string;
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-xs font-semibold tracking-widest text-ochre">
          STEP {step}
        </span>
      </div>
      <h2 className="font-display italic text-2xl md:text-3xl text-sage-deep mb-1">
        {question}
      </h2>
      {hint && <p className="text-sm text-bark/60 mb-4">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer " +
        (selected
          ? "bg-sage-deep text-cream"
          : "bg-cream border border-mist text-bark hover:border-sage-deep/30")
      }
    >
      {children}
    </button>
  );
}

function ChipWide({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full text-left rounded-xl px-5 py-3 text-sm font-medium transition cursor-pointer " +
        (selected
          ? "bg-sage-deep text-cream"
          : "bg-cream border border-mist text-bark hover:border-sage-deep/30")
      }
    >
      {children}
    </button>
  );
}

function ChipBig({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center justify-center rounded-2xl px-4 py-5 font-medium transition cursor-pointer " +
        (selected
          ? "bg-sage-deep text-cream"
          : "bg-cream border border-mist text-bark hover:border-sage-deep/30")
      }
    >
      {children}
    </button>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer " +
        (on
          ? "bg-sage-mist border border-sage-glow text-sage-deep"
          : "bg-cream border border-mist text-bark hover:border-sage-deep/30")
      }
    >
      <span>{children}</span>
      <span
        className={
          "inline-flex items-center w-10 h-5 rounded-full transition " +
          (on ? "bg-sage-deep" : "bg-mist")
        }
        aria-hidden
      >
        <span
          className={
            "inline-block w-4 h-4 bg-warm-white rounded-full transition transform " +
            (on ? "translate-x-5" : "translate-x-0.5")
          }
        />
      </span>
    </button>
  );
}
