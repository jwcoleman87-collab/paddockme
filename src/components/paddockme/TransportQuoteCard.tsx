import { ShieldCheck, Truck, FileCheck, MessagesSquare } from "lucide-react";
import { PmButton } from "./PmButton";
import { Badge, Rating } from "./PmCards";
import type { DemoTransportQuote } from "@/lib/paddockmeDemoData";

const badgeIcons: Record<string, React.ReactNode> = {
  "Road Train": <Truck className="h-3.5 w-3.5" aria-hidden />,
  "NVD Accredited": <FileCheck className="h-3.5 w-3.5" aria-hidden />,
  "Fully Insured": <ShieldCheck className="h-3.5 w-3.5" aria-hidden />,
};

export function TransportQuoteCard({
  quote,
  onAccept,
  chatHref,
}: {
  quote: DemoTransportQuote;
  onAccept: () => void;
  /** When set, shows a "Chat with Driver" button that opens the coordination room. */
  chatHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-pm-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-pm-cream-100 text-pm-green-900"
          aria-hidden
        >
          <Truck className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-pm-charcoal">{quote.company}</p>
          <Rating value={quote.rating} reviews={quote.reviews} className="text-xs" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quote.badges.map((b) => (
              <Badge key={b} icon={badgeIcons[b]}>
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        <p className="text-xl font-extrabold text-pm-charcoal sm:text-right">
          {quote.price}
          <span className="block text-[11px] font-medium text-pm-muted sm:text-right">
            INC. GST
          </span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {chatHref && (
            <PmButton variant="outline" href={chatHref}>
              <MessagesSquare className="h-4 w-4" aria-hidden />
              Chat with Driver
            </PmButton>
          )}
          <PmButton variant="accent" onClick={onAccept}>
            Accept Quote
          </PmButton>
        </div>
      </div>
    </div>
  );
}