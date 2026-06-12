import { CheckCircle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export function Timeline({
  items,
}: {
  items: { title: string; detail: string; complete?: boolean }[];
}) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => {
        const Icon = item.complete ? CheckCircle : CircleDot;
        return (
          <li key={item.title} className="flex gap-3">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                item.complete
                  ? "border-match/25 bg-match-light text-match"
                  : "border-stone/35 bg-warm-white text-bark/80"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-bark">{item.title}</p>
              {index < items.length - 1 && (
                <div className="mt-4 h-4 w-px bg-mist" aria-hidden />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
