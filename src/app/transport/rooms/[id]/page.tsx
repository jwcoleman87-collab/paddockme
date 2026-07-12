"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  MoveRight,
  Send,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import { GuidedDemoResetAction } from "@/components/paddockme/GuidedDemo";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import {
  demoTransportRft,
  demoTransportQuotes,
  demoTransportRoomParticipants,
  transportRoomSeedMessages,
  transportStatusUpdateMessages,
  type TransportRoomMessage,
} from "@/lib/paddockmeDemoData";
import { demoThreadTime, useDemoThread } from "@/lib/demoThread";
import {
  usePaddockmeWorkflow,
  TRANSPORT_STEPS,
  nextTransportStatus,
} from "@/lib/paddockmeWorkflow";

type RoomRole = TransportRoomMessage["role"];

const roleAvatar: Record<RoomRole, string> = {
  owner: "bg-pm-green-900 text-white",
  landowner: "bg-pm-gold-500 text-pm-charcoal",
  transporter: "bg-pm-charcoal text-white",
};
const roleBubble: Record<RoomRole, string> = {
  owner: "rounded-br-sm bg-pm-green-900 text-white",
  landowner: "rounded-bl-sm bg-pm-cream-100 text-pm-charcoal",
  transporter: "rounded-bl-sm border border-pm-border bg-white text-pm-charcoal",
};
const initialsByRole: Record<RoomRole, string> = {
  owner: "JC",
  landowner: "GH",
  transporter: "WT",
};

/**
 * Three-way transport coordination room. Before booking, the livestock
 * owner, landowner and transporter sort the practical detail (access,
 * yards, NVDs, timing) and the owner accepts or declines the quote. After
 * booking, the same room becomes the movement tracker: the transporter's
 * status updates (picked up → en route → delivered) land in the thread and
 * drive the stepper, so all three parties watch one shared source of truth.
 */
