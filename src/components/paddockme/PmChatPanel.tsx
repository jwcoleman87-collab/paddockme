"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PmAvatar } from "@/components/paddockme/PmAvatar";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoWorkspace, workspaceSeedMessages } from "@/lib/paddockmeDemoData";
import {
  demoThreadTime,
  imageFileToDataUrl,
  useDemoThread,
  type DemoThreadRole,
} from "@/lib/demoThread";
import { usePaddockmeWorkflow } from "@/lib/paddockmeWorkflow";

/**
 * PmChatPanel — the shared workspace chat for the guided demo.
 *
 * This is the "constant open communication" surface: the livestock owner and
 * landowner talk in one thread (the transporter joins once transport is
 * booked) and can share photos (yards, stock, access, damage, etc.). Styled
 * with the pm-* tokens so it sits naturally next to the deal summary.
 *
 * DEMO SCOPE: there is no auth on this page, so instead of detecting the
 * signed-in party we let you *act as* any of the parties via the chips at
 * the top — that's how you demo a live multi-party conversation from one
 * screen.
 *
 * Persistence: messages (and downscaled photos) are stored in localStorage
 * via useDemoThread, so the thread survives refreshes and is wiped by Reset
 * Demo. Deliberately no Supabase dependency — the demo must never brick
 * mid-pitch, and Rod owns the production messaging architecture. The seeded
 * conversation is the scripted backstory, derived from the visitor's actual
 * request so it never contradicts the deal on screen.
 */

type Role = DemoThreadRole;

type ChatMessage = {
  id: string;
  sender: string;
  role: Role;
  time: string;
  text: string;
  imageUrl?: string;
  imageName?: string;
};

// Map each party's role -> the display name + face shown on their bubbles.
const PARTY_BY_ROLE: Record<
  Role,
  { name: string; initials: string; avatar: string }
> = {
  owner: {
    name: "James Coleman",
    initials: "JC",
    avatar: paddockmeImages.avatarJames,
  },
  landowner: {
    name: "John — Green Hills Farm",
    initials: "GH",
    avatar: paddockmeImages.avatarJohn,
  },
  transporter: {
    name: "Wayne Transport",
    initials: "WT",
    avatar: paddockmeImages.avatarWayne,
  },
};

// Role -> avatar chip colour. Icons/labels always carry the meaning too, so
// this never relies on colour alone.
const ROLE_CHIP: Record<Role, string> = {
  owner: "bg-pm-green-900 text-white",
  landowner: "bg-pm-gold-500 text-pm-charcoal",
  transporter: "bg-pm-charcoal text-white",
};

const ROLE_LABEL: Record<Role, string> = {
  owner: "Livestock owner",
  landowner: "Landowner",
  transporter: "Transporter",
};

