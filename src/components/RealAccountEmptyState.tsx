import { CirclePlus } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";

export function RealAccountEmptyState({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-mist text-sage-deep">
        <CirclePlus className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-xl font-bold text-sage-deep">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        {body}
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
        {secondaryHref && secondaryLabel && (
          <ButtonLink href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}
