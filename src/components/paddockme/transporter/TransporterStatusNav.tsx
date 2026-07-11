import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Navigation,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TransporterView =
  | "available"
  | "quotes"
  | "awarded"
  | "active"
  | "completed"
  | "messages";

const items = [
  { key: "available", label: "Available", icon: BriefcaseBusiness },
  { key: "quotes", label: "My quotes", icon: FileText },
  { key: "awarded", label: "Awarded", icon: Trophy },
  { key: "active", label: "Active", icon: Navigation },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "messages", label: "Messages", icon: MessageSquareText },
] as const;

export function TransporterStatusNav({
  active,
  counts,
}: {
  active: TransporterView;
  counts: Record<TransporterView, number>;
}) {
  return (
    <nav aria-label="Transport work" className="rounded-2xl border border-pm-border bg-white p-2 shadow-sm">
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {items.map(({ key, label, icon: Icon }) => {
          const selected = active === key;
          return (
            <Link
              key={key}
              href={key === "available" ? "/transport/demo" : `/transport/demo?view=${key}`}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-pm-green-900",
                selected
                  ? "bg-pm-green-900 text-white"
                  : "text-pm-charcoal hover:bg-pm-cream-100",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px]",
                  selected
                    ? "bg-pm-gold-500 text-pm-charcoal"
                    : "bg-pm-cream-100 text-pm-green-900",
                )}
                aria-label={`${counts[key]} ${label.toLowerCase()}`}
              >
                {counts[key]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function isTransporterView(value: string | string[] | undefined): value is TransporterView {
  return (
    typeof value === "string" &&
    items.some((item) => item.key === value)
  );
}
