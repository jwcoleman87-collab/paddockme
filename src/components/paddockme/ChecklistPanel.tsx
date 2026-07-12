import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  label: string;
  done: boolean;
  current?: boolean;
};

/**
 * Progress checklist used in the workspace overview and the agreement
 * screen. Icons + labels (never colour alone) mark progress.
 */
export function ChecklistPanel({
  title,
  items,
  className,
}: {
  title?: string;
  items: ChecklistItem[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-pm-muted">
          {title}
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
              item.current
                ? "bg-pm-green-900 font-semibold text-white"
                : item.done
                  ? "text-pm-charcoal"
                  : "text-pm-muted",
            )}
          >
            {item.done ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pm-success text-white">
                <Check className="h-3 w-3" aria-label="Done" />
              </span>
            ) : (
              <Circle
                className={cn(
                  "h-5 w-5",
                  item.current ? "text-pm-gold-500" : "text-pm-border",
                )}
                aria-label={item.current ? "Current step" : "Not started"}
              />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
