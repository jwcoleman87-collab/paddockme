import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description: _description,
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
        "mb-6 flex min-w-0 flex-col gap-4 overflow-hidden border-b border-sage-deep/10 pb-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0 max-w-[21.5rem] sm:max-w-3xl">
        {eyebrow && (
          <p className="mb-3 inline-flex rounded-md border border-sage-deep/10 bg-sage-mist px-3 py-1 text-xs font-bold text-sage-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-full break-words text-2xl font-extrabold leading-tight text-bark sm:max-w-2xl md:text-3xl">
          {title}
        </h1>
      </div>
      {action && <div className="max-w-full shrink-0">{action}</div>}
    </header>
  );
}
