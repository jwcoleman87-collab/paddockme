"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle, MapPin, Truck } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { InfoTile } from "@/components/InfoTile";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { StatusBadge } from "@/components/StatusBadge";
import { useFlash } from "@/components/FlashProvider";
import {
  createTransportMessage,
  getAgreementSettlementForTransportJob,
  getCurrentUserId,
  getTransportJobRecord,
  listTransportMessages,
  listTransportMilestones,
  listTransportStatusEvents,
  passTransportMilestone,
  updateTransportJobStatus,
  type AgreementSettlementSummary,
  type TransportMilestone,
} from "@/lib/data/repositories";
import { cn } from "@/lib/utils";
import type { Message, TransportJob, TransportJobStatus } from "@/lib/dummyData";

/**
 * The REAL three-party transport room - built only from live Supabase data.
 *
 * No demo leftovers: the viewer's role (livestock owner / landowner / driver)
 * is detected from the signed-in account, never chosen from a switcher. The
 * driver advances the movement status; both farmers watch it live and chat.
 * Per the design spec, the landowner-visibility wall means no haulage rates
 * render here (quotes land in a later build); the table itself carries
 * route, load, and timing only.
 */

type ViewerRole = "farmerA" | "farmerB" | "driver" | "observer";

const STATUS_FLOW: TransportJobStatus[] = [
  "accepted",
  "loading",
  "in_transit",
  "arrived",
  "completed",
];

