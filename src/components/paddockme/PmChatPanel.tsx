"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoTransportRoomMessages,
  demoTransportRoomParticipants,
} from "@/lib/paddockmeDemoData";

/**
 * PmChatPanel — the three-way workspace chat for the guided MVP demo.
 *
 * This is the "constant open communication" surface: livestock owner,
 * landowner and transporter all talk in one thread and can share photos
 * (yards, stock, access, damage, etc.). Styled with the pm-* tokens so it
 * sits naturally next to the deal summary on the workspace overview.
 *
 * DEMO SCOPE: there is no auth on this page yet, so instead of detecting the
 * signed-in party we let you *act as* any of the three parties via the chips
 * at the top — that's how you demo a live 3-way conversation to one screen.
 * Messages and image previews live in local state only. When this flips to
 * the real backend, swap the local send handler for a Supabase insert and the
 * object-URL image for a Storage upload (migration already drafted).
 */

type Role = "owner" | "landowner" | "transporter";

type ChatMessage = {
  id: string;
  sender: string;
  role: Role;
  time: string;
  text: string;
  imageUrl?: string;
  imageName?: string;
};

// Map each party's role -> the display name + initials shown on their bubbles.
const PARTY_BY_ROLE: Record<Role, { name: string; initials: string }> = {
  owner: { name: "James Coleman", initials: "JC" },
  landowner: { name: "John — Green Hills Farm", initials: "GH" },
  transporter: { name: "Wayne Transport", initials: "WT" },
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

function seedMessages(): ChatMessage[] {
  return demoTransportRoomMessages.map((m, i) => ({
    id: `seed-${i}`,
    sender: m.sender,
    role: m.role,
    time: m.time,
    text: m.text,
  }));
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PmChatPanel() {
  const parties = demoTransportRoomParticipants;
  const roleOf = (i: number): Role =>
    (["owner", "landowner", "transporter"] as Role[])[i] ?? "owner";

  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [activeRole, setActiveRole] = useState<Role>("owner");
  const [draft, setDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<
    { url: string; name: string } | null
  >(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Revoke object URLs on unmount so we don't leak blobs.
  useEffect(() => {
    return () => {
      messages.forEach((m) => m.imageUrl?.startsWith("blob:") && URL.revokeObjectURL(m.imageUrl));
      if (pendingImage) URL.revokeObjectURL(pendingImage.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const me = PARTY_BY_ROLE[activeRole];

  const canSend = draft.trim().length > 0 || !!pendingImage;

  function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (pendingImage) URL.revokeObjectURL(pendingImage.url);
    setPendingImage({ url: URL.createObjectURL(file), name: file.name });
    // Allow re-selecting the same file later.
    event.target.value = "";
  }

  function clearPendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.url);
    setPendingImage(null);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    setMessages((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        sender: me.name,
        role: activeRole,
        time: nowTime(),
        text: draft.trim(),
        imageUrl: pendingImage?.url,
        imageName: pendingImage?.name,
      },
    ]);
    setDraft("");
    setPendingImage(null);
  }

  const onlineCount = parties.length;

  return (
    <section className="flex h-full min-h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-pm-border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-pm-border bg-pm-cream-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-pm-charcoal">Live Chat</h2>
            <p className="text-xs text-pm-muted">All parties · open &amp; transparent</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-pm-success/20 bg-pm-success/10 px-3 py-1 text-xs font-bold text-pm-success">
            <span className="h-2 w-2 rounded-full bg-pm-success" aria-hidden />
            {onlineCount} online
          </span>
        </div>

        {/* Act-as selector (demo only — stands in for the signed-in party). */}
        <div className="mt-3">
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-pm-muted">
            You are messaging as
          </p>
          <div className="flex flex-wrap gap-1.5">
            {parties.map((p, i) => {
              const role = roleOf(i);
              const active = role === activeRole;
              return (
                <button
                  key={p.name}
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
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[0.55rem] font-bold",
                      active ? "bg-white/20 text-white" : ROLE_CHIP[role],
                    )}
                  >
                    {p.initials}
                  </span>
                  {p.name.split(" — ")[0].split(" ")[0]}
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
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
          ROLE_CHIP[message.role],
        )}
        aria-hidden
      >
        {party.initials}
      </span>
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
