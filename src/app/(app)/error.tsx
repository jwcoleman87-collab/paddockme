"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="text-center">
      <h2 className="text-lg font-bold text-sage-deep">Something went wrong.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        We hit an unexpected error loading this page. You can try again, or head
        back to your agreements.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/agreements" variant="secondary">
          Go to agreements
        </ButtonLink>
      </div>
    </Card>
  );
}
