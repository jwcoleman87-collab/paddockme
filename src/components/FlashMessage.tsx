"use client";

import { useEffect } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlashTone = "success" | "info" | "warning";

const toneStyles: Record<
  FlashTone,
  {
    icon: React.ComponentType<{ className?: string }>;
    container: string;
    iconClass: string;
  }
> = {
  success: {
    icon: Check,
    container: "border-match/30 bg-match-light text-bark",
    iconClass: "bg-match text-cream",
  },
  info: {
    icon: Info,
    container: "border-sage-deep/25 bg-sage-mist text-bark",
    iconClass: "bg-sage-deep text-cream",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-amber/30 bg-amber-light text-bark",
    iconClass: "bg-amber text-cream",
  },
};

type FlashMessageProps = {
  message: string;
  tone?: FlashTone;
  onDismiss: () => void;
  durationMs?: number;
};

export function FlashMessage({
  message,
  tone = "info",
  onDismiss,
  durationMs = 4000,
}: FlashMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  const { icon: Icon, container, iconClass } = toneStyles[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 sm:bottom-28"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(34,84,52,0.18)] backdrop-blur",
          container
        )}
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            iconClass
          )}
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-bark/55 transition hover:bg-warm-white hover:text-bark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