export function PmChatPanel({
  workspaceId = demoWorkspace.id,
}: {
  workspaceId?: string;
}) {
  const { state } = usePaddockmeWorkflow();
  const thread = useDemoThread(`workspace-chat-${workspaceId}`);

  // The transporter joins the workspace thread once they're booked; until
  // then the conversation is between the two farmers (transport coordination
  // happens in its own room).
  const roles: Role[] = state.agreement.transportArranged
    ? ["owner", "landowner", "transporter"]
    : ["owner", "landowner"];

  const [activeRole, setActiveRole] = useState<Role>("owner");
  const [draft, setDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<
    { url: string; name: string; file: File } | null
  >(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const seeds: ChatMessage[] = workspaceSeedMessages(state.request).map(
    (m, i) => ({
      id: `seed-${i}`,
      sender: m.sender,
      role: m.role,
      time: m.time,
      text: m.text,
    }),
  );
  const messages: ChatMessage[] = [
    ...seeds,
    ...thread.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      role: m.role,
      time: demoThreadTime(m.sentAt),
      text: m.text,
      imageUrl: m.imageDataUrl,
      imageName: m.imageName,
    })),
  ];

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const me = PARTY_BY_ROLE[activeRole];
  const canSend = draft.trim().length > 0 || !!pendingImage;

  function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (pendingImage) URL.revokeObjectURL(pendingImage.url);
    setPendingImage({ url: URL.createObjectURL(file), name: file.name, file });
    // Allow re-selecting the same file later.
    event.target.value = "";
  }

  function clearPendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    const text = draft.trim();
    const image = pendingImage;

    let imageDataUrl: string | undefined;
    if (image) {
      try {
        imageDataUrl = await imageFileToDataUrl(image.file);
      } catch {
        // unreadable file — send the words without the photo
      }
      URL.revokeObjectURL(image.url);
    }

    thread.append({
      sender: me.name,
      role: activeRole,
      text,
      imageDataUrl,
      imageName: image?.name,
    });
    setDraft("");
    setPendingImage(null);
  }

  return (
    <section className="flex h-full min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-pm-border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-pm-border bg-pm-cream-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-pm-charcoal">Chat</h2>
            <p className="text-xs text-pm-muted">All parties · open &amp; transparent</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-pm-border bg-white px-3 py-1 text-xs font-bold text-pm-charcoal">
            {roles.length} participants
          </span>
        </div>

        {/* Act-as selector (demo only — stands in for the signed-in party). */}
        <div className="mt-3">
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-pm-muted">
            You are messaging as
          </p>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => {
              const party = PARTY_BY_ROLE[role];
              const active = role === activeRole;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
                    active
                      ? "border-pm-green-900 bg-pm-green-900 text-white"
                      : "border-pm-border bg-white text-pm-charcoal hover:border-pm-green-900",
                  )}
                >
                  <PmAvatar
                    src={party.avatar}
                    initials={party.initials}
                    className={cn(
                      "h-5 w-5 border-0",
                      active && "ring-1 ring-white/60",
                    )}
                    fallbackClassName={ROLE_CHIP[role]}
                  />
                  {party.name.split(" — ")[0].split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4"
      >
        {messages.length === 0 && (
          <p className="text-sm text-pm-muted">No messages yet.</p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={m.role === activeRole} />
        ))}
      </div>

      {/* Pending image preview */}
      {pendingImage && (
        <div className="flex items-center gap-3 border-t border-pm-border bg-pm-cream-50 px-4 py-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingImage.url}
            alt={pendingImage.name}
            className="h-12 w-12 rounded-lg border border-pm-border object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-xs text-pm-muted">
            {pendingImage.name}
          </span>
          <button
            type="button"
            onClick={clearPendingImage}
            aria-label="Remove image"
            className="flex h-7 w-7 items-center justify-center rounded-full text-pm-muted hover:bg-pm-cream-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-pm-border bg-pm-cream-50 p-3"
      >
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePickImage}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Share an image"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pm-border bg-white text-pm-green-900 transition hover:border-pm-green-900"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message as ${me.name.split(" — ")[0]}`}
            aria-label="Write a message"
            className="min-h-11 flex-1 rounded-full border border-pm-border bg-white px-4 text-sm text-pm-charcoal outline-none transition focus:border-pm-green-900 focus:ring-2 focus:ring-pm-green-900/20"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pm-green-900 text-white transition hover:bg-pm-green-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  const party = PARTY_BY_ROLE[message.role];
  return (
    <article className={cn("flex gap-2.5", isMine && "flex-row-reverse")}>
      <PmAvatar
        src={party.avatar}
        initials={party.initials}
        fallbackClassName={ROLE_CHIP[message.role]}
      />
      <div className={cn("min-w-0 max-w-[80%]", isMine && "items-end text-right")}>
        <div
          className={cn(
            "mb-1 flex items-center gap-2 text-xs",
            isMine && "flex-row-reverse",
          )}
        >
          <span className="font-bold text-pm-charcoal">{message.sender}</span>
          <span className="text-pm-muted">{ROLE_LABEL[message.role]}</span>
          <span className="text-pm-muted">· {message.time}</span>
        </div>
        <div
          className={cn(
            "inline-block rounded-2xl border px-3.5 py-2.5 text-left text-sm leading-relaxed",
            isMine
              ? "border-pm-green-900 bg-pm-green-900 text-white"
              : "border-pm-border bg-pm-cream-50 text-pm-charcoal",
          )}
        >
          {message.imageUrl && (
            <a
              href={message.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageUrl}
                alt={message.imageName ?? "Shared image"}
                className="max-h-52 w-full object-cover"
              />
            </a>
          )}
          {message.text && <p>{message.text}</p>}
        </div>
      </div>
    </article>
  );
}
