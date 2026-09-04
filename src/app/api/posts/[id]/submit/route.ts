import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_CODES } from "@/config/languages";

const bodySchema = z.object({
  mode: z.enum(["original_only", "selected", "all"]),
  languageCodes: z.array(z.string()).default([]),
});

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

  // RLS로 소유권 확인(본인 게시글이 아니면 0건 반환)
  const { data: post } = await supabase
    .from("posts")
    .select("id, original_language_code")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: translation } = await supabase
    .from("post_translations")
    .select("translated_title, translated_content")
    .eq("post_id", id)
    .eq("language_code", post.original_language_code)
    .maybeSingle();

  if (!translation?.translated_title || !translation?.translated_content) {
    return NextResponse.json(
      { error: "title and content are required before submitting" },
      { status: 400 },
    );
  }

  let targetLanguages: string[] = [];
  if (parsed.data.mode === "selected") {
    targetLanguages = parsed.data.languageCodes.filter(
      (code) => code !== post.original_language_code,
    );
  } else if (parsed.data.mode === "all") {
    targetLanguages = LOCALE_CODES.filter((code) => code !== post.original_language_code);
  }

  if (targetLanguages.length > 0) {
    // RLS가 "제목/본문이 비어 있는 행"에 한해 소유자의 직접 삽입을 허용하므로,
    // 서비스 롤 없이도 "번역 대기" 빈 행을 안전하게 만들 수 있다.
    const { error } = await supabase.from("post_translations").upsert(
      targetLanguages.map((code) => ({
        post_id: id,
        language_code: code,
        translation_status: "pending" as const,
      })),
      { onConflict: "post_id,language_code", ignoreDuplicates: true },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { error: statusError } = await supabase
    .from("posts")
    .update({ status: "pending_review" })
    .eq("id", id);

  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
