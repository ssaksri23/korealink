import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ reason: z.string().max(500).optional() });

/**
 * 입금 확인 전(waiting)이면 실제로 받은 돈이 없으므로 즉시 취소 처리하고,
 * 입금 확인 후(confirmed)면 이미 실제 입금이 반영된 상태이므로 관리자 승인이
 * 필요한 환불 신청(refund_requested)으로 전환한다.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payments(status)")
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
  if (!payment) {
    return NextResponse.json({ error: "payment not found" }, { status: 404 });
  }

  if (payment.status === "waiting") {
    const [{ error: paymentError }, { error: orderError }] = await Promise.all([
      supabase.from("payments").update({ status: "rejected" }).eq("order_id", id),
      supabase.from("orders").update({ status: "cancelled" }).eq("id", id),
    ]);
    if (paymentError || orderError) {
      return NextResponse.json(
        { error: paymentError?.message ?? orderError?.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, result: "cancelled" });
  }

  if (payment.status === "confirmed") {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "refund_requested",
        refund_reason: parsed.data.reason ?? null,
        refund_requested_at: new Date().toISOString(),
      })
      .eq("order_id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, result: "refund_requested" });
  }

  return NextResponse.json({ error: "not cancellable in current state" }, { status: 400 });
}
