"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { SplitWorkspace } from "@/components/SplitWorkspace";
import { TransportPanel } from "@/components/TransportPanel";
import { cn } from "@/lib/utils";
import type { Message, TransportJob, TransportRole } from "@/lib/dummyData";

const roles: { id: TransportRole; label: string; helper: string }[] = [
  {
    id: "farmerA",
    label: "Farmer A",
    helper: "Livestock owner (Dale)",
  },
  {
    id: "farmerB",
    label: "Farmer B",
    helper: "Landowner (Brett)",
  },
  {
    id: "driver",
    label: "Driver",
    helper: "Transporter (Wayne)",
  },
];

const senderProfile: Record<
  TransportRole,
  { id: string; name: string; role: string }
> = {
  farmerA: { id: "farmer-a", name: "Dale", role: "Livestock owner" },
  farmerB: { id: "farmer-b", name: "Brett", role: "Landowner" },
  driver: { id: "driver-1", name: "Wayne", role: "Driver" },
};

export function TransportClient({
  job,
  messages: initialMessages,
}: {
  job: TransportJob;
  messages: Message[];
}) {
  const [role, setRole] = useState<TransportRole>("farmerA");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const sectionsForChat = job.sections.map((section) => ({
    id: section.id,
    label: section.label,
  }));

  function sendMessage(body: string) {
    const sender = senderProfile[role];
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        threadId: job.id,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        body,
        time: shortTime(),
        sectionId: activeSectionId ?? undefined,
      },
    ]);
  }

  const composerSenderLabel = `${senderProfile[role].name} (${senderProfile[role].role})`;

  return (
    <div className="space-y-5">
      <section
        aria-label="Prototype role switcher"
        className="rounded-2xl border border-sage-deep/15 bg-cream/55 p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sage-deep">
            <Users className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Viewing as
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-warm-white px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-stone">
            Prototype
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose your role for this transport room"
          className="grid gap-2 sm:grid-cols-3"
        >
          {roles.map((option) => {
            const active = option.id === role;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRole(option.id)}
                className={cn(
                  "flex min-h-16 flex-col items-start gap-0.5 rounded-xl border px-4 py-2 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                  active
                    ? "border-sage-deep bg-sage-deep text-cream shadow-sm"
                    : "border-mist bg-warm-white text-bark hover:border-sage/40 hover:bg-sage-mist/40"
                )}
              >
                <span className="text-sm font-bold">{option.label}</span>
                <span
                  className={cn(
                    "text-xs",
                    active ? "text-sage-glow" : "text-bark/60"
                  )}
                >
                  {option.helper}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <SplitWorkspace
        leftLabel="Transport"
        rightLabel="Group chat"
        left={
          <TransportPanel
            job={job}
            role={role}
            activeSectionId={activeSectionId}
            onSelectSection={(id) => setActiveSectionId(id)}
          />
        }
        right={
          <ChatPanel
            title="Farmer A, Farmer B and Driver"
            messages={messages}
            onlineCount={3}
            sections={sectionsForChat}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onSend={sendMessage}
            composerSenderLabel={composerSenderLabel}
          />
        }
      />
    </div>
  );
}

function shortTime(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}
