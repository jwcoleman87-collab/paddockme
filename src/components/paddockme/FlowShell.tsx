import Link from "next/link";
import { PaddockMeLogo } from "./PaddockMeLogo";
import { StepProgress } from "./StepProgress";

const REQUEST_STEPS = ["Stock", "Requirements", "Review", "Matches"];

/**
 * Shared wrapper for the guided agistment request flow:
 * white card on cream background, logo top-left, Save & Exit top-right,
 * numbered step progress underneath.
 */
export function FlowShell({
  step,
  children,
  sideImage,
  sideImageAlt,
}: {
  step: number;
  children: React.ReactNode;
  sideImage?: string;
  sideImageAlt?: string;
}) {
  return (
    <main className="min-h-screen bg-pm-cream-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="grid md:grid-cols-[1fr_minmax(220px,38%)]">
          <div className="px-6 py-6 sm:px-10 sm:py-8">
            <div className="mb-6 flex items-center justify-between">
              <PaddockMeLogo variant="dark" />
              <Link
                href="/"
                className="text-sm font-medium text-pm-muted hover:text-pm-charcoal"
              >
                Save &amp; Exit
              </Link>
            </div>
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
