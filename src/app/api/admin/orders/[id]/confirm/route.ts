import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let admin;
  try {
    admin = await requireRole("admin", "super_admin");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, post_id, products(code, duration_days)")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const product = Array.isArray(order.products) ? order.products[0] : order.products;
  const now = new Date();
  const endsAt = product?.duration_days
    ? new Date(now.getTime() + product.duration_days * 86400000)
    : null;

  const { error: paymentError } = await supabase
    .from("payments")
    .update({ status: "confirmed", confirmed_by: admin.id, confirmed_at: now.toISOString() })
    .eq("order_id", id);
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({
      status: "active",
      starts_at: now.toISOString(),
      ends_at: endsAt?.toISOString() ?? null,
    })
    .eq("id", id);
  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // 상품 효과 적용: 게시글에 직접 반영되는 상품만 자동 처리(그 외는 관리자가 수동 확인)
  if (order.post_id && product?.code === "urgent_badge") {
    await supabase.from("posts").update({ is_urgent: true }).eq("id", order.post_id);
  } else if (order.post_id && product?.code === "top_pin") {
    await supabase.from("posts").update({ is_pinned: true, is_featured: true }).eq("id", order.post_id);
  }

  await logAdminAction(admin.id, "confirm_deposit", "orders", id, { productCode: product?.code });

  return NextResponse.json({ ok: true });
}
