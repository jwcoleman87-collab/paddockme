import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  MessageSquareText,
  MoveRight,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/paddockme/PmCards";

export type TransportJobCardData = {
  id: string;
  livestock: string;
  pickup: string;
  destination: string;
  distanceKm: number;
  preferredDate: string;
  dateFlexibility: string;
  pickupAccess: string;
  quoteCloses: string;
  discussionCount: number;
  featured?: boolean;
};

export function TransportJobCard({
  job,
  href = `/transport/demo/jobs/${job.agreementId ?? "1023"}`,
  status = "Open for quotes",
  actionLabel = "View job details",
  onOpen,
}: {
  job: TransportJobCardData & { agreementId?: string };
  href?: string;
  status?: string;
  actionLabel?: string;
  onOpen?: () => void;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-pm-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wider text-pm-gold-600">
            {job.featured ? "Best match for your route" : "Livestock movement"}
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-pm-charcoal">
            {job.livestock}
          </h2>
        </div>
        <Badge className="border-pm-success/30 bg-pm-success/10 text-pm-success">
          {status}
        </Badge>
      </div>

      <p className="mt-4 flex min-w-0 flex-wrap items-center gap-2 text-base font-bold text-pm-charcoal">
        <span>{job.pickup}</span>
        <MoveRight className="h-4 w-4 shrink-0 text-pm-gold-600" aria-label="to" />
        <span>{job.destination}</span>
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-pm-border py-4 text-sm">
        <Fact icon={Truck} label="Distance" value={`${job.distanceKm} km`} />
        <Fact icon={CalendarDays} label="Preferred pickup" value={job.preferredDate} />
        <Fact icon={Clock3} label="Flexibility" value={job.dateFlexibility} />
        <Fact icon={MapPin} label="Pickup access" value={job.pickupAccess} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-pm-charcoal">{job.quoteCloses}</span>
        <span className="inline-flex items-center gap-1.5 text-pm-muted">
          <MessageSquareText className="h-4 w-4" aria-hidden />
          {job.discussionCount} discussion updates
        </span>
      </div>

      <Link
        href={href}
        onClick={onOpen}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-pm-green-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pm-green-800 focus-visible:ring-2 focus-visible:ring-pm-green-900 focus-visible:ring-offset-2 sm:w-auto sm:self-start"
      >
        {actionLabel}
        <MoveRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-pm-muted">
        <Icon className="h-4 w-4 shrink-0 text-pm-green-900" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold leading-snug text-pm-charcoal">
        {value}
      </dd>
    </div>
  );
}
