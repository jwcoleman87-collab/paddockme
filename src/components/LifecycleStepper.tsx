import { Check, CircleDot, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgreementLifecycleState } from "@/lib/dummyData";

const forwardStates: AgreementLifecycleState[] = [
  "Draft",
  "Negotiating",
  "Ready to finalise",
  "Active",
  "Completed",
];

export function LifecycleStepper({
  current,
}: {
  current: AgreementLifecycleState;
}) {
  if (current === "Cancelled") {
    return <CancelledRail />;
  }

  const currentIndex = forwardStates.indexOf(current);

  return (
    <ol
      aria-label="Agreement lifecycle"
      className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0"
    >
      {forwardStates.map((state, index) => {
        const reached = index < currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = reached ? Check : isCurrent ? CircleDot : Empty;
        return (
          <li
            key={state}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2 sm:flex-col sm:items-start sm:gap-1.5 sm:rounded-none sm:border-y sm:border-x-0 sm:px-3 sm:py-2",
              "sm:first:rounded-l-xl sm:first:border-l",
              "sm:last:rounded-r-xl sm:last:border-r",
              reached
                ? "border-match/25 bg-match-light/65"
                : isCurrent
                  ? "border-sage-deep/40 bg-sage-mist"
                  : "border-mist bg-warm-white"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                reached
                  ? "bg-match text-cream"
                  : isCurrent
                    ? "bg-sage-deep text-cream"
                    : "border border-mist bg-warm-white text-stone"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[0.65rem] font-bold uppercase tracking-wide",
                  reached
                    ? "text-match"
                    : isCurrent
                      ? "text-sage-deep"
                      : "text-stone"
                )}
              >
                Step {index + 1}
              </p>
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  reached || isCurrent ? "text-bark" : "text-bark/55"
                )}
              >
                {state}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CancelledRail() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-terra/30 bg-terra-light/55 px-4 py-3">
      <XCircle className="h-5 w-5 shrink-0 text-terra" aria-hidden />
      <div className="min-w-0">
        <p className="text-[0.65rem] font-bold uppercase tracking-wide text-terra">
          Lifecycle
        </p>
        <p className="text-sm font-semibold text-bark">
          Agreement cancelled. No further actions can be taken.
        </p>
      </div>
    </div>
  );
}

function Empty({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full bg-mist", className)}
      aria-hidden
    />
  );
}
