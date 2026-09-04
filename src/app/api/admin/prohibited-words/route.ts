import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({
  languageCode: z.string().min(2).max(10),
  word: z.string().min(1).max(100),
  severity: z.enum(["warn", "block"]),
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
    .from("prohibited_words")
    .insert({
      language_code: parsed.data.languageCode,
      word: parsed.data.word.trim(),
      severity: parsed.data.severity,
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "failed" }, { status: 500 });
  }

  await logAdminAction(admin.id, "add_prohibited_word", "prohibited_words", data.id, parsed.data);

  return NextResponse.json({ id: data.id });
}
