import Link from "next/link";
import { PaddockMeLogo } from "./PaddockMeLogo";
import { StepProgress } from "./StepProgress";

const REQUEST_STEPS = ["Stock", "Requirements", "Matches"];

/**
 * Shared wrapper for the guided agistment request flow:
 * white card on cream background, logo top-left, Save & exit top-right,
 * numbered step progress underneath.
 *
 * `journey` repeats the wording of the homepage tile the visitor chose, so
 * the choice keeps following them instead of disappearing at the first
 * screen. The exit is honest: every field is written to localStorage as it
 * changes, so leaving really does keep the answers.
 */
export function FlowShell({
  step,
  journey,
  children,
  sideImage,
  sideImageAlt,
}: {
  step: number;
  journey?: string;
  children: React.ReactNode;
  sideImage?: string;
  sideImageAlt?: string;
}) {
  return (
    <main className="min-h-screen bg-pm-cream-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="grid md:grid-cols-[1fr_minmax(220px,38%)]">
          <div className="px-6 py-6 sm:px-10 sm:py-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <PaddockMeLogo variant="dark" />
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-pm-muted hover:text-pm-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pm-gold-500"
              >
                Save &amp; exit
              </Link>
            </div>
            {journey && (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-pm-gold-600">
                {journey}
              </p>
            )}
            <StepProgress steps={REQUEST_STEPS} current={step} className="mb-8" />
            {children}
          </div>
          {sideImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sideImage}
              alt={sideImageAlt ?? ""}
              className="hidden h-full w-full object-cover md:block"
            />
          )}
        </div>
      </div>
    </main>
  );
}
