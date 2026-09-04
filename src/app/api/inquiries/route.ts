import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";
import { getAppUrl } from "@/lib/app-url";

const bodySchema = z.object({
  postId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  contactPhone: z.string().max(30).optional(),
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

  const { error } = await supabase.from("inquiries").insert({
    post_id: parsed.data.postId,
    profile_id: user.id,
    message: parsed.data.message,
    contact_phone: parsed.data.contactPhone,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const postUrl = `${await getAppUrl()}/ko/post/${parsed.data.postId}`;
  await notifyAdmin(
    `💬 새 문의 등록됨\n${parsed.data.message.slice(0, 200)}\n\n게시글 보기(작성자에게 전달해주세요): ${postUrl}`,
  );

  return NextResponse.json({ ok: true });
}
