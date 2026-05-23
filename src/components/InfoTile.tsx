import { cn } from "@/lib/utils";

type InfoTileTone = "default" | "subtle";
type InfoTileSize = "sm" | "md";
type InfoTileIconPlacement = "above" | "inline";

type InfoTileProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** Where to place the icon relative to the label. Ignored when icon is absent. */
  iconPlacement?: InfoTileIconPlacement;
  /** `default` adds a `border-mist` outline. `subtle` drops the border for use inside an already-bordered card. */
  tone?: InfoTileTone;
  /** `md` for stand-alone tiles, `sm` for tighter card-grid contexts. */
  size?: InfoTileSize;
  className?: string;
};

/**
 * Single-source-of-truth tile for label / value pairs across the app.
 * Consolidates the six previous local `Fact` / `Metric` / `Summary` variants
 * (AgreementsPage, ProfilePage, NewRequestPage, ListingCard, ListingDetailPage,
 * TransportDetailPage) into one component so every page feels like the same product.
 */
export function InfoTile({
  label,
  value,
  icon,
  iconPlacement = "above",
  tone = "default",
  size = "md",
  className,
}: InfoTileProps) {
  const container = cn(
    "bg-white shadow-[inset_0_0_0_1px_rgba(109,98,87,0.08)]",
    tone === "default" && "border border-stone/25",
    size === "md" ? "rounded-md p-4" : "rounded-sm p-3.5"
  );

  const showIconAbove = icon && iconPlacement === "above";
  const showIconInline = icon && iconPlacement === "inline";

  return (
    <div className={cn(container, "min-w-0", className)}>
      {showIconAbove && (
        <div className="mb-2 text-sage-deep" aria-hidden>
          {icon}
        </div>
      )}
      <p
        className={cn(
          "text-[0.72rem] font-extrabold uppercase tracking-[0.13em] text-stone",
          showIconInline && "flex items-center gap-1.5"
        )}
      >
        {showIconInline && (
          <span aria-hidden className="inline-flex">
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className="mt-1.5 break-words text-[0.96rem] font-extrabold leading-snug text-bark">{value}</p>
    </div>
  );
}
