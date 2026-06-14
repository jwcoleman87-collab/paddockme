"use client";

import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { TransportQuoteCard } from "@/components/paddockme/TransportQuoteCard";
import { ImagePanel } from "@/components/paddockme/ImagePanel";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoRequest, demoTransportQuotes } from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/** Screen 12 — Transport Quotes, shown only after the agreement stage. */
export default function TransportQuotesPage() {
  const router = useRouter();
  const { state, acceptTransport } = usePaddockmeWorkflow();

  function handleAccept(company: string, price: string) {
    acceptTransport(company, price);
    router.push("/workspaces/1023");
  }

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <PaddockMeLogo variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-pm-border bg-white shadow-sm md:grid md:grid-cols-[minmax(200px,32%)_1fr]">
          <div className="hidden md:block">
            <ImagePanel
              src={paddockmeImages.transportQuotesSide}
              alt="Livestock truck on a rural Australian road"
            />
          </div>
          <div className="p-6 sm:p-9">
            <h1 className="text-2xl font-extrabold text-pm-charcoal">
              Transport Required
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-pm-charcoal">
              {state.request.location}
              <MoveRight className="h-4 w-4 text-pm-gold-600" aria-label="to" />
              {demoRequest.targetLocation}
              <span className="rounded-full bg-pm-green-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {state.request.headCount} Head
              </span>
            </p>

            {state.agreement.transportArranged && (
              <p className="mt-3 text-sm text-pm-success">
                Transport with {state.agreement.transportCompany} is already
                arranged. Accepting a quote below will replace it.
              </p>
            )}

            <div className="mt-6 space-y-4">
              {demoTransportQuotes.map((q) => (
                <TransportQuoteCard
                  key={q.company}
                  quote={q}
                  onAccept={() => handleAccept(q.company, q.price)}
                />
              ))}
            </div>

            <p className="mt-6 text-xs text-pm-muted">
              Quotes are indicative and include GST. Accepting books transport
              and returns you to your workspace.
            </p>
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
