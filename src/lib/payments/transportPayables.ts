import {
  transportJobs,
  type TransportJob,
  type TransportQuote,
  type TransportQuoteBasis,
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
  const job = transportJobs.find((item) => item.id === transportJobId);
  if (!job) return null;

  const quote = job.quotes.find((item) => item.id === quoteId);
  if (!quote) return null;
  if (quote.status !== "accepted" && job.acceptedQuoteId !== quote.id) {
    return null;
  }

  const total = estimateTransportTotal(job, quote);
  if (!total || total <= 0) return null;

  return {
    transportJobId: job.id,
    agreementId: job.agreementId,
    quoteId: quote.id,
    payerProfileId: job.farmerAId,
    payeeProfileId: job.driverId,
    payerLabel: "Livestock owner",
    payeeLabel: job.driver,
    amountCents: Math.round(total * 100),
    amount: total,
    currency: quote.currency.toUpperCase(),
    unitAmount: quote.amount,
    basis: quote.basis,
    basisLabel: quoteBasisLabel(quote.basis),
    description: `${job.livestockCount} transport from ${job.pickup} to ${job.destination}`,
  };
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
