import type {
  TransportJob,
  TransportQuote,
  TransportQuoteBasis,
} from "@/lib/dummyData";

export type TransportPayableSnapshot = {
  transportJobId: string;
  agreementId: string;
  quoteId: string;
  payerProfileId: string;
  payeeProfileId: string;
  payerLabel: string;
  payeeLabel: string;
  amountCents: number;
  amount: number;
  currency: string;
  unitAmount: number;
  basis: TransportQuoteBasis;
  basisLabel: string;
  description: string;
};

export function findTransportPayableSnapshot(
  transportJobId: string,
  quoteId: string
): TransportPayableSnapshot | null {
  // Demo mode retired: quote-backed payables previously resolved from seed
  // transport jobs. Real quotes are not yet wired to Supabase (spec §6.13 is
  // a future brief - see SPEC_DRIFT.md), so no payable can be resolved yet.
  void transportJobId;
  void quoteId;
  return null;
}

export function estimateTransportTotal(
  job: TransportJob,
  quote: TransportQuote
) {
  if (quote.basis === "flat") return quote.amount;

  if (quote.basis === "per_head") {
    const headCount = parseFirstNumber(job.livestockCount);
    return headCount ? quote.amount * headCount : null;
  }

  const kilometres =
    parseFirstNumber(job.routeSummary) ??
    parseFirstNumber(
      job.sections
        .find((section) => section.id === "route")
        ?.detail.find((item) => item.label.toLowerCase().includes("distance"))
        ?.value ?? ""
    );

  return kilometres ? quote.amount * kilometres : null;
}

export function parseFirstNumber(value: string) {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function quoteBasisLabel(basis: TransportQuoteBasis) {
  if (basis === "per_head") return "per head";
  if (basis === "per_km") return "per km";
  return "flat";
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
