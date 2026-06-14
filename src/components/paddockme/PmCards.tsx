import Link from "next/link";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Rating ---------- */

export function Rating({
  value,
  reviews,
  className,
}: {
  value: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold text-pm-charcoal",
        className,
      )}
    >
      <Star
        className="h-4 w-4 fill-pm-gold-500 text-pm-gold-500"
        aria-hidden
      />
      {value.toFixed(1)}
      {reviews != null && (
        <span className="font-normal text-pm-muted">({reviews})</span>
      )}
    </span>
  );
}

/* ---------- Badge (water, fencing, accreditation, etc.) ---------- */

export function Badge({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-pm-border bg-pm-cream-50 px-3 py-1 text-xs font-medium text-pm-charcoal",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------- RoleChoiceCard (homepage: Need Feed / Have Feed / Transport) ---------- */

export function RoleChoiceCard({
  href,
  icon,
  title,
  subtitle,
  accent = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-1 items-center gap-4 rounded-xl px-6 py-5 shadow-lg transition-transform hover:-translate-y-0.5",
        accent
          ? "bg-pm-gold-500 text-pm-charcoal"
          : "bg-pm-green-900 text-white",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-pm-charcoal/10" : "bg-white/10",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span>
        <span className="block text-base font-bold uppercase tracking-wide">
          {title}
        </span>
        <span
          className={cn(
            "block text-sm",
            accent ? "text-pm-charcoal/70" : "text-white/70",
          )}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}

/* ---------- LivestockTypeCard (request step 1) ---------- */

export function LivestockTypeCard({
  label,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 bg-white text-sm font-semibold transition-colors cursor-pointer",
        selected
          ? "border-pm-green-900 text-pm-green-900"
          : "border-pm-border text-pm-muted hover:border-pm-green-700",
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pm-green-900 text-white">
          <Check className="h-3 w-3" aria-label="Selected" />
        </span>
      )}
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}

/* ---------- PropertyFactCard (property detail facts) ---------- */

export function PropertyFactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-pm-border bg-white px-4 py-4 text-center shadow-sm">
      <span className="text-pm-green-900" aria-hidden>
        {icon}
      </span>
      <span className="text-xs font-semibold text-pm-charcoal">{label}</span>
      <span className="text-xs text-pm-muted">{value}</span>
    </div>
  );
}

/* ---------- OwnerCard ---------- */

export function OwnerCard({
  name,
  memberSince,
  rating,
  action,
}: {
  name: string;
  memberSince: string;
  rating: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-pm-border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full bg-pm-green-900 text-base font-bold text-white"
          aria-hidden
        >
          {name
            .split(" ")
            .map((p) => p[0])
            .join("")}
        </span>
        <div>
          <p className="text-sm font-bold text-pm-charcoal">{name}</p>
          <p className="text-xs text-pm-muted">
            Member since {memberSince} · <Rating value={rating} className="text-xs" />
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

/* ---------- RecentActivityCard (homepage strip) ---------- */

export function RecentActivityCard({
  icon,
  headline,
  detail,
}: {
  icon: React.ReactNode;
  headline: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-pm-border bg-white px-5 py-4 shadow-sm">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pm-cream-100 text-pm-green-900"
        aria-hidden
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-pm-charcoal">{headline}</p>
        <p className="text-xs text-pm-muted">{detail}</p>
      </div>
    </div>
  );
}

/* ---------- DealSummaryCard (workspace overview) ---------- */

export function DealSummaryCard({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-pm-border bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} className="h-28 w-full object-cover" />
      <div className="px-4 py-3">
        <p className="text-sm font-bold text-pm-charcoal">{title}</p>
        <p className="text-xs text-pm-muted">{subtitle}</p>
      </div>
    </div>
  );
}
