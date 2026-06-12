import { AlertTriangle, CheckCircle, CircleDot, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "neutral" | "info";

const tones: Record<StatusTone, string> = {
  success: "border-match/35 bg-match-light text-match",
  warning: "border-amber/40 bg-amber-light text-amber",
  neutral: "border-stone/30 bg-warm-white text-bark/85",
  info: "border-sage/35 bg-sage-mist text-sage-deep",
};

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  neutral: Clock3,
  info: CircleDot,
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-8 max-w-full items-center gap-1.5 whitespace-normal rounded-md border px-3 py-1 text-left text-xs font-bold shadow-sm shadow-bark/5",
        tones[tone],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </span>
  );
}
