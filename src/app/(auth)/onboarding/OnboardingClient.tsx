"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sprout,
  Tractor,
  Truck,
} from "lucide-react";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes as stockTypeOptions } from "@/lib/dummyData";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type Role = "livestock" | "landowner" | "transport";

type State = {
  role: Role | null;
  region: string | null;
  stockTypes: string[];
  headCountBracket: string | null;
  propertyAcres: string | null;
  suitableStock: string[];
  fleetSize: string | null;
  multiTruck: boolean | null;
};

const roleToAccountType: Record<Role, string> = {
  livestock: "Livestock Owner",
  landowner: "Landowner",
  transport: "Transport Provider",
};

const initialState: State = {
  role: null,
  region: null,
  stockTypes: [],
  headCountBracket: null,
  propertyAcres: null,
  suitableStock: [],
  fleetSize: null,
  multiTruck: null,
};

const roles: { id: Role; label: string; helper: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "livestock",
    label: "I have livestock that need paddocks",
    helper: "Cattle, sheep, horses or goats. Move them to better feed.",
    icon: Sprout,
  },
  {
    id: "landowner",
    label: "I have paddocks that could take stock",
    helper: "Spare grass, idle blocks, agist-out capacity.",
    icon: Tractor,
  },
  {
    id: "transport",
    label: "I move stock for a living",
    helper: "Owner-operator or multi-truck business.",
    icon: Truck,
  },
];

const regions = [
  "Central West NSW",
  "Southern NSW",
  "Northern NSW",
  "Hunter NSW",
  "Northern Tablelands NSW",
  "Riverina NSW",
  "Gippsland VIC",
  "Western VIC",
  "Liverpool Plains",
  "Darling Downs QLD",
  "SE QLD",
  "Wheatbelt WA",
  "Other",
];

const headCountBrackets = ["1-20", "20-100", "100-500", "500+"];
const propertyAcresBrackets = ["Under 100 ac", "100-500 ac", "500-2,000 ac", "2,000+ ac"];
const fleetSizeOptions = ["1 truck", "2-5 trucks", "6-15 trucks", "16+ trucks"];

