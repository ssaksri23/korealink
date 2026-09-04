import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";
import { getAppUrl } from "@/lib/app-url";

const bodySchema = z.object({ depositorName: z.string().min(1).max(50) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_price, products(name_ko)")
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("payments")
    .update({ depositor_name: parsed.data.depositorName })
    .eq("order_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const product = Array.isArray(order.products) ? order.products[0] : order.products;
  const appUrl = await getAppUrl();
  await notifyAdmin(
    `💰 입금확인 요청\n${product?.name_ko ?? "광고상품"} · ${order.total_price.toLocaleString()}원\n입금자명: ${parsed.data.depositorName}\n\n확인하러 가기: ${appUrl}/ko/admin/orders`,
  );

  return NextResponse.json({ ok: true });
}
