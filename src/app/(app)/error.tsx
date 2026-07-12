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
    <Card className="mx-auto max-w-2xl px-5 py-8 text-center sm:px-8">
      <h2 className="text-lg font-bold text-sage-deep">Something went wrong.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bark/70">
        We hit an unexpected error loading this page. You can try again, or head
        back to My work.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/agreements" variant="secondary">
          Go to My work
        </ButtonLink>
      </div>
    </Card>
  );
}