export function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeRedirectPath(searchParams.get("next"), "/agreements");
  const intentRole = roleFromIntent(searchParams.get("intent"));
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>(() => ({
    ...initialState,
    role: intentRole,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const totalSteps = 3;
  const canAdvance = stepIsComplete(step, state);

  function patch(part: Partial<State>) {
    setState((current) => ({ ...current, ...part }));
  }

  function toggle(arrayKey: "stockTypes" | "suitableStock", value: string) {
    setState((current) => {
      const set = new Set(current[arrayKey]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, [arrayKey]: Array.from(set) };
    });
  }

  function next() {
    if (step < totalSteps) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function finish() {
    if (submitting) return;
    setSubmitting(true);
    setSaveError(null);
    try {
      await persistProfileToSupabase(state);
    } catch (error) {
      // Without a profile row the middleware bounces every navigation back
      // here in a loop, so we have to surface the failure instead of pushing
      // on. Keep the user on this page so they can retry once it's clear
      // what went wrong (most often: missing RLS policy or trigger).
      const message =
        error instanceof Error
          ? error.message
          : "We could not save your onboarding answers.";
      setSaveError(message);
      setSubmitting(false);
      return;
    }
    const params = new URLSearchParams({ onboarded: "true" });
    if (state.role) params.set("role", state.role);
    const separator = nextPath.includes("?") ? "&" : "?";
    router.push(`${nextPath}${separator}${params.toString()}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-warm-white px-5 py-7 sm:px-8 sm:py-8">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-display text-2xl text-sage-deep"
        >
          PaddockME
        </Link>
      </header>

      <StepRail current={step} total={totalSteps} />

      <main className="mt-7 flex-1">
        {step === 0 && (
          <RoleStep
            selected={state.role}
            onSelect={(role) => patch({ role })}
          />
        )}
        {step === 1 && (
          <RegionStep
            selected={state.region}
            onSelect={(region) => patch({ region })}
          />
        )}
        {step === 2 && state.role === "livestock" && (
          <LivestockStep
            stockTypes={state.stockTypes}
            headCountBracket={state.headCountBracket}
            onToggleStock={(value) => toggle("stockTypes", value)}
            onSetHeadCount={(value) => patch({ headCountBracket: value })}
          />
        )}
        {step === 2 && state.role === "landowner" && (
          <LandownerStep
            acres={state.propertyAcres}
            suitableStock={state.suitableStock}
            onSetAcres={(value) => patch({ propertyAcres: value })}
            onToggleStock={(value) => toggle("suitableStock", value)}
          />
        )}
        {step === 2 && state.role === "transport" && (
          <TransportStep
            fleetSize={state.fleetSize}
            multiTruck={state.multiTruck}
            onSetFleet={(value) => patch({ fleetSize: value })}
            onSetMultiTruck={(value) => patch({ multiTruck: value })}
          />
        )}
        {step === 3 && <ReviewStep state={state} />}
      </main>

      <nav
        aria-label="Onboarding navigation"
        className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-mist bg-warm-white px-4 py-2 text-sm font-semibold text-bark transition hover:border-sage/40 hover:bg-sage-mist disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        {step < totalSteps ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-sage-deep px-5 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white sm:w-auto"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={submitting}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-sage-deep px-5 py-2 text-sm font-semibold text-cream transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white sm:w-auto"
          >
            <Check className="h-4 w-4" aria-hidden />
            {submitting ? "Saving…" : "Take me to the app"}
          </button>
        )}
      </nav>
      {saveError && (
        <div
          role="alert"
          className="mt-4 rounded-[8px] border border-terra/40 bg-terra-light/50 px-4 py-3 text-sm leading-relaxed text-bark"
        >
          <p className="font-bold text-sage-deep">
            We couldn&apos;t save your onboarding answers.
          </p>
          <p className="mt-1 text-bark/80">{saveError}</p>
          <p className="mt-2 text-xs text-bark/65">
            Try again in a moment. If this keeps happening, contact support
            so we can check your account configuration.
          </p>
        </div>
      )}
    </div>
  );
}

function StepRail({ current, total }: { current: number; total: number }) {
  return (
    <ol
      aria-label="Onboarding steps"
      className="flex items-center gap-2"
    >
      {Array.from({ length: total + 1 }).map((_, index) => {
        const reached = index < current;
        const isCurrent = index === current;
        return (
          <li
            key={index}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "h-2 flex-1 rounded-full transition",
              reached
                ? "bg-match"
                : isCurrent
                  ? "bg-sage-deep"
                  : "bg-mist"
            )}
          />
        );
      })}
    </ol>
  );
}

function StepHeader({ eyebrow, title, helper }: { eyebrow: string; title: string; helper: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ochre">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl text-sage-deep sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-bark/75 sm:text-base">
        {helper}
      </p>
    </div>
  );
}

function RoleStep({
  selected,
  onSelect,
}: {
  selected: Role | null;
  onSelect: (role: Role) => void;
}) {
  return (
    <section>
      <StepHeader
        eyebrow="Step 1 of 4"
        title="What brings you here?"
        helper="Pick the side of the marketplace that matches you best. You can wear more than one hat later."
      />
      <div className="grid gap-3">
        {roles.map((option) => {
          const active = selected === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={active}
              className={cn(
                "flex min-h-24 cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white sm:p-5",
                active
                  ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                  : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-6 w-6 shrink-0",
                  active ? "text-sage-glow" : "text-sage-deep"
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-base font-bold">{option.label}</p>
                <p
                  className={cn(
                    "mt-1 text-sm leading-relaxed",
                    active ? "text-sage-glow" : "text-bark/70"
                  )}
                >
                  {option.helper}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RegionStep({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (region: string) => void;
}) {
  const isKnownRegion = selected ? regions.includes(selected) : true;
  const otherSelected = selected === "Other" || !isKnownRegion;

  return (
    <section>
      <StepHeader
        eyebrow="Step 2 of 4"
        title="Where are you?"
        helper="Pick the region closest to your operation, or enter your town/locality if it is not listed."
      />
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <SelectablePill
            key={region}
            selected={region === "Other" ? otherSelected : selected === region}
            onClick={() => onSelect(region)}
          >
            {region}
          </SelectablePill>
        ))}
      </div>
      {otherSelected && (
        <div className="mt-5">
          <label
            htmlFor="other-region"
            className="mb-1 block text-sm font-medium text-bark"
          >
            Town or locality
          </label>
          <input
            id="other-region"
            type="text"
            value={selected === "Other" ? "" : selected ?? ""}
            onChange={(event) => onSelect(event.target.value)}
            className="w-full rounded-xl border border-mist bg-warm-white px-4 py-3 outline-none focus:border-sage focus:ring-2 focus:ring-sage-glow"
            placeholder="Braidwood, NSW"
          />
        </div>
      )}
    </section>
  );
}

function LivestockStep({
  stockTypes,
  headCountBracket,
  onToggleStock,
  onSetHeadCount,
}: {
  stockTypes: string[];
  headCountBracket: string | null;
  onToggleStock: (value: string) => void;
  onSetHeadCount: (value: string) => void;
}) {
  return (
    <section className="space-y-7">
      <StepHeader
        eyebrow="Step 3 of 4"
        title="Tell us about the stock."
        helper="Roughly. You can refine the detail later. The numbers stay placeholder until you start a real request."
      />
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Stock types
        </p>
        <div className="flex flex-wrap gap-2">
          {stockTypeOptions.map((option) => (
            <SelectablePill
              key={option}
              selected={stockTypes.includes(option)}
              onClick={() => onToggleStock(option)}
            >
              {option}
            </SelectablePill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Typical head count
        </p>
        <div className="flex flex-wrap gap-2">
          {headCountBrackets.map((option) => (
            <SelectablePill
              key={option}
              selected={headCountBracket === option}
              onClick={() => onSetHeadCount(option)}
            >
              {option}
            </SelectablePill>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandownerStep({
  acres,
  suitableStock,
  onSetAcres,
  onToggleStock,
}: {
  acres: string | null;
  suitableStock: string[];
  onSetAcres: (value: string) => void;
  onToggleStock: (value: string) => void;
}) {
  return (
    <section className="space-y-7">
      <StepHeader
        eyebrow="Step 3 of 4"
        title="Tell us about the country."
        helper="Roughly. The detail (feed, water, fencing) lands in your full listing - this is just so we surface you to the right livestock owners."
      />
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Property size
        </p>
        <div className="flex flex-wrap gap-2">
          {propertyAcresBrackets.map((option) => (
            <SelectablePill
              key={option}
              selected={acres === option}
              onClick={() => onSetAcres(option)}
            >
              {option}
            </SelectablePill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Suitable stock
        </p>
        <div className="flex flex-wrap gap-2">
          {stockTypeOptions.map((option) => (
            <SelectablePill
              key={option}
              selected={suitableStock.includes(option)}
              onClick={() => onToggleStock(option)}
            >
              {option}
            </SelectablePill>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransportStep({
  fleetSize,
  multiTruck,
  onSetFleet,
  onSetMultiTruck,
}: {
  fleetSize: string | null;
  multiTruck: boolean | null;
  onSetFleet: (value: string) => void;
  onSetMultiTruck: (value: boolean) => void;
}) {
  return (
    <section className="space-y-7">
      <StepHeader
        eyebrow="Step 3 of 4"
        title="Tell us about the truck (or trucks)."
        helper="One profile shape covers a single-truck owner-operator and a multi-truck business. The fleet detail lands later in your transport profile."
      />
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Operation size
        </p>
        <div className="flex flex-wrap gap-2">
          {fleetSizeOptions.map((option) => (
            <SelectablePill
              key={option}
              selected={fleetSize === option}
              onClick={() => onSetFleet(option)}
            >
              {option}
            </SelectablePill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone">
          Use sub-contractors?
        </p>
        <div className="flex flex-wrap gap-2">
          <SelectablePill
            selected={multiTruck === true}
            onClick={() => onSetMultiTruck(true)}
          >
            Yes
          </SelectablePill>
          <SelectablePill
            selected={multiTruck === false}
            onClick={() => onSetMultiTruck(false)}
          >
            No
          </SelectablePill>
        </div>
      </div>
    </section>
  );
}

function ReviewStep({ state }: { state: State }) {
  const roleLabel = roles.find((r) => r.id === state.role)?.label ?? "-";
  return (
    <section>
      <StepHeader
        eyebrow="Step 4 of 4"
        title="Looks right?"
        helper="Confirm and we'll save your profile details before sending you into the workspace."
      />
      <dl className="grid gap-3 sm:grid-cols-2">
        <ReviewRow label="Role" value={roleLabel} />
        <ReviewRow label="Region" value={state.region ?? "-"} />
        {state.role === "livestock" && (
          <>
            <ReviewRow
              label="Stock types"
              value={
                state.stockTypes.length > 0 ? state.stockTypes.join(", ") : "-"
              }
            />
            <ReviewRow
              label="Head count"
              value={state.headCountBracket ?? "-"}
            />
          </>
        )}
        {state.role === "landowner" && (
          <>
            <ReviewRow label="Property size" value={state.propertyAcres ?? "-"} />
            <ReviewRow
              label="Suitable stock"
              value={
                state.suitableStock.length > 0
                  ? state.suitableStock.join(", ")
                  : "-"
              }
            />
          </>
        )}
        {state.role === "transport" && (
          <>
            <ReviewRow label="Operation size" value={state.fleetSize ?? "-"} />
            <ReviewRow
              label="Sub-contractors"
              value={
                state.multiTruck === null
                  ? "-"
                  : state.multiTruck
                    ? "Yes"
                    : "No"
              }
            />
          </>
        )}
      </dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mist bg-cream/50 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-stone">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-bark">{value}</dd>
    </div>
  );
}

/**
 * If Supabase is configured AND the user is signed in, write the onboarding
 * answers to public.profiles. The handle_new_user trigger created the row
 * at signup; this fills in account_types / regions / stock_types so the home
 * view can match.
 *
 * Silently no-ops if env vars are missing, no user is signed in, or the
 * insert fails. There is no browser persistence fallback for these answers.
 */
async function persistProfileToSupabase(state: State): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (!state.role) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const stockTypes =
    state.role === "livestock"
      ? state.stockTypes
      : state.role === "landowner"
        ? state.suitableStock
        : [];
  // upsert so this works whether the handle_new_user trigger is
  // applied or not. Trigger applied: the row exists, we update.
  // Trigger missing: we create the row fresh.
  const metaName =
    (user.user_metadata as { full_name?: string } | null)?.full_name ??
    null;
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: metaName,
      account_types: [roleToAccountType[state.role]],
      regions: state.region ? [state.region] : [],
      stock_types: stockTypes,
    },
    { onConflict: "id" }
  );
  if (error) {
    // Bubble up so the caller can show the message instead of trapping the
    // user in a middleware redirect loop with empty account_types.
    throw new Error(error.message);
  }
}

function stepIsComplete(step: number, state: State): boolean {
  if (step === 0) return state.role !== null;
  // For known regions (from the pill list) the value is non-empty. For the
  // "Other" path the value is whatever the user typed - require at least
  // two trimmed characters so an empty string can't slip through after they
  // delete what they typed.
  if (step === 1) {
    if (state.region === null || state.region === "Other") return false;
    return state.region.trim().length > 1;
  }
  if (step === 2) {
    if (state.role === "livestock") {
      return state.stockTypes.length > 0 && state.headCountBracket !== null;
    }
    if (state.role === "landowner") {
      return state.propertyAcres !== null && state.suitableStock.length > 0;
    }
    if (state.role === "transport") {
      return state.fleetSize !== null && state.multiTruck !== null;
    }
    return false;
  }
  return true;
}

function roleFromIntent(value: string | null): Role | null {
  if (value === "livestock" || value === "landowner" || value === "transport") {
    return value;
  }
  return null;
}
