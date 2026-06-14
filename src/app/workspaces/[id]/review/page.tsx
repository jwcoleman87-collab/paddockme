"use client";

import { useRouter } from "next/navigation";
import {
  LandPlot,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Truck,
} from "lucide-react";
import { CattleIcon } from "@/components/paddockme/AnimalIcons";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ImagePanel } from "@/components/paddockme/ImagePanel";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoRequest } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow, livestockLabel } from "@/lib/paddockmeWorkflow";

/** Screen 11 — Agreement Review: clear, safe, final check before accepting. */
export default function AgreementReviewPage() {
  const router = useRouter();
  const { state, acceptReview } = usePaddockmeWorkflow();
  const { agreement } = state;

  const rows = [
    { icon: CattleIcon, label: "Livestock", value: livestockLabel(state.request) },
    {
      icon: LandPlot,
      label: "Property",
      value: `Green Hills Farm, ${demoRequest.targetLocation}`,
    },
    {
      icon: CalendarDays,
      label: "Duration",
      value:
        agreement.datesConfirmed && agreement.datesLabel
          ? `${demoRequest.duration} · ${agreement.datesLabel}`
          : `${demoRequest.duration} · Dates not yet confirmed`,
    },
    {
      icon: CircleDollarSign,
      label: "Rate",
      value: agreement.rate ?? "Not yet agreed",
    },
    {
      icon: CreditCard,
      label: "Payment Terms",
      value: agreement.paymentTerms ?? "Not yet agreed",
    },
    {
      icon: Truck,
      label: "Transport",
      value: agreement.transportArranged
        ? `${agreement.transportCompany} — ${agreement.transportPrice}`
        : "Not yet arranged",
    },
  ];

  const readyToAccept =
    agreement.priceAgreed &&
    agreement.datesConfirmed &&
    agreement.paymentTermsConfirmed;

  function handleAccept() {
    acceptReview();
    router.push(
      agreement.transportArranged ? "/workspaces/1023" : "/transport/quotes/1023",
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-pm-border bg-white shadow-sm md:grid md:grid-cols-[1fr_minmax(220px,38%)]">
          <div className="p-6 sm:p-9">
            <h1 className="text-2xl font-extrabold text-pm-charcoal">
              Review Agreement
            </h1>
            <p className="mt-1 text-sm text-pm-muted">
              Please review all details before accepting.
            </p>

            <dl className="mt-6 divide-y divide-pm-border">
              {rows.map(({ icon: Icon, label, value }) => (
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

            {!readyToAccept && (
              <p className="mt-6 rounded-lg bg-pm-gold-500/10 px-4 py-3 text-sm font-medium text-pm-gold-600">
                Finish agreeing the price, dates and payment terms in the
                agreement before accepting.
              </p>
            )}

            <PmButton
              variant="accent"
              onClick={handleAccept}
              disabled={!readyToAccept}
              className={
                readyToAccept
                  ? "mt-6 w-full sm:w-auto"
                  : "mt-6 w-full cursor-not-allowed opacity-50 sm:w-auto"
              }
            >
              {agreement.transportArranged
                ? "Accept Agreement"
                : "Accept & Arrange Transport"}
            </PmButton>
          </div>

          <div className="hidden md:block">
            <ImagePanel
              src={paddockmeImages.agreementReviewSide}
              alt="Cattle grazing on agistment land"
            />
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
