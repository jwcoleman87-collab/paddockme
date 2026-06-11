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
  getCurrentUserId,
  getTransportJobRecord,
  listTransportMessages,
  listTransportStatusEvents,
  updateTransportJobStatus,
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
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
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
