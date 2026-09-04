import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

export async function DELETE(
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

  // 상품이 게시글에 준 효과를 되돌린다(환불 처리와 동일한 원복 로직).
  if (order.post_id && product?.code === "urgent_badge") {
    await supabase.from("posts").update({ is_urgent: false }).eq("id", order.post_id);
  } else if (order.post_id && product?.code === "top_pin") {
    await supabase
      .from("posts")
      .update({ is_pinned: false, is_featured: false })
      .eq("id", order.post_id);
  }

  // payments.order_id는 on delete cascade이므로 결제 기록도 함께 삭제된다.
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "delete_order", "orders", id, { productCode: product?.code });

  return NextResponse.json({ ok: true });
}
