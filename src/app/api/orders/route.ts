import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";
import { getAppUrl } from "@/lib/app-url";

const bodySchema = z.object({
  productId: z.string().uuid().optional(),
  productIds: z.array(z.string().uuid()).optional(),
  postId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const productIds = parsed.data.productIds ?? (parsed.data.productId ? [parsed.data.productId] : []);
  if (productIds.length === 0) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (parsed.data.postId) {
    const { data: post } = await supabase
      .from("posts")
      .select("id")
      .eq("id", parsed.data.postId)
      .eq("created_by", user.id)
      .maybeSingle();
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name_ko, price, is_active")
    .in("id", productIds);

  const orderIds: string[] = [];
  const orderedProductNames: string[] = [];
  let totalOfAll = 0;
  for (const productId of productIds) {
    const product = products?.find((p) => p.id === productId);
    if (!product || !product.is_active) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    const totalPrice = product.price * parsed.data.quantity;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        post_id: parsed.data.postId ?? null,
        product_id: product.id,
        profile_id: user.id,
        quantity: parsed.data.quantity,
        total_price: totalPrice,
        status: "payment_pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message ?? "order failed" }, { status: 500 });
    }

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      amount: totalPrice,
      status: "waiting",
    });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    orderIds.push(order.id);
    orderedProductNames.push(product.name_ko);
    totalOfAll += totalPrice;
  }

  const appUrl = await getAppUrl();
  await notifyAdmin(
    `🛒 광고상품 신청됨\n${orderedProductNames.join(", ")} · 합계 ${totalOfAll.toLocaleString()}원\n입금자명 제출 및 확인 대기중입니다.\n\n확인하러 가기: ${appUrl}/ko/admin/orders`,
  );

  return NextResponse.json({ id: orderIds[0], ids: orderIds });
}
