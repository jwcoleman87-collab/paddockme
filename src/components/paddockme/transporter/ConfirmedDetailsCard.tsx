import { CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmedMovementDetail = {
  id: string;
  label: string;
  value: string;
  confirmedBy: string;
};

export function ConfirmedDetailsCard({
  details,
  title = "Confirmed movement details",
  compact = false,
  className,
}: {
  details: readonly ConfirmedMovementDetail[];
  title?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-pm-success/30 bg-pm-success/5 p-5 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pm-success text-white">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-pm-charcoal">{title}</h2>
          <p className="mt-0.5 text-sm text-pm-muted">
            Visible to James, John and Wayne.
          </p>
        </div>
      </div>

      <dl className={cn("mt-4 grid gap-2", !compact && "sm:grid-cols-2")}>
        {details.map((detail) => (
          <div key={detail.id} className="rounded-xl border border-pm-success/20 bg-white px-4 py-3">
            <dt className="flex items-center gap-2 text-sm font-bold text-pm-charcoal">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-pm-success" aria-hidden />
              {detail.label}
            </dt>
            <dd className="mt-1 pl-6 text-sm leading-relaxed text-pm-muted">
              {detail.value}
            </dd>
            <dd className="mt-1 flex items-center gap-1.5 pl-6 text-xs font-semibold text-pm-green-900">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Confirmed by {detail.confirmedBy}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
