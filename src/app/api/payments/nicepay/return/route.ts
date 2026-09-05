import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveNicepayPayment } from "@/lib/nicepay";
import { queueDistributionForPost } from "@/lib/distribution";
import { getAppUrl } from "@/lib/app-url";

// 나이스페이 결제창은 인증이 끝나면 사용자 브라우저가 이 주소로 폼 POST를 보낸다.
export async function POST(request: Request) {
  const appUrl = await getAppUrl();
  const formData = await request.formData().catch(() => null);

  function redirectTo(orderId: string | null, status: "paid" | "failed") {
    const path = orderId ? `/ko/orders/${orderId}?payment=${status}` : `/ko/orders?payment=${status}`;
    return NextResponse.redirect(`${appUrl}${path}`, { status: 303 });
  }

  if (!formData) {
    return redirectTo(null, "failed");
  }

  const authResultCode = String(formData.get("authResultCode") ?? "");
  const rawOrderId = String(formData.get("orderId") ?? "");
  const tid = String(formData.get("tid") ?? "");
  // 결제 시도마다 유니크한 orderId가 필요해 "{주문UUID}-{타임스탬프}" 형태로 보냈으므로
  // 앞 36자(UUID 길이)만 잘라 실제 주문 id를 복원한다.
  const orderId = rawOrderId.slice(0, 36);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirectTo(orderId || null, "failed");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_price, post_id, profile_id, products(code, duration_days)")
    .eq("id", orderId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!order) {
    return redirectTo(null, "failed");
  }

  if (authResultCode !== "0000" || !tid) {
    return redirectTo(order.id, "failed");
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("order_id", order.id)
    .maybeSingle();

  // 이미 처리된 결제면(새로고침/중복 콜백) 다시 처리하지 않고 성공 화면으로만 보낸다.
  if (payment?.status === "confirmed") {
    return redirectTo(order.id, "paid");
  }
  if (!payment || payment.status !== "waiting") {
    return redirectTo(order.id, "failed");
  }

  const approval = await approveNicepayPayment(tid, order.total_price);
  if (!approval.ok || approval.approvedAmount !== order.total_price) {
    return redirectTo(order.id, "failed");
  }

  // 여기부터는 나이스페이가 실제로 승인한, 검증된 결제이므로 서비스 롤로 확정 처리한다.
  // (payments/orders의 소유자 UPDATE 정책은 대상 상태를 제한하지 않아, 카드결제
  // 자동승인처럼 신뢰할 수 있는 검증을 거친 흐름은 이렇게 서버가 직접 확정한다.)
  const admin = createAdminClient();
  const now = new Date();
  const product = Array.isArray(order.products) ? order.products[0] : order.products;
  const endsAt = product?.duration_days
    ? new Date(now.getTime() + product.duration_days * 86400000)
    : null;

  await admin
    .from("payments")
    .update({
      status: "confirmed",
      provider: "pg",
      external_transaction_id: tid,
      confirmed_by: user.id,
      confirmed_at: now.toISOString(),
    })
    .eq("order_id", order.id);

  await admin
    .from("orders")
    .update({
      status: "active",
      starts_at: now.toISOString(),
      ends_at: endsAt?.toISOString() ?? null,
    })
    .eq("id", order.id);

  if (order.post_id && product?.code === "urgent_badge") {
    await admin.from("posts").update({ is_urgent: true }).eq("id", order.post_id);
  } else if (order.post_id && product?.code === "top_pin") {
    await admin.from("posts").update({ is_pinned: true, is_featured: true }).eq("id", order.post_id);
  } else if (order.post_id && product?.code === "telegram_distribution") {
    await queueDistributionForPost(order.post_id, user.id, admin);
  }

  await admin.from("admin_logs").insert({
    actor_id: user.id,
    action: "pg_confirm_payment",
    target_table: "orders",
    target_id: order.id,
    detail: { productCode: product?.code, tid } as never,
  });

  return redirectTo(order.id, "paid");
}
