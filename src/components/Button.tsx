import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-sage-deep text-warm-white shadow-sm shadow-sage-deep/10 hover:bg-sage-dark hover:shadow-md hover:shadow-sage-deep/15",
  secondary:
    "border border-sage-deep/20 bg-warm-white text-sage-deep shadow-sm shadow-bark/5 hover:border-sage/50 hover:bg-sage-mist hover:shadow-md hover:shadow-sage-deep/10",
  ghost: "text-sage-deep hover:bg-sage-mist hover:shadow-sm hover:shadow-sage-deep/10",
};

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-5 py-3 text-sm font-bold transition-all duration-200 ease-in-out active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(baseClasses, variants[variant], "cursor-pointer", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(baseClasses, variants[variant], "cursor-pointer", className)}
    >
      {children}
    </Link>
  );
}
