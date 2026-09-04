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
    .select("id, post_id, products(code)")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const product = Array.isArray(order.products) ? order.products[0] : order.products;
  const now = new Date().toISOString();

  const { error: paymentError } = await supabase
    .from("payments")
    .update({ status: "refunded", confirmed_by: admin.id, confirmed_at: now })
    .eq("order_id", id);
  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update({ status: "refunded", ends_at: now })
    .eq("id", id);
  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // 상품이 게시글에 준 효과를 되돌린다(입금확인 시 적용한 것과 대칭).
  if (order.post_id && product?.code === "urgent_badge") {
    await supabase.from("posts").update({ is_urgent: false }).eq("id", order.post_id);
  } else if (order.post_id && product?.code === "top_pin") {
    await supabase
      .from("posts")
      .update({ is_pinned: false, is_featured: false })
      .eq("id", order.post_id);
  }

  await logAdminAction(admin.id, "refund_order", "orders", id, { productCode: product?.code });

  return NextResponse.json({ ok: true });
}
