import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Stock", "Requirements", "Matches"] as const;

/**
 * Progress bar for the new agistment request flow (spec Screens 3-5):
 * Stock -> Requirements -> Matches. `current` is 1-indexed.
 */
export function RequestProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Request progress" className="mb-6 flex items-center">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  done && "bg-sage-deep text-warm-white",
                  active && "bg-ochre text-bark",
                  !done && !active && "bg-mist text-stone"
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : step}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-bold sm:inline",
                  active || done ? "text-bark" : "text-bark/45"
                )}
              >
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <span
                className={cn(
                  "mx-3 h-px flex-1",
                  done ? "bg-sage-deep/40" : "bg-sage-deep/10"
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
