"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  DollarSign,
  Inbox,
  ListChecks,
  Truck,
} from "lucide-react";
import { Card } from "@/components/Card";
import { INBOX_UPDATE_EVENT, getSeenCounts } from "@/lib/inbox";
import { cn } from "@/lib/utils";
import {
  getMessages,
  getTransportMessages,
  livestockRequests,
  type Agreement,
  type Farmer,
  type Message,
  type TransportJob,
  type TransportQuote,
} from "@/lib/dummyData";

type Tile = {
  icon: typeof Inbox;
  label: string;
  count: number;
  detail: string;
  href: string;
  emphasize: boolean;
};

type Props = {
  farmer: Farmer;
  agreements: Agreement[];
  transportJobs: TransportJob[];
};

/**
 * Today-focused row of action tiles at the top of /agreements.
 *
 * Reads localStorage for live state (messages, confirmations, quotes) so the
 * counts reflect whatever the user has done in the prototype, not just seed
 * data. Click-through goes to the surface where the work happens.
 */
export function WhatNeedsYou({ farmer, agreements, transportJobs }: Props) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function recompute() {
      setTiles(buildTiles({ farmer, agreements, transportJobs }));
      setHydrated(true);
    }
    recompute();
    function onChange() {
      recompute();
    }
    window.addEventListener(INBOX_UPDATE_EVENT, onChange);
    window.addEventListener("paddockme:prototype-change", onChange);
    window.addEventListener("paddockme:persona-change", onChange);
    return () => {
      window.removeEventListener(INBOX_UPDATE_EVENT, onChange);
      window.removeEventListener("paddockme:prototype-change", onChange);
      window.removeEventListener("paddockme:persona-change", onChange);
    };
  }, [farmer, agreements, transportJobs]);

  if (tiles.length === 0) return null;

  return (
    <section
      aria-label="What needs you today"
      className={cn(
        "mb-5 rounded-2xl border border-sage-deep/15 bg-cream/55 p-4",
        !hydrated && "opacity-60"
      )}
    >
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-sage-deep">
        What needs you
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={cn(
              "block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            )}
          >
            <Card
              className={cn(
                "flex h-full items-start gap-3 transition hover:border-sage/40",
                tile.emphasize && "border-sage bg-sage-mist/45"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  tile.emphasize
                    ? "bg-sage-deep text-cream"
                    : "bg-sage-mist text-sage-deep"
                )}
              >
                <tile.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-3xl font-extrabold leading-none text-sage-deep">
                  {tile.count}
                </p>
                <p className="mt-1 text-sm font-bold text-bark">{tile.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-bark/70">
                  {tile.detail}
                </p>
              </div>
              <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-sage-deep/60"
                aria-hidden
              />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function buildTiles({
  farmer,
  agreements,
  transportJobs,
}: Props): Tile[] {
  const role = farmer.role;
  const personaId = farmer.id;
  const seen = getSeenCounts();

  let unread = 0;
  for (const agreement of agreements) {
    if (
      agreement.farmerAId !== personaId &&
      agreement.farmerBId !== personaId
    )
      continue;
    const count = currentAgreementMessageCount(agreement.id);
    const diff = count - (seen[agreement.id] ?? 0);
    if (diff > 0) unread += diff;
  }
  for (const job of transportJobs) {
    if (
      job.farmerAId !== personaId &&
      job.farmerBId !== personaId &&
      job.driverId !== personaId
    )
      continue;
    const count = currentTransportMessageCount(job.id);
    const diff = count - (seen[job.id] ?? 0);
    if (diff > 0) unread += diff;
  }

  const unreadTile: Tile = {
    icon: Inbox,
    label: "Unread messages",
    count: unread,
    detail:
      unread > 0
        ? "New replies in your rooms - tap to open the inbox."
        : "You're all caught up.",
    href: "/messages",
    emphasize: unread > 0,
  };

  if (role === "Transport Provider") {
    const myJobs = transportJobs.filter((job) => job.driverId === personaId);
    const inMotion = myJobs.filter((job) =>
      ["accepted", "loading", "in_transit"].includes(job.status)
    ).length;
    const openOffers = myJobs.filter((job) => job.status === "available")
      .length;
    return [
      unreadTile,
      {
        icon: Truck,
        label: "Active runs",
        count: inMotion,
        detail:
          inMotion > 0
            ? "Pickups, loading, and on-the-road jobs."
            : "Nothing rolling right now.",
        href: "/runs",
        emphasize: inMotion > 0,
      },
      {
        icon: DollarSign,
        label: "Open offers",
        count: openOffers,
        detail:
          openOffers > 0
            ? "Jobs you've quoted on, waiting for the farmer's call."
            : "No outstanding offers from farmers.",
        href: "/runs",
        emphasize: openOffers > 0,
      },
    ];
  }

  // Livestock owner + landowner share the same "agistment" surfaces but
  // differentiate the third tile by role.
  const myAgreements = agreements.filter(
    (agreement) =>
      agreement.farmerAId === personaId || agreement.farmerBId === personaId
  );

  let openSections = 0;
  for (const agreement of myAgreements) {
    openSections += openSectionsFor(agreement);
  }

  const quotesAwaitingMe = countQuotesAwaitingMe({
    role,
    personaId,
    transportJobs,
  });

  if (role === "Livestock Owner") {
    return [
      unreadTile,
      {
        icon: ListChecks,
        label: "Sections to confirm",
        count: openSections,
        detail:
          openSections > 0
            ? "Open the workspace to agree the remaining sections."
            : "Every section is mutually agreed.",
        href:
          myAgreements.length > 0
            ? `/workspace/${myAgreements[0].id}`
            : "/agreements",
        emphasize: openSections > 0,
      },
      {
        icon: DollarSign,
        label: "Transport quotes to review",
        count: quotesAwaitingMe,
        detail:
          quotesAwaitingMe > 0
            ? "Driver has proposed a rate - your call to accept or counter."
            : "No outstanding driver quotes.",
        href:
          quotesAwaitingMe > 0
            ? transportRoomForLivestockOwner(transportJobs, personaId) ??
              "/agreements"
            : "/transport/available",
        emphasize: quotesAwaitingMe > 0,
      },
    ];
  }

  // Landowner: surface open requests from livestock owners alongside the
  // sections-to-confirm tile so Brett has a proactive offer surface.
  const openRequestCount = countOpenRequestsForLandowner();
  return [
    unreadTile,
    {
      icon: ListChecks,
      label: "Sections to confirm",
      count: openSections,
      detail:
        openSections > 0
          ? "Open the workspace to agree the remaining sections."
          : "Every section is mutually agreed.",
      href:
        myAgreements.length > 0
          ? `/workspace/${myAgreements[0].id}`
          : "/agreements",
      emphasize: openSections > 0,
    },
    {
      icon: CheckCheck,
      label: "Open livestock requests",
      count: openRequestCount,
      detail:
        openRequestCount > 0
          ? "Livestock owners looking for paddocks - offer yours."
          : "No open requests right now.",
      href: "/requests",
      emphasize: openRequestCount > 0,
    },
  ];
}

function countOpenRequestsForLandowner(): number {
  // Until we model "responded" state per landowner, treat every seeded
  // request as a fresh inquiry. Good enough for the prototype.
  return livestockRequests.length;
}

function transportRoomForLivestockOwner(
  transportJobs: TransportJob[],
  personaId: string
): string | null {
  const job = transportJobs.find((j) => j.farmerAId === personaId);
  return job ? `/transport/${job.id}` : null;
}

function openSectionsFor(agreement: Agreement): number {
  // Read live confirmations from localStorage if available so the count
  // reflects what the user has actually agreed in the prototype.
  let state:
    | Record<string, { agreedByA: boolean; agreedByB: boolean }>
    | undefined;
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`paddockme.workspace.${agreement.id}`)
        : null;
    if (raw) {
      const parsed = JSON.parse(raw) as {
        sectionState?: Record<string, { agreedByA: boolean; agreedByB: boolean }>;
      };
      state = parsed.sectionState;
    }
  } catch {
    // ignore
  }
  return agreement.sections.reduce((open, section) => {
    const live = state?.[section.id] ?? {
      agreedByA: section.agreedByA,
      agreedByB: section.agreedByB,
    };
    return open + (live.agreedByA && live.agreedByB ? 0 : 1);
  }, 0);
}

function countQuotesAwaitingMe({
  role,
  personaId,
  transportJobs,
}: {
  role: Farmer["role"];
  personaId: string;
  transportJobs: TransportJob[];
}): number {
  if (role !== "Livestock Owner") return 0;
  let count = 0;
  for (const job of transportJobs) {
    if (job.farmerAId !== personaId) continue;
    const quotes = currentTransportQuotes(job.id, job.quotes ?? []);
    for (const quote of quotes) {
      if (quote.status === "pending" && quote.proposedBy !== "farmerA") {
        count += 1;
      }
    }
  }
  return count;
}

function currentAgreementMessageCount(agreementId: string): number {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`paddockme.workspace.${agreementId}`)
        : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { messages?: Message[] };
      if (parsed.messages) return parsed.messages.length;
    }
  } catch {
    // ignore
  }
  return getMessages(agreementId).length;
}

function currentTransportMessageCount(jobId: string): number {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`paddockme.transport.${jobId}`)
        : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { messages?: Message[] };
      if (parsed.messages) return parsed.messages.length;
    }
  } catch {
    // ignore
  }
  return getTransportMessages(jobId).length;
}

function currentTransportQuotes(
  jobId: string,
  seed: TransportQuote[]
): TransportQuote[] {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`paddockme.transport.${jobId}`)
        : null;
    if (raw) {
      const parsed = JSON.parse(raw) as { quotes?: TransportQuote[] };
      if (parsed.quotes) return parsed.quotes;
    }
  } catch {
    // ignore
  }
  return seed;
}
