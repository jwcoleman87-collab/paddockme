import Link from "next/link";
import { cn } from "@/lib/utils";

type SelectablePillProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      href?: undefined;
      selected?: boolean;
    })
  | (Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "type"> & {
      href: string;
      selected?: boolean;
    });

export function SelectablePill({
  selected,
  children,
  className,
  href,
  ...props
}: SelectablePillProps) {
  const pillClassName = cn(
    "inline-flex min-h-11 items-center gap-2 rounded-[8px] border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white",
    selected
      ? "border-sage-deep bg-sage-deep text-cream"
      : "border-stone/45 bg-warm-white text-bark hover:border-sage/60 hover:bg-sage-mist",
    "cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link
        {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "type">)}
        href={href}
        aria-current={selected ? "page" : undefined}
        className={pillClassName}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={pillClassName}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
