"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";

export type TransportQuoteFields = {
  totalPrice: string;
  availability: string;
  estimatedArrival: string;
  equipment: string;
  notes: string;
};

const defaults: TransportQuoteFields = {
  totalPrice: "2,200",
  availability: "Available for the confirmed pickup date",
  estimatedArrival: "1:30 PM",
  equipment: "B-double full-size stock crate",
  notes: "Price includes loading, the 320 km movement and unloading.",
};

export function TransportQuoteForm({
  onSubmit,
  initial = defaults,
}: {
  onSubmit: (quote: TransportQuoteFields) => void;
  initial?: TransportQuoteFields;
}) {
  const [quote, setQuote] = useState(initial);

  function set<K extends keyof TransportQuoteFields>(key: K, value: TransportQuoteFields[K]) {
    setQuote((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const amount = quote.totalPrice.trim();
        onSubmit({
          ...quote,
          totalPrice: amount.startsWith("$") ? amount : `$${amount}`,
        });
      }}
    >
      <h2 className="text-lg font-extrabold text-pm-charcoal">Your quote</h2>
      <p className="mt-1 text-sm text-pm-muted">
        Keep it practical. James and John already share the confirmed movement details above.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Total price (inc. GST)" htmlFor="quote-total">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base font-bold text-pm-charcoal">$</span>
            <input
              id="quote-total"
              required
              inputMode="decimal"
              value={quote.totalPrice.replace(/^\$/, "")}
              onChange={(event) => set("totalPrice", event.target.value)}
              className="min-h-11 w-full rounded-lg border border-pm-border bg-white pl-8 pr-4 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
            />
          </div>
        </Field>

        <Field label="Availability" htmlFor="quote-availability">
          <input
            id="quote-availability"
            required
            value={quote.availability}
            onChange={(event) => set("availability", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-pm-border bg-white px-4 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
          />
        </Field>

        <Field label="Estimated arrival" htmlFor="quote-arrival">
          <input
            id="quote-arrival"
            required
            value={quote.estimatedArrival}
            onChange={(event) => set("estimatedArrival", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-pm-border bg-white px-4 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
          />
        </Field>

        <Field label="Truck or trailer" htmlFor="quote-equipment">
          <input
            id="quote-equipment"
            required
            value={quote.equipment}
            onChange={(event) => set("equipment", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-pm-border bg-white px-4 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
          />
        </Field>

        <Field label="Conditions or notes" htmlFor="quote-notes" className="sm:col-span-2">
          <textarea
            id="quote-notes"
            rows={4}
            value={quote.notes}
            onChange={(event) => set("notes", event.target.value)}
            className="w-full rounded-lg border border-pm-border bg-white px-4 py-3 text-base text-pm-charcoal outline-none focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20 sm:text-sm"
          />
        </Field>
      </div>

      <PmButton type="submit" variant="accent" className="mt-6 w-full sm:w-auto">
        <Send className="h-4 w-4" aria-hidden />
        Submit quote
      </PmButton>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-pm-charcoal">
        {label}
      </label>
      {children}
    </div>
  );
}
