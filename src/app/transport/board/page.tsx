"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  MapPin,
  MoveRight,
  Route,
  Truck,
  X,
} from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { LiveMap, type LiveMapRoute } from "@/components/LiveMap";
import { AnimalIconFor } from "@/components/paddockme/BoardAnimalIcon";
import {
  demoNetworkRfts,
  type NetworkRft,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/**
 * Screen 13 — Wayne's side of the marketplace: the transporter RFT board.
 *
 * Carriers see livestock movements (RFTs) only - route, stock, distance,
 * timing - never the agistment listing or the rate the farmers agreed.
 * Each RFT can be accepted (take the job / quote it) or declined (drops
 * off this carrier's board). The #1023 RFT is live workflow state: it
 * appears when James sends it, and accepting it puts Wayne's quote in
 * front of James for confirmation.
 */

// Which fictional RFTs this carrier has actioned. Namespaced "paddockme"
// so Reset Demo clears it with everything else.
const BOARD_KEY = "paddockme-carrier-board-v1";

type BoardState = { accepted: string[]; declined: string[] };

function loadBoardState(): BoardState {
  try {
    const raw = localStorage.getItem(BOARD_KEY);
    if (raw) return { accepted: [], declined: [], ...JSON.parse(raw) };
  } catch {
    // ignore blocked/corrupt storage
  }
  return { accepted: [], declined: [] };
}

export default function TransporterBoardPage() {
  const { state, carrierAcceptRft } = usePaddockmeWorkflow();
  const { agreement } = state;

  const [board, setBoard] = useState<BoardState>({
    accepted: [],
    declined: [],
  });
  const [hasLoadedBoard, setHasLoadedBoard] = useState(false);

  useEffect(() => {
    setBoard(loadBoardState());
    setHasLoadedBoard(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedBoard) return;
    try {
      localStorage.setItem(BOARD_KEY, JSON.stringify(board));
    } catch {
      // ignore storage errors
    }
  }, [board, hasLoadedBoard]);

  // The live #1023 RFT only exists for carriers once James has sent it.
  const liveRftVisible = agreement.transportRequestSent;

  type RftStatus = "available" | "quoted" | "booked" | "accepted";
  const statusOf = (rft: NetworkRft): RftStatus => {
    if (rft.isLiveDeal) {
      if (agreement.transportArranged) return "booked";
      if (agreement.rftAcceptedByCarrier) return "quoted";
      return "available";
    }
    return board.accepted.includes(rft.id) ? "accepted" : "available";
  };

  const visibleRfts = demoNetworkRfts.filter((rft) => {
    if (rft.isLiveDeal && !liveRftVisible) return false;
    return !board.declined.includes(rft.id);
  });

  const mapRoutes: LiveMapRoute[] = visibleRfts.map((rft) => {
    const status = statusOf(rft);
    return {
      id: rft.id,
      title: `${rft.pickup} → ${rft.destination}`,
      subtitle: `${rft.livestock} · ~${rft.distanceKm} km · target ${rft.targetDate}`,
      from: rft.from,
      to: rft.to,
      fromAddress: rft.pickup,
      toAddress: rft.destination,
      tone: status === "available" ? "available" : "active",
    };
  });

  function acceptRft(rft: NetworkRft) {
    if (rft.isLiveDeal) {
      carrierAcceptRft();
      return;
    }
    setBoard((current) => ({
      ...current,
      accepted: current.accepted.includes(rft.id)
        ? current.accepted
        : [...current.accepted, rft.id],
    }));
  }

  function declineRft(rft: NetworkRft) {
    setBoard((current) => ({
      ...current,
      declined: current.declined.includes(rft.id)
        ? current.declined
        : [...current.declined, rft.id],
    }));
  }

  const openCount = visibleRfts.filter(
    (rft) => statusOf(rft) === "available"
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <PaddockMeLogo variant="dark" />
          <div className="text-right">
            <p className="text-sm font-bold text-pm-charcoal">
              Wayne Transport
            </p>
            <p className="text-xs text-pm-muted">Transporter · NSW</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-pm-gold-600">
              Transporter network
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-pm-charcoal">
              RFT Board
            </h1>
            <p className="mt-1 text-sm text-pm-muted">
              Livestock movements open for transport on the PaddockME
              network. You see the freight — route, stock, timing. The
              agistment terms stay between the farmers.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-pm-success/20 bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
            <span className="h-2 w-2 rounded-full bg-pm-success" aria-hidden />
            {openCount} open RFT{openCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* RFT map — every visible route, amber while open, green once taken */}
        <div className="mt-5">
          <LiveMap
            routes={mapRoutes}
            heightClassName="h-[22rem] sm:h-[26rem]"
          />
          <p className="mt-2 flex flex-wrap items-center gap-4 text-xs text-pm-muted">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-1 w-6 rounded-full bg-pm-gold-600"
                aria-hidden
              />
              Open for quotes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-1 w-6 rounded-full bg-pm-green-900"
                aria-hidden
              />
              Your jobs
            </span>
          </p>
        </div>

        {/* RFT cards */}
        <section className="mt-6 space-y-4">
          {visibleRfts.map((rft) => {
            const status = statusOf(rft);
            return (
              <article
                key={rft.id}
                className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                      RFT #{rft.id.replace("rft-", "")}
                      {rft.isLiveDeal && status === "available" && (
                        <span className="ml-2 rounded-full bg-pm-gold-500/15 px-2 py-0.5 text-[0.65rem] font-bold text-pm-gold-600">
                          New
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-extrabold text-pm-charcoal">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-pm-gold-600"
                        aria-hidden
                      />
                      {rft.pickup}
                      <MoveRight
                        className="h-4 w-4 shrink-0 text-pm-gold-600"
                        aria-label="to"
                      />
                      {rft.destination}
                    </p>
                  </div>

                  {status === "available" && (
                    <div className="flex shrink-0 gap-2">
                      <PmButton
                        onClick={() => acceptRft(rft)}
                        className="min-h-[40px] px-4 py-2"
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        Accept RFT
                      </PmButton>
                      <PmButton
                        variant="outline"
                        onClick={() => declineRft(rft)}
                        className="min-h-[40px] px-4 py-2"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Decline
                      </PmButton>
                    </div>
                  )}

                  {status === "quoted" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pm-gold-500/15 px-3 py-1.5 text-xs font-bold text-pm-gold-600">
                      <Truck className="h-4 w-4" aria-hidden />
                      Quote sent — awaiting owner confirmation
                    </span>
                  )}

                  {status === "booked" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pm-success/10 px-3 py-1.5 text-xs font-bold text-pm-success">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Booked — you have this job
                    </span>
                  )}

                  {status === "accepted" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pm-success/10 px-3 py-1.5 text-xs font-bold text-pm-success">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Accepted — job on your run sheet
                    </span>
                  )}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-pm-border pt-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-pm-muted">Livestock</dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-pm-charcoal">
                      <AnimalIconFor
                        livestock={rft.livestock}
                        className="h-4 w-4 text-pm-green-900"
                      />
                      {rft.livestock}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Approx. distance</dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-pm-charcoal">
                      <Route
                        className="h-4 w-4 text-pm-green-900"
                        aria-hidden
                      />
                      ~{rft.distanceKm} km
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Target date</dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-pm-charcoal">
                      <CalendarDays
                        className="h-4 w-4 text-pm-green-900"
                        aria-hidden
                      />
                      {rft.targetDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-pm-muted">Access</dt>
                    <dd className="mt-0.5 text-sm font-bold text-pm-charcoal">
                      {rft.access}
                    </dd>
                  </div>
                </dl>

                {rft.isLiveDeal && status === "quoted" && (
                  <p className="mt-3 rounded-lg bg-pm-cream-100 px-4 py-3 text-xs text-pm-charcoal">
                    Your quote of <span className="font-bold">$2,200</span> is
                    with the livestock owner. You&apos;ll join the workspace
                    chat as soon as the job is confirmed.
                  </p>
                )}

                {rft.isLiveDeal && status === "booked" && (
                  <div className="mt-3">
                    <PmButton
                      href="/transport/rooms/1023"
                      variant="outline"
                      className="min-h-[40px] px-4 py-2"
                    >
                      Open coordination room
                      <MoveRight className="h-4 w-4" aria-hidden />
                    </PmButton>
                  </div>
                )}
              </article>
            );
          })}

          {visibleRfts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-pm-border bg-white px-5 py-8 text-center text-sm text-pm-muted">
              No open RFTs right now. New livestock movements appear here the
              moment a farmer sends a Request for Transport.
            </p>
          )}
        </section>
      </main>

      <AppBottomNav />
    </div>
  );
}
