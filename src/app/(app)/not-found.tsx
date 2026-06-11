import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";

export default function AppNotFound() {
  return (
    <Card className="text-center">
      <h2 className="text-lg font-bold text-sage-deep">Page not found.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        We couldn&apos;t find that page. It may have moved, or the link may be
        out of date.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/agreements">Go to agreements</ButtonLink>
        <ButtonLink href="/listings" variant="secondary">
          Browse paddocks
        </ButtonLink>
      </div>
    </Card>
  );
}
