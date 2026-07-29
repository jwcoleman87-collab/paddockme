import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * PADDOCKME wordmark. "PADDOCK" in the base colour, "ME" in gold.
 * variant "light" = white text for dark green headers.
 * variant "dark"  = dark green text for cream/white headers.
 */
export function PaddockMeLogo({
  variant = "light",
  className,
  href = "/",
}: {
  variant?: "light" | "dark";
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        // The wordmark is also the way back to the start, so it has to be a
        // comfortable target on a phone — not a 28px-tall line of text.
        "inline-flex min-h-11 items-center rounded-md font-extrabold tracking-wide text-xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pm-gold-500",
        variant === "light" ? "text-white" : "text-pm-green-900",
        className,
      )}
    >
      PADDOCK
      <span className="text-pm-gold-500">ME</span>
    </Link>
  );
}
