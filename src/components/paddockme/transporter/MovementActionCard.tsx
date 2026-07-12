import { Check, Circle, Navigation, Truck } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";
import { cn } from "@/lib/utils";

export type MovementStepView = { key: string; label: string };

export function MovementActionCard({
  steps,
  currentStep,
  nextLabel,
  onAdvance,
  disabled = false,
}: {
  steps: readonly MovementStepView[];
  currentStep: string | null;
  nextLabel: string | null;
  onAdvance: () => void;
  disabled?: boolean;
}) {
  const currentIndex = currentStep
    ? steps.findIndex((step) => step.key === currentStep)
    : -1;
  const currentLabel =
    currentIndex >= 0 ? steps[currentIndex].label : "Ready to begin";
  const complete = currentIndex === steps.length - 1;

  const timeline = (
    <ol className="mt-3 space-y-1">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li
            key={step.key}
            className={cn(
              "flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
              current
                ? "bg-pm-green-900 font-bold text-white"
                : done
                  ? "font-semibold text-pm-charcoal"
                  : "text-pm-muted",
            )}
          >
            {done ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pm-success text-white">
                <Check className="h-3 w-3" aria-label="Done" />
              </span>
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-pm-border" aria-label="Upcoming" />
            )}
            {step.label}
          </li>
        );
      })}
    </ol>
  );

  return (
    <section className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
          {complete ? <Truck className="h-5 w-5" aria-hidden /> : <Navigation className="h-5 w-5" aria-hidden />}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-pm-muted">Current movement status</p>
          <h2 className="mt-0.5 text-lg font-extrabold text-pm-charcoal">{currentLabel}</h2>
          <p className="mt-1 text-sm text-pm-muted">
            {complete
              ? "Delivery is complete and visible to all three parties."
              : "Post one clear update and James and John see it immediately."}
          </p>
        </div>
      </div>

      {nextLabel && (
        <PmButton
          type="button"
          variant="accent"
          onClick={onAdvance}
          disabled={disabled}
          className="mt-5 w-full"
        >
          <Truck className="h-4 w-4" aria-hidden />
          Update: {nextLabel}
        </PmButton>
      )}

      <details className="mt-4 md:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-pm-green-900">
          View full movement timeline
        </summary>
        {timeline}
      </details>
      <div className="mt-5 hidden md:block">
        <h3 className="text-xs font-bold uppercase tracking-wider text-pm-muted">Movement timeline</h3>
        {timeline}
      </div>
    </section>
  );
}
