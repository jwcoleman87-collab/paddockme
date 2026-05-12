import { cn } from "@/lib/utils";

export function SelectablePill({
  selected,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white",
        selected
          ? "border-sage-deep bg-sage-deep text-cream"
          : "border-stone/45 bg-warm-white text-bark hover:border-sage/60 hover:bg-sage-mist",
        "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
