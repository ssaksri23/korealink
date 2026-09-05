import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyNicepaySignature, checkNicepayAmount } from "@/lib/nicepay";
import { queueDistributionForPost } from "@/lib/distribution";
import { getAppUrl } from "@/lib/app-url";

// 나이스페이 결제창(Client 승인 모델)은 인증=결제 완료이며, 사용자 브라우저가
// 결제 결과를 이 주소로 폼 POST 한다. 별도 승인 API 호출은 필요 없고, 서명과
// 금액을 검증한 뒤 우리 DB만 확정하면 된다.
export async function POST(request: Request) {
  const appUrl = await getAppUrl();
  const formData = await request.formData().catch(() => null);
  const admin = createAdminClient();

  const rawFields: Record<string, string> = {};
  if (formData) {
    for (const [key, value] of formData.entries()) {
      rawFields[key] = String(value);
    }
  }
  await admin.from("admin_logs").insert({
    action: "nicepay_return_received",
    detail: rawFields as never,
  });

  function redirectTo(orderId: string | null, status: "paid" | "failed") {
    const path = orderId ? `/ko/orders/${orderId}?payment=${status}` : `/ko/orders?payment=${status}`;
    return NextResponse.redirect(`${appUrl}${path}`, { status: 303 });
  }

  if (!formData) {
    return redirectTo(null, "failed");
  }

  const tid = rawFields.tid ?? "";
  const rawOrderId = rawFields.orderId ?? "";
  // 결제 시도마다 유니크한 orderId가 필요해 "{주문UUID}-{타임스탬프}" 형태로 보냈으므로
  // 앞 36자(UUID 길이)만 잘라 실제 주문 id를 복원한다.
  const orderId = rawOrderId.slice(0, 36);
  const callbackAmount = rawFields.amount ?? "";
  const ediDate = rawFields.ediDate ?? "";
  const signature = rawFields.signature ?? "";
  const isPaid =
    (rawFields.authResultCode === "0000" ||
      rawFields.resultCode === "0000" ||
      rawFields.success === "true") &&
    rawFields.status !== "failed";

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

  if (!isPaid || !tid) {
    return redirectTo(order.id, "failed");
  }

  // 콜백 값이 위변조되지 않았는지, 금액이 실제 주문 금액과 일치하는지 검증한다.
  const signatureOk = verifyNicepaySignature(tid, callbackAmount, ediDate, signature);
  const amountOk = Number(callbackAmount) === order.total_price;
  if (!signatureOk || !amountOk) {
    await admin.from("admin_logs").insert({
      action: "nicepay_signature_mismatch",
      target_table: "orders",
      target_id: order.id,
      detail: { tid, signatureOk, amountOk, callbackAmount, expected: order.total_price } as never,
    });
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

  // 서명 검증에 더해, 나이스페이 서버에 금액 위변조 여부를 한 번 더 확인한다(문서상 필수 절차).
  const check = await checkNicepayAmount(tid, order.total_price);
  if (!check.ok) {
    await admin.from("admin_logs").insert({
      action: "nicepay_check_amount_failed",
      target_table: "orders",
      target_id: order.id,
      detail: { error: check.error, tid } as never,
    });
    return redirectTo(order.id, "failed");
  }

  // 여기부터는 서명·금액 검증을 모두 통과한 결제이므로 서비스 롤로 확정 처리한다.
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
