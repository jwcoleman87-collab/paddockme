import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Numbered progress indicator for the request flow:
 * Stock → Requirements → Review → Matches.
 * Uses icon + label (not colour alone) so progress reads for everyone.
 */
export function StepProgress({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // 1-based index of the active step
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center justify-center gap-0", className)}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex items-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "mx-2 h-px w-8 sm:w-14",
                  done || active ? "bg-pm-green-900" : "bg-pm-border",
                )}
              />
            )}
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  active && "bg-pm-green-900 text-white",
                  done && "bg-pm-green-700 text-white",
                  !active && !done &&
                    "border border-pm-border bg-white text-pm-muted",
                )}
              >
                {done ? <Check className="h-4 w-4" aria-label="Done" /> : n}
              </span>
              <span
                className={cn(
                  "text-xs",
                  active ? "font-semibold text-pm-green-900" : "text-pm-muted",
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
