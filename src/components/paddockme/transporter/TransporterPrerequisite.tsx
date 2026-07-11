import { CircleAlert, MoveRight } from "lucide-react";
import { PmButton } from "@/components/paddockme/PmButton";

export function TransporterPrerequisite({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-pm-border bg-white p-6 text-center shadow-sm sm:p-8">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pm-cream-100 text-pm-green-900">
        <CircleAlert className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-extrabold text-pm-charcoal">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-pm-muted">{body}</p>
      <PmButton href={href} className="mt-6 w-full sm:w-auto">
        {action}
        <MoveRight className="h-4 w-4" aria-hidden />
      </PmButton>
    </section>
  );
}
