"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Truck } from "lucide-react";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import type {
  Agreement,
  AgreementLifecycleEvent,
  TransportJob,
} from "@/lib/dummyData";

type AgreementEntry = {
  kind: "agreement";
  agreement: Agreement;
  event: AgreementLifecycleEvent;
};

type TransportEntry = {
  kind: "transport";
  job: TransportJob;
  // Most recent system message body, if any, derived from the room's
  // persisted messages.
  note: string;
  // Total parties confirmed across all sections - quick health number.
  confirmationsConfirmed: number;
  confirmationsTotal: number;
};

type Entry = AgreementEntry | TransportEntry;

type Props = {
  agreements: Agreement[];
  transportJobs: TransportJob[];
};

export function ActivityFeed({ agreements, transportJobs }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const collected: Entry[] = [];

    for (const agreement of agreements) {
      try {
        const raw = window.localStorage.getItem(
          `paddockme.workspace.${agreement.id}`
        );
        const history = raw
          ? (JSON.parse(raw) as { lifecycleHistory?: AgreementLifecycleEvent[] })
              .lifecycleHistory
          : undefined;
        const events = history && history.length > 0 ? history : agreement.lifecycleHistory;
        if (events && events.length > 0) {
          collected.push({
            kind: "agreement",
            agreement,
            event: events[events.length - 1],
          });
        }
      } catch {
        // ignore
      }
    }

    for (const job of transportJobs) {
      try {
        const raw = window.localStorage.getItem(`paddockme.transport.${job.id}`);
        let confirmationsConfirmed = 0;
        let confirmationsTotal = job.sections.length * 3;
        let note = `${job.livestockCount} - ${job.status.toLowerCase()}.`;
        if (raw) {
          const parsed = JSON.parse(raw) as {
            confirmations?: Record<
              string,
              { farmerA: boolean; farmerB: boolean; driver: boolean }
            >;
            messages?: { senderId: string; body: string }[];
          };
          if (parsed.confirmations) {
            confirmationsConfirmed = Object.values(parsed.confirmations).reduce(
              (sum, c) =>
                sum + (c.farmerA ? 1 : 0) + (c.farmerB ? 1 : 0) + (c.driver ? 1 : 0),
              0
            );
          }
          if (parsed.messages) {
            const lastSystem = [...parsed.messages]
              .reverse()
              .find((m) => m.senderId === "system");
            if (lastSystem) note = lastSystem.body;
          }
        } else {
          // Seed confirmations from the job data when no stored state exists.
          confirmationsConfirmed = job.sections.reduce(
            (sum, s) =>
              sum +
              (s.confirmations.farmerA ? 1 : 0) +
              (s.confirmations.farmerB ? 1 : 0) +
              (s.confirmations.driver ? 1 : 0),
            0
          );
        }
        collected.push({
          kind: "transport",
          job,
          note,
          confirmationsConfirmed,
          confirmationsTotal,
        });
      } catch {
        // ignore
      }
    }

    setEntries(collected);
    setHydrated(true);
  }, [agreements, transportJobs]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Recent activity"
      className={cn(
        "mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4",
        !hydrated && "opacity-60"
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sage-deep">
        <Activity className="h-5 w-5" aria-hidden />
        <h2 className="text-sm font-bold uppercase tracking-wide">
          Recent activity
        </h2>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.kind === "agreement" ? entry.agreement.id : entry.job.id}>
            <ActivityRow entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityRow({ entry }: { entry: Entry }) {
  if (entry.kind === "agreement") {
    const { agreement, event } = entry;
    return (
      <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-bark">
              {event.from ? `${event.from} -> ${event.to}` : `Created as ${event.to}`}
            </span>
            <span className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-sage-deep">
              {event.byParty}
            </span>
          </p>
          {event.note && (
            <p className="mt-1 text-xs text-bark/65">{event.note}</p>
          )}
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-stone">
            {event.at} &middot; Agreement {agreement.id.slice(-8)}
          </p>
        </div>
        <Link
          href={`/workspace/${agreement.id}`}
          className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-sage-deep/20 bg-warm-white px-3 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </Card>
    );
  }

  const { job, note, confirmationsConfirmed, confirmationsTotal } = entry;
  return (
    <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <Truck className="h-4 w-4 shrink-0 text-sage-deep" aria-hidden />
          <span className="font-semibold text-bark">
            Transport: {job.livestockCount}
          </span>
          <span className="rounded-full bg-warm-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-stone">
            {confirmationsConfirmed} / {confirmationsTotal} confirmations
          </span>
        </p>
        <p className="mt-1 text-xs text-bark/65">{note}</p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-stone">
          {job.routeSummary}
        </p>
      </div>
      <Link
        href={`/transport/${job.id}`}
        className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-sage-deep/20 bg-warm-white px-3 text-xs font-bold text-sage-deep transition hover:border-sage hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      >
        Open
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </Card>
  );
}
