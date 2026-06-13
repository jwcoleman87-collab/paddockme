import type { Metadata } from "next";
import {
  Beef,
  LandPlot,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Truck,
} from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ImagePanel } from "@/components/paddockme/ImagePanel";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoAgreementReview } from "@/lib/paddockmeDemoData";

export const metadata: Metadata = {
  title: "Review Agreement — PaddockME",
};

/** Screen 11 — Agreement Review: clear, safe, final check before accepting. */
export default function AgreementReviewPage() {
  const a = demoAgreementReview;
  const rows = [
    { icon: Beef, label: "Livestock", value: a.livestock },
    { icon: LandPlot, label: "Property", value: a.property },
    { icon: CalendarDays, label: "Duration", value: `${a.duration} · ${a.dates}` },
    { icon: CircleDollarSign, label: "Rate", value: a.rate },
    { icon: CreditCard, label: "Payment Terms", value: a.paymentTerms },
    { icon: Truck, label: "Transport", value: a.transport },
  ];

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
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4">
                    <dt className="text-sm text-pm-muted">{label}</dt>
                    <dd className="text-sm font-bold text-pm-charcoal">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex items-center justify-between gap-3">
              <PmButton variant="outline" href="/workspaces/1023/agreement">
                Back
              </PmButton>
              <PmButton href="/transport/quotes/1023">
                Accept Agreement
              </PmButton>
            </div>
          </div>
          <div className="hidden md:block">
            <ImagePanel
              src={paddockmeImages.agreementReviewSide}
              alt="Cattle in a green paddock at golden hour"
            />
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
