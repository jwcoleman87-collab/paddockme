"use client";

import { useRouter } from "next/navigation";
import { MapPin, Truck, Send, Map as MapIcon, MoveRight } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { TransportQuoteCard } from "@/components/paddockme/TransportQuoteCard";
import { ImagePanel } from "@/components/paddockme/ImagePanel";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { paddockmeImages } from "@/lib/paddockmeImages";
import {
  demoRequest,
  demoTransportQuotes,
  demoTransportRft,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/**
 * Screen 12 — the Request For Transport (RFT) screen. Once the two farmers
 * accept the agreement, the livestock owner's RFT is opened to transporters,
 * who can see the route on their RFT map and submit quotes.
 */
export default function TransportQuotesPage() {
  const router = useRouter();
  const { state, acceptTransport } = usePaddockmeWorkflow();
  // Use the RFT the owner sent if present, otherwise the demo template so the
  // page still reads sensibly when a transporter opens it directly.
  const rft = state.agreement.transportRft ?? demoTransportRft;
  const destinationCity = demoRequest.targetLocation;

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
        {/* RFT sent banner */}
        <section className="overflow-hidden rounded-2xl border border-pm-border bg-white shadow-sm sm:grid sm:grid-cols-[1fr_minmax(160px,30%)]">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pm-success/10 text-pm-success">
                <Send className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pm-gold-600">
                  Request For Transport · Agistment #{rft.agreementId}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-pm-charcoal">
                  Transport RFT Sent
                </h1>
                <p className="mt-1 text-sm text-pm-muted">
                  This movement has been opened to livestock transporters for
                  quotes.
                </p>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <ImagePanel
              src={paddockmeImages.transportQuotesSide}
              alt="Livestock truck on a rural Australian road"
            />
          </div>
        </section>

        {/* Route summary */}
        <div className="mt-4 grid gap-4 rounded-2xl border border-pm-border bg-white p-5 shadow-sm sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-pm-muted">
              Route
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-base font-bold text-pm-charcoal">
              {rft.pickup}
              <MoveRight className="h-4 w-4 text-pm-gold-600" aria-label="to" />
              {destinationCity}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-pm-muted">
              Approx. distance
            </p>
            <p className="mt-1 text-base font-bold text-pm-charcoal">
              {rft.distanceKm} km
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-pm-muted">
              Livestock
            </p>
            <p className="mt-1 text-base font-bold text-pm-charcoal">
              {rft.livestock}
            </p>
          </div>
          <div className="sm:col-span-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
              <span className="h-1.5 w-1.5 rounded-full bg-pm-success" aria-hidden />
              Open for transport quotes
            </span>
          </div>
        </div>

        {/* Map-style route preview (placeholder for the real map) */}
        <div className="mt-4 rounded-2xl border border-pm-border bg-pm-green-900 p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">
            Route preview
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pm-gold-500" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/55">
                  Pickup pin
                </p>
                <p className="text-sm font-bold">{rft.pickup}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 px-1">
              <span
                className="h-px flex-1 border-t-2 border-dashed border-white/30"
                aria-hidden
              />
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                <Truck className="h-3.5 w-3.5" aria-hidden />
                Route line · {rft.distanceKm} km
              </span>
              <span
                className="h-px flex-1 border-t-2 border-dashed border-white/30"
                aria-hidden
              />
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pm-gold-500" aria-hidden />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/55">
                  Drop-off pin
                </p>
                <p className="text-sm font-bold">{rft.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visible on Transporter RFT Map */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-pm-gold-500/40 bg-pm-gold-500/10 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pm-gold-500/20 text-pm-gold-600">
            <MapIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-pm-charcoal">
              Visible on Transporter RFT Map
            </p>
            <p className="mt-1 text-sm text-pm-muted">
              Transporters can now see this route, distance and livestock
              movement details on their RFT map and submit quotes.
            </p>
          </div>
        </div>

        {/* Quotes received in response to the RFT */}
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-pm-charcoal">
            Quotes received
          </h2>
          <p className="mt-1 text-sm text-pm-muted">
            Transporters who can cover this RFT have responded with quotes.
          </p>

          {state.agreement.transportArranged && (
            <p className="mt-3 text-sm text-pm-success">
              Transport with {state.agreement.transportCompany} is already
              arranged. Accepting a quote below will replace it.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {demoTransportQuotes.map((q) => (
              <TransportQuoteCard
                key={q.company}
                quote={q}
                chatHref="/transport/rooms/1023"
                onAccept={() => handleAccept(q.company, q.price)}
              />
            ))}
          </div>

          <p className="mt-4 rounded-lg bg-pm-cream-100 px-4 py-3 text-xs text-pm-charcoal">
            <span className="font-bold">Chat with Driver</span> opens a
            coordination room to sort access, yards and timing — it does not
            accept the quote. <span className="font-bold">Accept Quote</span>{" "}
            books the transporter.
          </p>
          <p className="mt-3 text-xs text-pm-muted">
            Quotes are indicative and include GST. Accepting books transport
            and returns you to your workspace.
          </p>
        </section>
      </main>

      <AppBottomNav />
    </div>
  );
}
