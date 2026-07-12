import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import { GuidedDemoBadge, GuidedDemoResetAction } from "@/components/paddockme/GuidedDemo";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";

export function TransporterShell({
  title,
  description,
  backHref,
  backLabel = "Available jobs",
  status,
  children,
  showReset = true,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  status?: string;
  children: React.ReactNode;
  showReset?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-pm-cream-50">
      <header className="sticky top-0 z-30 border-b border-pm-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <PaddockMeLogo variant="dark" />
          <div className="flex items-center gap-2">
            <GuidedDemoBadge />
            <span className="hidden items-center gap-2 rounded-full bg-pm-cream-100 px-3 py-1.5 text-sm font-bold text-pm-charcoal sm:inline-flex">
              <Truck className="h-4 w-4 text-pm-green-900" aria-hidden />
              Wayne Transport
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-pm-green-900 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-pm-green-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wider text-pm-gold-600">
              Wayne Transport · Transporter workspace
            </p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-pm-charcoal sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-base leading-relaxed text-pm-muted">
                {description}
              </p>
            )}
          </div>
          {status && (
            <span className="inline-flex min-h-9 items-center rounded-full bg-pm-green-900 px-3 py-1 text-sm font-bold text-white">
              {status}
            </span>
          )}
        </div>

        <div className="mt-6">{children}</div>
      </main>

      <footer className="border-t border-pm-border bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-pm-charcoal">
            One movement. Three parties. One shared plan.
          </p>
          {showReset && <GuidedDemoResetAction className="w-full sm:w-auto" />}
        </div>
      </footer>
    </div>
  );
}
