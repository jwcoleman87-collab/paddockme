import { NextResponse } from "next/server";
import {
  createServiceClient,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

type RequestBody = {
  transportJobId?: string;
  action?: "ensure" | "mark_settled";
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.transportJobId || !isUuid(body.transportJobId)) {
    return NextResponse.json({ error: "transportJobId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json(
      { error: "Settlement recording is not configured on this environment" },
      { status: 503 }
    );
  }

  const service = createServiceClient();
  const { data: job, error: jobError } = await service
    .from("transport_jobs")
    .select("id, agreement_id, status, livestock_owner_id, landowner_id")
    .eq("id", body.transportJobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Transport job not found" }, { status: 404 });
  }

  const isFarmer =
    job.livestock_owner_id === user.id || job.landowner_id === user.id;
  if (!isFarmer) {
    return NextResponse.json({ error: "Only agreement parties can manage settlement" }, { status: 403 });
  }

  if (job.status !== "completed") {
    return NextResponse.json(
      { error: "Settlement opens once transport is completed" },
      { status: 409 }
    );
  }

  const { data: agreement, error: agreementError } = await service
    .from("agreements")
    .select("id, livestock_owner_id, landowner_id, head_count, duration_months, rate_per_head_week")
    .eq("id", job.agreement_id)
    .single();

  if (agreementError || !agreement) {
    return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  }

  const amountCents = calculateAgistmentAmountCents(agreement);
  const description =
    amountCents > 0
      ? `Agistment settlement for ${agreement.head_count ?? "stock"} head at $${agreement.rate_per_head_week}/head/week.`
      : "Agistment settlement recorded from the agreement rate terms. Amount needs confirmation.";

  const { data: existing } = await service
    .from("payables")
    .select("*")
    .eq("agreement_id", agreement.id)
    .eq("kind", "agistment")
    .maybeSingle();

  const nextStatus =
    body.action === "mark_settled" ? "payment_recorded" : "awaiting_payment";

  const payablePayload = {
    agreement_id: agreement.id,
    transport_job_id: job.id,
    payer_profile_id: agreement.livestock_owner_id,
    payee_profile_id: agreement.landowner_id,
    kind: "agistment",
    status: existing?.status === "payment_recorded" ? "payment_recorded" : nextStatus,
    amount_cents: amountCents,
    currency: "AUD",
    description,
    provider: "direct",
    metadata: {
      stripe_connect_status: "not_configured",
      settlement_mode: "direct_until_online_payments_launch",
    },
  };

  const { data: payable, error: payableError } = existing?.id
    ? await service
        .from("payables")
        .update(payablePayload)
        .eq("id", existing.id)
        .select("*")
        .single()
    : await service
        .from("payables")
        .insert(payablePayload)
        .select("*")
        .single();

  if (payableError || !payable) {
    return NextResponse.json(
      { error: payableError?.message ?? "Could not record settlement" },
      { status: 500 }
    );
  }

  if (!existing || existing.status !== payable.status) {
    await service.from("payment_events").insert({
      payable_id: payable.id,
      event_type:
        payable.status === "payment_recorded"
          ? "direct_settlement_marked"
          : "direct_settlement_opened",
      from_status: existing?.status ?? null,
      to_status: payable.status,
      actor_profile_id: user.id,
      provider: "direct",
      metadata: {
        transport_job_id: job.id,
        stripe_connect_status: "not_configured",
      },
    });
  }

  return NextResponse.json({ payable });
}

function calculateAgistmentAmountCents(agreement: {
  head_count: number | null;
  duration_months: number | null;
  rate_per_head_week: number | null;
}) {
  if (!agreement.head_count || !agreement.duration_months || !agreement.rate_per_head_week) {
    return 0;
  }
  const weeks = agreement.duration_months * 4.345;
  return Math.round(agreement.head_count * agreement.rate_per_head_week * weeks * 100);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
