import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-mist bg-cream p-5 shadow-sm shadow-bark/5",
        className
      )}
    >
      {children}
    </section>
  );
}
