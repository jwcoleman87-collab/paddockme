import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-7 flex min-w-0 flex-col gap-4 overflow-hidden md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <p className="mb-3 inline-flex rounded-full bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-2xl break-words text-3xl font-extrabold leading-tight text-sage-deep md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl break-words text-base leading-relaxed text-bark/75">
            {description}
          </p>
        )}
      </div>
      {action && <div className="max-w-full shrink-0">{action}</div>}
    </header>
  );
}
