import { ArrowRight, MessageSquare } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title="Conversations needing attention."
        description="A prototype inbox so each persona has a stable place to return when a farmer, landowner, or driver replies."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <MessageCard
          title="Dale and Brett"
          meta="Agreement terms"
          body="Rate and final terms still need attention before the agreement can be locked in."
          href="/workspace/agreement-glenbarra"
          status="1 open section"
        />
        <MessageCard
          title="Farmer A, Farmer B and Wayne"
          meta="Transport room"
          body="North gate is the best entry. Driver-safe logistics only; private agistment terms stay hidden."
          href="/transport/transport-glenbarra"
          status="Transport active"
        />
      </div>
    </>
  );
}

function MessageCard({
  title,
  meta,
  body,
  href,
  status,
}: {
  title: string;
  meta: string;
  body: string;
  href: string;
  status: string;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-bark/85">
            {meta}
          </p>
          <h2 className="mt-1 text-xl font-bold text-sage-deep">{title}</h2>
        </div>
        <MessageSquare className="h-5 w-5 shrink-0 text-sage-deep" aria-hidden />
      </div>
      <p className="text-sm font-medium leading-relaxed text-bark/85">{body}</p>
      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusBadge tone="info">{status}</StatusBadge>
        <ButtonLink href={href} variant="secondary">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </div>
    </Card>
  );
}
