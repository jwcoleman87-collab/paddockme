import { AlertTriangle, CheckCircle, CircleDot, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "neutral" | "info";

const tones: Record<StatusTone, string> = {
  success: "border-match/25 bg-match-light text-match",
  warning: "border-amber/30 bg-amber-light text-amber",
  neutral: "border-mist bg-warm-white text-stone",
  info: "border-sage-glow bg-sage-mist text-sage-deep",
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
        "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </span>
  );
}
