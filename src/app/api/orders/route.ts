import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  productId: z.string().uuid(),
  postId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
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

  const { data: product } = await supabase
    .from("products")
    .select("id, price, duration_days, is_active")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (!product || !product.is_active) {
    return NextResponse.json({ error: "product not found" }, { status: 404 });
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

  return NextResponse.json({ id: order.id });
}
