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
        "rounded-[8px] border border-sage-deep/10 bg-warm-white p-5 shadow-[0_14px_36px_rgba(31,42,36,0.06)] transition-all duration-200 ease-in-out",
        className
      )}
    >
      {children}
    </section>
  );
}
