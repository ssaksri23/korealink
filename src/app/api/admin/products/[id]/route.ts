import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({
  price: z.coerce.number().int().nonnegative().optional(),
  durationDays: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  let admin;
  try {
    admin = await requireRole("admin", "super_admin");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const update: Record<string, unknown> = { updated_by: admin.id };
  if (parsed.data.price !== undefined) update.price = parsed.data.price;
  if (parsed.data.durationDays !== undefined) update.duration_days = parsed.data.durationDays;
  if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(update as never).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "update_product", "products", id, parsed.data);

  return NextResponse.json({ ok: true });
}
