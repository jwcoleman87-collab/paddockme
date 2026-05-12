"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ChatPanel } from "@/components/ChatPanel";
import { InfoTile } from "@/components/InfoTile";
import { PartyRoster } from "@/components/PartyRoster";
import { RoutePreview } from "@/components/RoutePreview";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { StatusBadge } from "@/components/StatusBadge";
import type { Farmer, Message, TransportJob } from "@/lib/dummyData";

type TransportRoomClientProps = {
  job: TransportJob;
  farmerA: Farmer;
  farmerB: Farmer;
  driver: Farmer;
  messages: Message[];
};

export function TransportRoomClient({
  job,
  farmerA,
  farmerB,
  driver,
  messages,
}: TransportRoomClientProps) {
  const isOpenJob = job.state === "open";
  const [interestSubmitted, setInterestSubmitted] = useState(!isOpenJob);

  const visibleStatus = isOpenJob
    ? interestSubmitted
      ? "Interest submitted"
      : "Open for driver interest"
    : job.status;

  const chatMessages = useMemo<Message[]>(() => {
    if (!isOpenJob) return messages;

    return [
      {
        id: `${job.id}-system-brief`,
        threadId: job.id,
        senderId: "system",
        senderName: "PaddockME",
        senderRole: "System",
        body: interestSubmitted
          ? `${driver.name} has put their hand up for this run. Farmers can now confirm fit before assigning the movement.`
          : "This run is open. Driver can review logistics and put their hand up without seeing private agistment terms.",
        time: interestSubmitted ? "Now" : "Draft",
      },
    ];
  }, [driver.name, interestSubmitted, isOpenJob, job.id, messages]);

  return (
    <div className="space-y-5">
      <PartyRoster
        farmerA={farmerA}
        farmerB={farmerB}
        driver={driver}
        driverStatus={isOpenJob && !interestSubmitted ? "candidate" : "assigned"}
      />

      <SplitWorkspace
        leftLabel="Movement"
        rightLabel="Chat"
        left={
          <div className="space-y-5">
            <Card className="bg-warm-white">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {!isOpenJob && (
                  <StatusBadge tone="success">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    You're the confirmed driver
                  </StatusBadge>
                )}
                <StatusBadge tone={interestSubmitted ? "success" : "info"}>
                  Status: {visibleStatus}
                </StatusBadge>
                <StatusBadge tone="success">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  No private contract pricing
                </StatusBadge>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-sage-deep">
                    The run
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark/85">
                    Driver-safe logistics for {job.livestockCount}. This is the
                    shared movement surface, not the agistment contract.
                  </p>
                </div>

                {isOpenJob && !interestSubmitted ? (
                  <Button
                    type="button"
                    onClick={() => setInterestSubmitted(true)}
                    className="shrink-0"
                  >
                    Put my hand up
                    <Truck className="h-4 w-4" aria-hidden />
                  </Button>
                ) : (
                  <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-match/25 bg-match-light px-4 py-2 text-sm font-bold text-match">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    Driver visible to farmers
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoTile icon={<MapPin />} label="Pickup" value={job.pickup} />
                <InfoTile icon={<MapPin />} label="Destination" value={job.destination} />
                <InfoTile icon={<Truck />} label="Livestock" value={job.livestockCount} />
                <InfoTile icon={<CalendarDays />} label="Preferred date" value={job.preferredDate} />
                <InfoTile icon={<Route />} label="Route" value={job.routeSummary} />
                <InfoTile icon={<Clock3 />} label="Estimated time" value={job.estimatedDuration} />
                <InfoTile icon={<Truck />} label="Rate guide" value={job.rateGuide} />
                <InfoTile icon={<MapPin />} label="Distance" value={`${job.distanceKm} km`} />
                <InfoTile
                  icon={<Truck />}
                  label={isOpenJob && !interestSubmitted ? "Candidate driver" : "Driver"}
                  value={driver.name}
                />
              </div>
            </Card>

            <Card className="bg-warm-white">
              <h2 className="text-xl font-bold text-sage-deep">
                What's visible so far
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <ReadinessRow label="Pickup and destination visible" complete />
                <ReadinessRow label="Livestock count visible" complete />
                <ReadinessRow label="Private terms hidden" complete />
                <ReadinessRow
                  label="Driver interest captured"
                  complete={!isOpenJob || interestSubmitted}
                />
              </div>
              {isOpenJob && interestSubmitted && (
                <div className="mt-4 rounded-xl border border-sage-glow bg-sage-mist px-4 py-3 text-sm leading-relaxed text-sage-deep">
                  Next prototype step: Farmer A and Farmer B confirm the driver,
                  then this becomes the assigned three-party transport room. You
                  will get a notification when Dale responds.
                </div>
              )}
            </Card>

            <RoutePreview job={job} />
          </div>
        }
        right={
          <ChatPanel
            title={isOpenJob ? "Transport interest room" : "Farmer A, Farmer B and Driver"}
            messages={chatMessages}
            onlineCount={interestSubmitted ? 3 : 2}
          />
        }
      />

      {isOpenJob && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/jobs" variant="secondary">
            Back to jobs
          </ButtonLink>
          <ButtonLink href="/transport/transport-glenbarra" variant="secondary">
            Preview assigned room
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
function ReadinessRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-mist bg-cream px-4 py-3">
      <span className="text-sm font-semibold text-bark">{label}</span>
      <CheckCircle2
        className={complete ? "h-5 w-5 shrink-0 text-match" : "h-5 w-5 shrink-0 text-bark/75"}
        aria-hidden
      />
    </div>
  );
}