const STATUS_LABELS: Record<string, string> = {
  available: "Awaiting carrier",
  accepted: "Accepted",
  loading: "Loading",
  in_transit: "In transit",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function RealTransportRoom({
  job: initialJob,
  messages: initialMessages,
}: {
  job: TransportJob;
  messages: Message[];
}) {
  const flash = useFlash();
  const [job, setJob] = useState(initialJob);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [timeline, setTimeline] = useState<
    { title: string; detail: string; complete: boolean }[]
  >([]);
  const [milestones, setMilestones] = useState<TransportMilestone[]>([]);
  const [settlement, setSettlement] =
    useState<AgreementSettlementSummary | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [settlementBusy, setSettlementBusy] = useState(false);
  const lastLocalMutationRef = useRef(0);

  useEffect(() => {
    void getCurrentUserId().then(setViewerId);
  }, []);

  // Live sync: job status, status history, and chat all poll so the other
  // two parties see changes without refreshing.
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (Date.now() - lastLocalMutationRef.current < 6000) return;
      void getTransportJobRecord(job.id).then((next) => {
        if (active && next) setJob(next);
      });
      void listTransportStatusEvents(job.id).then((events) => {
        if (active) setTimeline(events);
      });
      void listTransportMilestones(job.id).then((nextMilestones) => {
        if (active) setMilestones(nextMilestones);
      });
      void getAgreementSettlementForTransportJob(job.id).then((nextSettlement) => {
        if (active) setSettlement(nextSettlement);
      });
      void listTransportMessages(job.id).then((serverMessages) => {
        if (!active || serverMessages.length === 0) return;
        setMessages((current) => {
          const serverIds = new Set(serverMessages.map((m) => m.id));
          return [
            ...serverMessages,
            ...current.filter((m) => !serverIds.has(m.id)),
          ];
        });
      });
    };
    const interval = window.setInterval(refresh, 5000);
    refresh();
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [job.id]);

  const viewerRole: ViewerRole = useMemo(() => {
    if (!viewerId) return "observer";
    if (viewerId === job.driverId) return "driver";
    if (viewerId === job.farmerAId) return "farmerA";
    if (viewerId === job.farmerBId) return "farmerB";
    return "observer";
  }, [viewerId, job.farmerAId, job.farmerBId, job.driverId]);

  const roleLabels: Record<ViewerRole, { name: string; role: string }> = {
    farmerA: { name: job.farmerAName ?? "Livestock owner", role: "Livestock owner" },
    farmerB: { name: job.farmerBName ?? "Landowner", role: "Landowner" },
    driver: { name: job.driver, role: "Driver" },
    observer: { name: "Carrier", role: "Transport provider" },
  };
  const viewer = roleLabels[viewerRole];
  const isParty = viewerRole !== "observer";
  const canAccept =
    viewerRole === "observer" && job.status === "available";
  const nextStatus: TransportJobStatus | null =
    viewerRole === "driver"
      ? STATUS_FLOW[STATUS_FLOW.indexOf(job.status) + 1] ?? null
      : null;
  const nextMilestone = milestones.find((milestone) => milestone.status !== "passed");
  const canPassMilestone =
    viewerRole === "driver" &&
    job.status === "in_transit" &&
    !!nextMilestone &&
    !["Loaded", "Departed", "Arriving", "Delivered"].includes(nextMilestone.label);

  useEffect(() => {
    if (job.status !== "completed") return;
    if (viewerRole !== "farmerA" && viewerRole !== "farmerB") return;
    if (settlement) return;
    void ensureSettlement("ensure", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.status, viewerRole, settlement?.id]);

  async function setStatus(status: TransportJobStatus) {
    setUpdating(true);
    lastLocalMutationRef.current = Date.now();
    try {
      const { job: updated } = await updateTransportJobStatus(job.id, status);
      if (!updated || (status === "accepted" && updated.status === "available")) {
        flash("Couldn't update the job - please try again.", "warning");
        setUpdating(false);
        return;
      }
      setJob(updated);
      void listTransportMilestones(job.id).then(setMilestones);
      lastLocalMutationRef.current = 0;
      flash(`Status updated: ${STATUS_LABELS[updated.status] ?? updated.status}.`, "success");
    } catch {
      flash("Couldn't update the job - please try again.", "warning");
    }
    setUpdating(false);
  }

  function sendMessage(body: string) {
    void createTransportMessage({ transportJobId: job.id, body }).then(
      (saved) => {
        if (!saved) {
          flash("Message didn't send. Please try again.", "warning");
          return;
        }
        setMessages((current) => [...current, saved]);
      }
    );
  }

  async function passNextMilestone() {
    if (!nextMilestone) return;
    setUpdating(true);
    const saved = await passTransportMilestone({
      jobId: job.id,
      milestoneId: nextMilestone.id,
    });
    if (!saved) {
      flash("Couldn't record that milestone. Please try again.", "warning");
      setUpdating(false);
      return;
    }
    setMilestones((current) =>
      current.map((milestone) => (milestone.id === saved.id ? saved : milestone))
    );
    flash(`${saved.label} recorded. Farmers can see it now.`, "success");
    setUpdating(false);
  }

  async function ensureSettlement(
    action: "ensure" | "mark_settled",
    showFlash = true
  ) {
    setSettlementBusy(true);
    const response = await fetch("/api/payments/agistment-settlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transportJobId: job.id, action }),
    });
    if (!response.ok) {
      if (showFlash) {
        flash("Couldn't update settlement. Please try again.", "warning");
      }
      setSettlementBusy(false);
      return;
    }
    const nextSettlement = await getAgreementSettlementForTransportJob(job.id);
    setSettlement(nextSettlement);
    if (showFlash) {
      flash(
        action === "mark_settled"
          ? "Settlement marked as settled."
          : "Settlement record opened.",
        "success"
      );
    }
    setSettlementBusy(false);
  }

  return (
    <div className="space-y-5">
      <Card className="border-sage/30 bg-sage-mist/70">
        <p className="text-sm font-bold text-sage-deep">
          {isParty
            ? `You are ${viewer.name} (${viewer.role}).`
            : "You are viewing this job as a carrier."}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-bark/85">
          {roleLabels.farmerA.name} (livestock owner) and{" "}
          {roleLabels.farmerB.name} (landowner)
          {job.driverId
            ? ` are working with ${roleLabels.driver.name} (driver).`
            : " are waiting for a carrier to accept this job."}{" "}
          Route, load and timing only - agistment terms stay private to the
          farmers.
        </p>
      </Card>

      <SplitWorkspace
        leftLabel="Job"
        rightLabel="Chat"
        left={
          <div className="space-y-4">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-bark/65">
                    {job.livestockCount}
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold leading-snug text-sage-deep">
                    {job.routeSummary}
                  </h2>
                </div>
                <StatusBadge
                  tone={
                    job.status === "completed"
                      ? "success"
                      : job.status === "cancelled"
                        ? "neutral"
                        : job.status === "available"
                          ? "warning"
                          : "info"
                  }
                >
                  {STATUS_LABELS[job.status] ?? job.status}
                </StatusBadge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoTile tone="subtle" size="sm" label="Pickup" value={job.pickup} />
                <InfoTile tone="subtle" size="sm" label="Destination" value={job.destination} />
                <InfoTile tone="subtle" size="sm" label="Preferred date" value={job.preferredDate} />
                <InfoTile
                  tone="subtle"
                  size="sm"
                  label="Driver"
                  value={job.driverId ? job.driver : "Awaiting carrier"}
                />
              </div>

              <StatusStepper status={job.status} />

              <MilestoneTimeline
                milestones={milestones}
                canPassMilestone={canPassMilestone}
                nextMilestoneLabel={nextMilestone?.label}
                updating={updating}
                onPassMilestone={passNextMilestone}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {canAccept && (
                  <Button
                    type="button"
                    onClick={() => setStatus("accepted")}
                    disabled={updating}
                  >
                    <Truck className="h-4 w-4" aria-hidden />
                    {updating ? "Accepting..." : "Accept this job"}
                  </Button>
                )}
                {nextStatus && (
                  <Button
                    type="button"
                    onClick={() => setStatus(nextStatus)}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden />
                    {updating
                      ? "Updating..."
                      : `Mark ${STATUS_LABELS[nextStatus].toLowerCase()}`}
                  </Button>
                )}
                {(viewerRole === "farmerA" || viewerRole === "farmerB") && (
                  <ButtonLink
                    href={`/workspace/${job.agreementId}`}
                    variant="secondary"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Agreement workspace
                  </ButtonLink>
                )}
                {viewerRole === "driver" && (
                  <ButtonLink href="/transport/jobs" variant="secondary">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    RFT board
                  </ButtonLink>
                )}
              </div>
              {viewerRole === "driver" && !nextStatus && job.status === "completed" && (
                <p className="mt-3 text-sm font-semibold text-bark/70">
                  Job complete - nice work. Find your next run on the RFT board.
                </p>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-bold uppercase tracking-wide text-sage-deep">
                Status history
              </h3>
              {timeline.length === 0 ? (
                <p className="mt-2 text-sm text-bark/65">
                  Status changes will appear here as the job moves.
                </p>
              ) : (
                <ol className="mt-3 space-y-2.5">
                  {timeline.map((event, index) => (
                    <li key={`${event.title}-${index}`} className="flex items-start gap-2.5">
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-sage-deep">
                          {event.title}
                        </p>
                        <p className="text-sm text-bark/70">{event.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            {job.status === "completed" && (
              <SettlementCard
                viewerRole={viewerRole}
                settlement={settlement}
                busy={settlementBusy}
                onOpen={() => ensureSettlement("ensure")}
                onSettle={() => ensureSettlement("mark_settled")}
              />
            )}

            <Card className="border-sage-deep/10 bg-cream/55">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" aria-hidden />
                <p className="text-sm leading-relaxed text-bark/75">
                  See this route on the live map from the{" "}
                  <Link
                    href={`/map?transport=${job.id}`}
                    className="font-bold text-sage-deep underline-offset-2 hover:underline"
                  >
                    Map tab
                  </Link>
                  . Preferred pickup{" "}
                  <CalendarDays className="inline h-3.5 w-3.5" aria-hidden />{" "}
                  {job.preferredDate}.
                </p>
              </div>
            </Card>
          </div>
        }
        right={
          <ChatPanel
            title={
              job.driverId
                ? `${roleLabels.farmerA.name}, ${roleLabels.farmerB.name} and ${roleLabels.driver.name}`
                : `${roleLabels.farmerA.name} and ${roleLabels.farmerB.name}`
            }
            messages={messages}
            onlineCount={job.driverId ? 3 : 2}
            onSend={isParty ? sendMessage : undefined}
            composerSenderLabel={isParty ? `${viewer.name} (${viewer.role})` : undefined}
          />
        }
      />
    </div>
  );
}

function StatusStepper({ status }: { status: TransportJobStatus }) {
  const currentIndex = STATUS_FLOW.indexOf(status);
  return (
    <ol className="mt-4 flex flex-wrap items-center gap-1.5" aria-label="Movement progress">
      {STATUS_FLOW.map((step, index) => {
        const reached = currentIndex >= index;
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold",
                reached
                  ? "bg-sage-deep text-cream"
                  : "border border-mist bg-warm-white text-bark/55"
              )}
            >
              {STATUS_LABELS[step]}
            </span>
            {index < STATUS_FLOW.length - 1 && (
              <span className="h-px w-3 bg-mist" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function MilestoneTimeline({
  milestones,
  canPassMilestone,
  nextMilestoneLabel,
  updating,
  onPassMilestone,
}: {
  milestones: TransportMilestone[];
  canPassMilestone: boolean;
  nextMilestoneLabel?: string;
  updating: boolean;
  onPassMilestone: () => void;
}) {
  if (milestones.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-sage-mist bg-cream/70 p-3">
        <p className="text-sm font-bold text-sage-deep">Tracking milestones</p>
        <p className="mt-1 text-sm text-bark/70">
          Milestones will appear once the RFT is accepted. The timeline stays
          useful even when live GPS is patchy.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-sage-mist bg-cream/70 p-3" aria-label="Transport milestone timeline">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-sage-deep">Tracking milestones</p>
          <p className="text-xs font-semibold text-bark/60">
            Passed milestones light up; the current leg stays clear even without GPS.
          </p>
        </div>
        {canPassMilestone && (
          <Button
            type="button"
            variant="secondary"
            onClick={onPassMilestone}
            disabled={updating}
            className="min-h-10"
          >
            <CheckCircle className="h-4 w-4" aria-hidden />
            {updating ? "Recording..." : `Passed ${nextMilestoneLabel}`}
          </Button>
        )}
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {milestones.map((milestone) => {
          const passed = milestone.status === "passed";
          return (
            <li
              key={milestone.id}
              className={cn(
                "min-h-20 rounded-xl border p-3",
                passed
                  ? "border-sage/40 bg-sage-mist text-sage-deep"
                  : "border-mist bg-warm-white text-bark/65"
              )}
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-bold",
                    passed
                      ? "border-sage-deep bg-sage-deep text-cream"
                      : "border-mist bg-cream text-stone"
                  )}
                >
                  {milestone.sortOrder}
                </span>
                <div>
                  <p className="text-sm font-bold">{milestone.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed">
                    {passed && milestone.passedAt
                      ? `Passed ${relativeTime(milestone.passedAt)}.`
                      : milestone.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SettlementCard({
  viewerRole,
  settlement,
  busy,
  onOpen,
  onSettle,
}: {
  viewerRole: ViewerRole;
  settlement: AgreementSettlementSummary | null;
  busy: boolean;
  onOpen: () => void;
  onSettle: () => void;
}) {
  if (viewerRole === "driver") {
    return (
      <Card className="border-sage-mist bg-cream/60">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sage-deep">
          Farmer settlement
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-bark/70">
          This movement is complete. Agistment settlement is handled between the
          livestock owner and landowner, separate from carrier pricing.
        </p>
      </Card>
    );
  }

  if (viewerRole !== "farmerA" && viewerRole !== "farmerB") return null;

  const settled = settlement?.status === "payment_recorded";
  return (
    <Card className="border-ochre/40 bg-ochre-light/45">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-sage-deep">
            Final settlement
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-bark/75">
            Online payments are launching soon. Settle directly for now; the
            amount and outcome still stay on the agreement record.
          </p>
        </div>
        <StatusBadge tone={settled ? "success" : "warning"}>
          {settled ? "Settled" : "Awaiting settlement"}
        </StatusBadge>
      </div>
      {settlement ? (
        <div className="mt-3 rounded-xl border border-ochre/30 bg-warm-white p-3">
          <p className="text-lg font-bold text-bark">
            {formatMoney(settlement.amountCents, settlement.currency)}
          </p>
          <p className="mt-1 text-sm text-bark/70">{settlement.description}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold text-bark/70">
          Open the settlement record to calculate what is owed from the
          agreement terms.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {!settlement && (
          <Button type="button" onClick={onOpen} disabled={busy}>
            {busy ? "Opening..." : "Open settlement record"}
          </Button>
        )}
        {settlement && !settled && (
          <Button type="button" onClick={onSettle} disabled={busy}>
            {busy ? "Recording..." : "Mark settled directly"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "recently";
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
