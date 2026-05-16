import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { livestockRequests } from "@/lib/dummyData";
import { cn } from "@/lib/utils";

type FlowContextBarProps = {
  step: string;
  label?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function FlowContextBar({
  step,
  label = "Your request",
  backHref,
  backLabel = "Back",
  className,
}: FlowContextBarProps) {
  const request = livestockRequests[0];
  const summary = `${request.headCount} ${request.breed} ${request.stockType} - ${request.preferredRegions.join(", ")} - ${request.duration}`;

  return (
    <section
      className={cn(
        "mb-3 rounded-lg border border-sage-deep/20 bg-cream/90 px-3 py-2 shadow-sm shadow-bark/5",
        className
      )}
      aria-label="Current request context"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
            {label}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-sage-deep">
            {summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-8 items-center rounded-md bg-sage-mist px-2.5 py-1 text-xs font-bold text-sage-deep">
            {step}
          </span>
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-sage-deep/30 bg-warm-white px-2.5 py-1 text-xs font-bold text-sage-deep hover:bg-sage-mist"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {backLabel}
            </Link>
          )}
          <Link
            href="/request/new"
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-sage-deep/30 bg-warm-white px-2.5 py-1 text-xs font-bold text-sage-deep hover:bg-sage-mist"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit request
          </Link>
        </div>
      </div>
    </section>
  );
}
