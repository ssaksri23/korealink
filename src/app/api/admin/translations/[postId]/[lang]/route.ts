import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  action: z.enum(["save", "reviewed", "failed"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string; lang: string }> },
) {
  const { postId, lang } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  let admin;
  try {
    admin = await requireRole("admin", "super_admin", "language_moderator");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const status =
    parsed.data.action === "reviewed"
      ? "reviewed"
      : parsed.data.action === "failed"
        ? "failed"
        : "translated";

  const supabase = await createClient();
  const { error } = await supabase
    .from("post_translations")
    .update({
      translated_title: parsed.data.title,
      translated_content: parsed.data.content,
      translation_status: status,
      translation_source: "admin_edit",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("post_id", postId)
    .eq("language_code", lang);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "edit_translation", "post_translations", `${postId}:${lang}`, {
    action: parsed.data.action,
  });

  return NextResponse.json({ ok: true });
}
