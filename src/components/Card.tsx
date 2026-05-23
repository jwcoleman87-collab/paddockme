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
        "rounded-[8px] border border-stone/25 bg-cream p-5 shadow-[0_10px_28px_rgba(63,51,40,0.07)]",
        className
      )}
    >
      {children}
    </section>
  );
}
