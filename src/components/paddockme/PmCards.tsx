import Link from "next/link";
import { Check, MoveRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PmAvatar } from "./PmAvatar";

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
  actionLabel,
  accent = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-40 flex-1 items-start gap-4 rounded-lg border px-5 py-5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pm-gold-500 sm:px-6",
        accent
          ? "border-pm-gold-500 bg-pm-gold-500 text-pm-charcoal hover:bg-pm-gold-600"
          : "border-pm-green-900 bg-pm-green-900 text-white hover:bg-pm-green-800",
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
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold">
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
        {actionLabel && (
          <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline decoration-2 underline-offset-4">
            {actionLabel}
            <MoveRight className="h-4 w-4" aria-hidden />
          </span>
        )}
      </span>
    </Link>
  );
}

/* ---------- LivestockTypeCard (request step 1) ---------- */

export function LivestockTypeCard({
  label,
  icon,
  image,
  selected,
  onSelect,
}: {
  label: string;
  icon?: React.ReactNode;
  image?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-28 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 bg-white text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pm-gold-500",
        selected
          ? "border-pm-gold-500 text-pm-green-900 shadow-sm"
          : "border-pm-border text-pm-muted hover:border-pm-green-700",
      )}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <span className="mb-1 text-pm-green-900" aria-hidden>
          {icon}
        </span>
      )}
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-pm-gold-500 text-pm-charcoal ring-2 ring-white">
          <Check className="h-3 w-3" aria-label="Selected" />
        </span>
      )}
      <span
        className={cn(
          image
            ? "absolute inset-x-0 bottom-0 z-10 px-3 py-2.5 text-left font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]"
            : "text-sm font-bold",
        )}
      >
        {label}
      </span>
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
  avatar,
  action,
}: {
  name: string;
  memberSince: string;
  rating: number;
  avatar?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-pm-border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <PmAvatar
          src={avatar}
          initials={name
            .split(" ")
            .map((p) => p[0])
            .join("")}
          className="h-11 w-11 text-base"
          fallbackClassName="bg-pm-green-900 text-white"
        />
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
