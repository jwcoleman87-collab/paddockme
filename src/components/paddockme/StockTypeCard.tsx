import { cn } from "@/lib/utils";

/**
 * Large selectable card for "What stock do you have?" (spec Screen 3).
 * Same selection pattern as SelectablePill but sized as a card with an icon
 * on top, for the four primary stock choices (Cattle, Sheep, Horses, Other).
 */
export function StockTypeCard({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-[8px] border p-4 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage sm:p-5",
        selected
          ? "border-sage-deep bg-sage-deep text-warm-white shadow-[0_10px_28px_rgba(31,42,36,0.12)]"
          : "border-sage-deep/10 bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-[8px]",
          selected ? "bg-warm-white/15 text-warm-white" : "bg-sage-mist text-sage-deep"
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}
