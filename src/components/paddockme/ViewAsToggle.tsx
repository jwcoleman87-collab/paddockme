"use client";

import { cn } from "@/lib/utils";
import {
  usePaddockmeWorkflow,
  type Perspective,
} from "@/lib/paddockmeWorkflow";

const SIDES: { value: Perspective; label: string; role: string }[] = [
  { value: "James", label: "James", role: "Livestock owner" },
  { value: "John", label: "John", role: "Landowner" },
];

/**
 * Demo-only perspective switcher: flips the whole workspace between the
 * livestock owner's (James) and the landowner's (John) point of view, so a
 * presenter can play both sides of the negotiation without re-navigating.
 * Both lenses read and write the same shared deal state.
 */
export function ViewAsToggle({ className }: { className?: string }) {
  const { state, setPerspective } = usePaddockmeWorkflow();

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-pm-muted">
        View as
      </span>
      <div
        role="group"
        aria-label="View the workspace as"
        className="inline-flex rounded-full border border-pm-border bg-white p-0.5"
      >
        {SIDES.map((side) => {
          const active = state.perspective === side.value;
          return (
            <button
              key={side.value}
              type="button"
              onClick={() => setPerspective(side.value)}
              aria-pressed={active}
              title={side.role}
              className={cn(
                "min-h-[32px] rounded-full px-3 text-xs font-semibold transition",
                active
                  ? "bg-pm-green-900 text-white"
                  : "text-pm-charcoal hover:text-pm-green-900",
              )}
            >
              {side.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
