import { cn } from "@/lib/utils";

/**
 * PmAvatar — a party's face (or placeholder company logo) with an initials
 * fallback. Every surface that shows a customer uses this so the demo reads
 * as real people doing a real deal, not anonymous initials.
 */
export function PmAvatar({
  src,
  initials,
  className,
  fallbackClassName,
}: {
  /** Photo/logo path from paddockmeImages. Falls back to initials when absent. */
  src?: string;
  initials: string;
  /** Size + shape overrides, e.g. "h-12 w-12". Defaults to a 32px circle. */
  className?: string;
  /** Colour chip for the initials fallback, e.g. "bg-pm-green-900 text-white". */
  fallbackClassName?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn(
          "h-8 w-8 shrink-0 rounded-full border border-pm-border object-cover",
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
        fallbackClassName,
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
