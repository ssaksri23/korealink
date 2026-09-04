import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({
  languageCode: z.string().min(2).max(10),
  channelName: z.string().min(1).max(100),
  telegramChatId: z.string().max(100).optional(),
});

export async function POST(request: Request) {
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("distribution_channels")
    .insert({
      language_code: parsed.data.languageCode,
      channel_name: parsed.data.channelName,
      telegram_chat_id: parsed.data.telegramChatId || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed" }, { status: 500 });
  }

  await logAdminAction(admin.id, "create_distribution_channel", "distribution_channels", data.id);

  return NextResponse.json({ id: data.id });
}