export default function TransportRoomPage() {
  const router = useRouter();
  const { state, acceptTransport, advanceTransport, hasHydrated } =
    usePaddockmeWorkflow();
  const rft = state.agreement.transportRft ?? demoTransportRft;
  const wayne =
    demoTransportQuotes.find((q) => q.company === "Wayne Transport") ??
    demoTransportQuotes[0];
  const arranged = state.agreement.transportArranged;
  const status = state.agreement.transportStatus;
  const delivered = status === "delivered";
  const hasRequest = state.agreement.transportRequestSent || arranged;

  const [draft, setDraft] = useState("");
  const thread = useDemoThread("transport-room-1023");
  const seeds = transportRoomSeedMessages(state.request);
  const messages: TransportRoomMessage[] = [
    ...seeds,
    ...thread.messages.map((m) => ({
      sender: m.sender,
      role: m.role,
      time: demoThreadTime(m.sentAt),
      text: m.text,
    })),
  ];

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    thread.append({ sender: "James Coleman", role: "owner", text });
    setDraft("");
  }

  function handleAcceptWayne() {
    acceptTransport(wayne.company, wayne.price);
    router.push("/workspaces/1023");
  }

  /** Step the movement forward and post the matching scripted updates. */
  function handleAdvance() {
    const next = advanceTransport();
    if (!next || next === "booked") return;
    const updates = transportStatusUpdateMessages(state.request)[next];
    updates.forEach((u) =>
      thread.append({ sender: u.sender, role: u.role, text: u.text }),
    );
  }

  // Wait for stored state before branching so direct navigation or a
  // refresh never flashes the wrong stage.
  if (!hasHydrated || !thread.hasHydrated) {
    return <div className="min-h-screen bg-pm-cream-50" />;
  }

  // Direct navigation with no transport request on foot (e.g. straight
  // after a demo reset): explain the stage instead of showing a phantom deal.
  if (!hasRequest) {
    return (
      <div className="flex min-h-screen flex-col bg-pm-cream-50">
        <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <PaddockMeLogo variant="dark" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-pm-border bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
              <Truck className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-pm-charcoal">
              No transport underway
            </h1>
            <p className="mt-2 text-sm text-pm-muted">
              The coordination room opens once your agistment agreement is
              accepted and a Request For Transport has been sent to
              transporters.
            </p>
            <PmButton
              href="/workspaces/1023/agreement"
              className="mt-6 w-full sm:w-auto"
            >
              Go to your Agreement
              <MoveRight className="h-4 w-4" aria-hidden />
            </PmButton>
          </div>
        </main>
        <AppBottomNav />
      </div>
    );
  }

  const statusLabel = arranged
    ? (TRANSPORT_STEPS.find((s) => s.key === (status ?? "booked"))?.label ??
      "Booked")
    : "Quoting";
  const statusIdx = Math.max(
    0,
    TRANSPORT_STEPS.findIndex((s) => s.key === (status ?? "booked")),
  );
  const upcoming = status ? nextTransportStatus(status) : null;
  const upcomingLabel = upcoming
    ? TRANSPORT_STEPS.find((s) => s.key === upcoming)?.label
    : null;

  const checklistItems = [
    { label: "Pickup access confirmed", done: true },
    { label: "Drop-off access confirmed", done: true },
    { label: "Loading yards confirmed", done: true },
    { label: "NVD ready", done: true },
    { label: "Date/time confirmed", done: true },
    { label: "Quote accepted", done: arranged },
  ];
  const firstPending = checklistItems.findIndex((item) => !item.done);
  const checklist = checklistItems.map((item, idx) => ({
    ...item,
    current: idx === firstPending,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link
            href={arranged ? "/workspaces/1023/live" : "/transport/quotes/1023"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {arranged ? "Live Agreement" : "Quotes"}
          </Link>
          <PaddockMeLogo variant="dark" className="hidden sm:block" />
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              delivered
                ? "bg-pm-success/10 text-pm-success"
                : "bg-pm-gold-500/15 text-pm-gold-600",
            )}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-pm-gold-600">
          Agistment #{rft.agreementId} · Three-way coordination
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-pm-charcoal">
          Transport Coordination Room
        </h1>
        <p className="mt-1 text-sm text-pm-muted">
          {arranged
            ? delivered
              ? "The movement is complete. This room stays as the shared record of the move."
              : "Transport is booked. Wayne's status updates land here for everyone to see."
            : "Sort out access, yards and timing with the driver here, then accept or decline Wayne's quote. Chatting doesn't book anything."}
        </p>

        {/* Participants */}
        <div className="mt-4 flex flex-wrap gap-3">
          {demoTransportRoomParticipants.map((p, i) => {
            const role = (["owner", "landowner", "transporter"] as RoomRole[])[
              i
            ];
            return (
              <div
                key={p.name}
                className="flex items-center gap-2.5 rounded-full border border-pm-border bg-white px-3 py-1.5 shadow-sm"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    roleAvatar[role],
                  )}
                  aria-hidden
                >
                  {p.initials}
                </span>
                <span className="pr-1">
                  <span className="block text-sm font-bold leading-tight text-pm-charcoal">
                    {p.name}
                  </span>
                  <span className="block text-xs text-pm-muted">{p.role}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Movement summary */}
        <div className="mt-4 rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
          <p className="flex flex-wrap items-center gap-2 text-base font-bold text-pm-charcoal">
            {rft.pickup}
            <MoveRight className="h-4 w-4 text-pm-gold-600" aria-label="to" />
            {rft.destination}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <dt className="text-xs text-pm-muted">Livestock</dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                {rft.livestock}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">Approx. distance</dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                {rft.distanceKm} km
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">
                {arranged ? "Pickup" : "Target start"}
              </dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                {arranged
                  ? (state.agreement.transportPickupDate ?? rft.preferredDate)
                  : rft.preferredDate}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">Agreement ID</dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                Agistment #{rft.agreementId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">
                {arranged ? "Booked price" : "Wayne's quote"}
              </dt>
              <dd className="text-sm font-bold text-pm-green-900">
                {arranged ? (state.agreement.transportPrice ?? wayne.price) : wayne.price}{" "}
                <span className="font-normal text-pm-muted">inc. GST</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Coordination thread */}
          <section className="flex flex-col rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-pm-muted">
              Coordination
            </h2>
            <div className="flex-1 space-y-4">
              {messages.map((m, i) => {
                const mine = m.role === "owner";
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2.5",
                      mine ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        roleAvatar[m.role],
                      )}
                      aria-hidden
                    >
                      {initialsByRole[m.role]}
                    </span>
                    <div className={cn("max-w-[80%]", mine && "text-right")}>
                      <p className="text-[11px] text-pm-muted">
                        {m.sender} · {m.time}
                      </p>
                      <div
                        className={cn(
                          "mt-1 inline-block rounded-2xl px-4 py-2 text-left text-sm",
                          roleBubble[m.role],
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <label htmlFor="room-input" className="sr-only">
                Message the coordination room
              </label>
              <input
                id="room-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the room..."
                className="min-h-[44px] w-full rounded-full border border-pm-border bg-white px-4 text-sm focus:border-pm-green-700 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white hover:bg-pm-green-800"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </section>

          {/* Right rail: decide before booking, track after booking */}
          <aside className="space-y-6">
            {!arranged && (
              <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
                <ChecklistPanel title="Transport checklist" items={checklist} />
              </div>
            )}

            {!arranged ? (
              <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-pm-charcoal">Your decision</p>
                <p className="mt-1 text-sm text-pm-muted">
                  Nothing here is booked until you choose. Accept Wayne&apos;s
                  quote ({wayne.price} inc. GST) to confirm the pickup, or
                  decline and keep comparing.
                </p>
                <PmButton
                  variant="accent"
                  onClick={handleAcceptWayne}
                  className="mt-4 w-full"
                >
                  Accept Wayne Quote
                </PmButton>
                <PmButton
                  href="/transport/quotes/1023"
                  variant="outline"
                  className="mt-2 w-full"
                >
                  Decline &amp; Back to Quotes
                </PmButton>
              </div>
            ) : (
              <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-pm-muted">
                  Movement status
                </h2>
                <ol className="mt-3 space-y-1">
                  {TRANSPORT_STEPS.map((step, idx) => {
                    const done =
                      idx < statusIdx || (idx === statusIdx && delivered);
                    const current = idx === statusIdx && !delivered;
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
                        {done ? (
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

                {delivered ? (
                  <>
                    <p className="mt-4 flex items-start gap-2 rounded-lg bg-pm-success/10 px-3 py-2.5 text-sm font-semibold text-pm-success">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden
                      />
                      Stock delivered to Green Hills Farm. The agistment is
                      now active.
                    </p>
                    <PmButton
                      href="/workspaces/1023/live"
                      variant="primary"
                      className="mt-3 w-full"
                    >
                      View Live Agreement
                      <MoveRight className="h-4 w-4" aria-hidden />
                    </PmButton>
                  </>
                ) : (
                  <>
                    <p className="mt-4 text-xs text-pm-muted">
                      Wayne Transport posts these updates from the road. In
                      this guided demo, you step through them.
                    </p>
                    {upcomingLabel && (
                      <PmButton
                        variant="accent"
                        onClick={handleAdvance}
                        className="mt-3 w-full"
                      >
                        <Truck className="h-4 w-4" aria-hidden />
                        Next update: {upcomingLabel}
                      </PmButton>
                    )}
                  </>
                )}
              </div>
            )}

            {delivered && (
              <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-pm-charcoal">
                  End of the walkthrough
                </p>
                <p className="mt-1 text-sm text-pm-muted">
                  That&apos;s the full journey — request, agreement, transport
                  and arrival. Reset to run it again.
                </p>
                <GuidedDemoResetAction className="mt-3 w-full" />
              </div>
            )}
          </aside>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
