import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-sage-deep/70">
        404
      </p>
      <h1 className="text-2xl font-bold text-sage-deep">Page not found.</h1>
      <p className="max-w-md text-sm leading-relaxed text-bark/70">
        We couldn&apos;t find that page. It may have moved, or the link may be
        out of date.
      </p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </main>
  );
}
