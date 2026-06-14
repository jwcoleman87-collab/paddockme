import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-pm-green-900 text-white hover:bg-pm-green-800 shadow-sm",
  accent:
    "bg-pm-gold-500 text-pm-charcoal hover:bg-pm-gold-600 shadow-sm",
  outline:
    "border border-pm-border bg-white text-pm-charcoal hover:border-pm-green-900",
  ghost: "text-pm-green-900 hover:bg-pm-cream-100",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors min-h-[44px] cursor-pointer";

/** Big, field-friendly button. Renders a Link when href is given. */
export function PmButton({
  variant = "primary",
  href,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cn(base, styles[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
