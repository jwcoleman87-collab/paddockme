"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoveRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import {
  demoTransportRft,
  demoTransportQuotes,
  demoTransportRoomParticipants,
  demoTransportRoomMessages,
  type TransportRoomMessage,
} from "@/lib/paddockmeDemoData";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

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
const participantRole: Record<string, RoomRole> = {
  "James Coleman": "owner",
  "John — Green Hills Farm": "landowner",
  "Wayne Transport": "transporter",
};
const initialsBySender: Record<string, string> = Object.fromEntries(
  demoTransportRoomParticipants.map((p) => [p.name, p.initials]),
);

/**
 * Demo three-way transport coordination room. The livestock owner, landowner
 * and transporter sort the practical detail (access, yards, NVDs, timing)
 * before the quote is accepted. Accepting books the transporter and returns
 * to the workspace — same behaviour as the quote page's Accept Quote.
 */
export default function TransportRoomPage() {
  const router = useRouter();
  const { state, acceptTransport } = usePaddockmeWorkflow();
  const rft = state.agreement.transportRft ?? demoTransportRft;
  const wayne =
    demoTransportQuotes.find((q) => q.company === "Wayne Transport") ??
    demoTransportQuotes[0];
  const arranged = state.agreement.transportArranged;

  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<TransportRoomMessage[]>([]);
  const messages = [...demoTransportRoomMessages, ...extra];

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [
      ...prev,
      {
        sender: "James Coleman",
        role: "owner",
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
        text,
      },
    ]);
    setDraft("");
  }

  function handleAcceptWayne() {
    acceptTransport(wayne.company, wayne.price);
    router.push("/workspaces/1023");
  }

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
            href="/transport/quotes/1023"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Quotes
          </Link>
          <PaddockMeLogo variant="dark" className="hidden sm:block" />
          <span className="rounded-full bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
            Live
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
          Sort out access, yards and timing with the driver here, then accept
          or decline Wayne&apos;s quote. Chatting doesn&apos;t book anything.
        </p>

        {/* Participants */}
        <div className="mt-4 flex flex-wrap gap-3">
          {demoTransportRoomParticipants.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 rounded-full border border-pm-border bg-white px-3 py-1.5 shadow-sm"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  roleAvatar[participantRole[p.name]],
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
          ))}
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
              <dt className="text-xs text-pm-muted">Target start</dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                {rft.preferredDate}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">Agreement ID</dt>
              <dd className="text-sm font-semibold text-pm-charcoal">
                Agistment #{rft.agreementId}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-pm-muted">Wayne&apos;s quote</dt>
              <dd className="text-sm font-bold text-pm-green-900">
                {wayne.price}{" "}
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
                      {initialsBySender[m.sender] ?? "??"}
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

          {/* Checklist + accept */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <ChecklistPanel title="Transport checklist" items={checklist} />
            </div>
            <div className="rounded-2xl border border-pm-border bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-pm-charcoal">Your decision</p>
              <p className="mt-1 text-sm text-pm-muted">
                Nothing here is booked until you choose. Accept Wayne&apos;s
                quote ({wayne.price} inc. GST) to confirm the pickup, or decline
                and keep comparing.
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
          </aside>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
