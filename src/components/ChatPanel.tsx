import { Send } from "lucide-react";
import { Button } from "@/components/Button";
import type { Message } from "@/lib/dummyData";

export function ChatPanel({
  title = "Conversation",
  messages,
}: {
  title?: string;
  messages: Message[];
}) {
  return (
    <section className="flex min-h-[560px] flex-col rounded-xl border border-mist bg-cream">
      <div className="border-b border-mist px-5 py-4">
        <h2 className="text-lg font-bold text-sage-deep">{title}</h2>
        <p className="text-sm text-bark/65">
          Dummy conversation for the clickable prototype.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <article key={message.id} className="rounded-xl bg-warm-white p-4">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <div>
                <p className="font-semibold text-bark">{message.senderName}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone">
                  {message.senderRole}
                </p>
              </div>
              <span className="text-xs text-stone">{message.time}</span>
            </div>
            <p className="leading-relaxed text-bark/78">{message.body}</p>
          </article>
        ))}
      </div>

      <div className="border-t border-mist p-4">
        <div className="flex min-h-12 items-center justify-between gap-3 rounded-full border border-mist bg-warm-white px-4 py-2 text-sm text-stone">
          <span>Message field placeholder</span>
          <Button type="button" aria-label="Send placeholder message" className="h-10 min-h-10 px-4">
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
