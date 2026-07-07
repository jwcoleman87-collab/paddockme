"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  CircleDollarSign,
  CreditCard,
  FileText,
  Flag,
  LandPlot,
  MessageSquare,
  MoveRight,
  Receipt,
  Truck,
} from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { cn } from "@/lib/utils";
import { demoLandowner, demoRequest } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  parseAgreementDates,
  livestockLabel,
  type TransportStatus,
} from "@/lib/paddockmeWorkflow";

const TRANSPORT_STEPS: { key: TransportStatus; label: string }[] = [
  { key: "booked", label: "Booked" },
  { key: "picked_up", label: "Picked up" },
  { key: "en_route", label: "En route" },
  { key: "delivered", label: "Delivered" },
];

/**
 * Screen 13 — Live Agreement: the executed deal's home base for the life
 * of the agistment (docs/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md). Read-only
 * facts, a live status timeline, and post-completion actions. Everything
 * reads through usePaddockmeWorkflow so this screen survives the later
 * Supabase provider swap unchanged.
 */
export default function LiveAgreementPage() {
  const { state, isComplete, hasHydrated } = usePaddockmeWorkflow();
  const { agreement } = state;

  // Wait for the stored session before branching, so a mid-flow refresh
  // doesn't flash the "nothing live yet" state at a completed agreement.
  if (!hasHydrated) {
    return <div className="min-h-screen bg-pm-cream-50" />;
  }

  if (!isComplete) {
    return (
      <div className="flex min-h-screen flex-col bg-pm-cream-50">
        <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <PaddockMeLogo variant="dark" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-pm-border bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-pm-charcoal">
              Nothing live yet
            </h1>
            <p className="mt-2 text-sm text-pm-muted">
              The live agreement appears here once the terms are agreed,
              transport is booked and the review is accepted.
            </p>
            <PmButton
              href="/workspaces/1023/agreement"
              className="mt-6 w-full sm:w-auto"
            >
              Continue the Agreement
              <MoveRight className="h-4 w-4" aria-hidden />
            </PmButton>
          </div>
        </main>
        <AppBottomNav />
      </div>
    );
  }

  const acceptedDate = agreement.acceptedAt
    ? new Date(agreement.acceptedAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const summaryRows = [
    {
      icon: CattleIcon,
      label: "Livestock",
      value: livestockLabel(state.request),
    },
    {
      icon: LandPlot,
      label: "Property",
      value: `Green Hills Farm, ${demoRequest.targetLocation}`,
    },
    {
      icon: CalendarDays,
      label: "Duration",
      value: agreement.datesLabel
        ? `${demoRequest.duration} · ${agreement.datesLabel}`
        : demoRequest.duration,
    },
    {
      icon: CircleDollarSign,
      label: "Rate",
      value: agreement.rate ?? "—",
    },
    {
      icon: CreditCard,
      label: "Payment Terms",
      value: agreement.paymentTerms ?? "—",
    },
    {
      icon: Truck,
      label: "Transport",
      value:
        agreement.transportCompany && agreement.transportPrice
          ? `${agreement.transportCompany} — ${agreement.transportPrice}`
          : "—",
    },
  ];

  // Transport progress: which step of the movement we're up to.
  const statusIdx = Math.max(
    0,
    TRANSPORT_STEPS.findIndex(
      (s) => s.key === (agreement.transportStatus ?? "booked"),
    ),
  );
  const delivered = agreement.transportStatus === "delivered";

  // End-of-agreement countdown, degrading honestly: a real countdown when
  // the parsed end date is in the future, otherwise just the end date.
  const range = parseAgreementDates(agreement.datesLabel);
  const daysRemaining = range
    ? Math.ceil((range.end.getTime() - Date.now()) / 86_400_000)
    : null;
  const endLabel = range
    ? range.end.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : (agreement.datesLabel?.replace(/^.*\s(?:-|–)\s/, "") ?? "—");

  const schedule = agreement.paymentSchedule;
  const nextPayments = schedule.slice(0, 3);
  const morePayments = schedule.length - nextPayments.length;

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <Link
            href="/workspaces/1023"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Workspace
          </Link>
          <PaddockMeLogo variant="dark" className="hidden sm:block" />
          <span className="rounded-full bg-pm-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pm-success">
            Live
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold text-pm-charcoal">
          Live Agreement
        </h1>
        <p className="mt-1 text-sm text-pm-muted">
          Agistment #1023 is agreed and under way. This is your home base
          while the stock are on agistment.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(320px,380px)]">
          {/* Executed deal summary — the facts, read-only */}
          <section className="rounded-2xl border border-pm-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-extrabold text-pm-charcoal">
                The deal
              </h2>
              <Link
                href="/workspaces/1023/review"
                className="text-sm font-medium text-pm-green-900 hover:underline"
              >
                View full agreement
              </Link>
            </div>

            <dl className="mt-4 divide-y divide-pm-border">
              {summaryRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 py-3.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pm-cream-100 text-pm-green-900"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <dt className="text-sm text-pm-muted">{label}</dt>
                    <dd className="text-sm font-semibold text-pm-charcoal">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-5 flex items-center gap-2 rounded-lg bg-pm-success/10 px-4 py-3 text-sm font-semibold text-pm-success">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
              <span>
                {`Accepted${acceptedDate ? ` ${acceptedDate}` : ""} by James Coleman & ${demoLandowner.name}`}
              </span>
            </p>

            {/* Post-completion actions. Stubs are shown, not hidden, so the
                layout is honest about where the product is going. */}
            <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-pm-muted">
              Actions
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <PmButton href="/workspaces/1023" variant="outline">
                <MessageSquare className="h-4 w-4" aria-hidden />
                Message {demoLandowner.name}
              </PmButton>
              <PmButton href="/transport/rooms/1023" variant="outline">
                <Truck className="h-4 w-4" aria-hidden />
                Track Transport
              </PmButton>
              {/* v1: requesting an amendment just opens the workspace chat. */}
              <PmButton href="/workspaces/1023" variant="outline">
                <FileText className="h-4 w-4" aria-hidden />
                Request Amendment
              </PmButton>
              <StubAction icon={Receipt} label="View Invoices" />
              <StubAction icon={Flag} label="Report an Issue" />
            </div>
          </section>

          {/* Live status timeline — what changes day to day */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                Transport
              </h2>
              <p className="mt-2 text-sm font-semibold text-pm-charcoal">
                {agreement.transportCompany}
              </p>
              <p className="text-sm text-pm-muted">
                Pickup {agreement.transportPickupDate ?? "to be confirmed"}
              </p>
              <ol className="mt-4 space-y-1">
                {TRANSPORT_STEPS.map((step, idx) => {
                  const done = idx < statusIdx;
                  const current = idx === statusIdx;
                  return (
                    <li
                      key={step.key}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                        current
                          ? "bg-pm-green-900 font-semibold text-white"
                          : done
                            ? "text-pm-charcoal"
                            : "text-pm-muted",
                      )}
                    >
                      {done || (current && delivered) ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pm-success text-white">
                          <Check className="h-3 w-3" aria-label="Done" />
                        </span>
                      ) : (
                        <Circle
                          className={cn(
                            "h-5 w-5",
                            current ? "text-pm-gold-500" : "text-pm-border",
                          )}
                          aria-label={current ? "Current" : "Upcoming"}
                        />
                      )}
                      {step.label}
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-xs text-pm-muted">
                {delivered
                  ? "Delivered — arrival confirmed."
                  : "Arrival is confirmed on delivery. ETA follows once the truck is on the road."}
              </p>
            </div>

            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                Payments
              </h2>
              {nextPayments.length > 0 ? (
                <ul className="mt-3 divide-y divide-pm-border">
                  {nextPayments.map((item) => (
                    <li
                      key={`${item.label}-${item.due}`}
                      className="flex items-baseline justify-between gap-3 py-2.5"
                    >
                      <span className="text-sm text-pm-muted">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-pm-charcoal">
                        {item.due}
                        {item.status === "due" && (
                          <span className="ml-2 rounded-full bg-pm-gold-500/15 px-2 py-0.5 text-xs font-bold text-pm-gold-600">
                            Due
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-pm-muted">
                  Schedule confirmed at acceptance.
                </p>
              )}
              {morePayments > 0 && (
                <p className="mt-2 text-xs text-pm-muted">
                  + {morePayments} more · {agreement.paymentTerms}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                Agreement ends
              </h2>
              <p className="mt-2 text-sm font-semibold text-pm-charcoal">
                {daysRemaining !== null && daysRemaining > 0
                  ? `${daysRemaining} days to go · ends ${endLabel}`
                  : `Runs until ${endLabel}`}
              </p>
            </div>
          </aside>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}

/** An action that exists in the layout but has no backend yet. */
function StubAction({
  icon: Icon,
  label,
}: {
  icon: typeof Receipt;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-pm-border bg-white px-5 py-3 text-sm font-semibold text-pm-muted"
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
      <span className="rounded-full bg-pm-cream-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
        Soon
      </span>
    </button>
  );
}
