import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_CODES } from "@/config/languages";
import { findProhibitedWords } from "@/lib/prohibited-words";
import { notifyAdmin } from "@/lib/telegram";
import { getAppUrl } from "@/lib/app-url";
import { machineTranslate } from "@/lib/machine-translate";

// 여러 언어를 한 번에 기계번역하면 외부 API 왕복 시간이 누적될 수 있어 기본 10초
// 제한보다 여유를 둔다.
export const maxDuration = 30;

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
    .select("id, original_language_code, categories(name_ko)")
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

  // 마약·성매매·도박 등 명백한 금칙어는 관리자 검수 큐에 들어가기 전에 1차로 차단한다.
  // 최종 판단은 여전히 관리자 검수가 담당하며, 이 검사는 1차 방어선일 뿐이다.
  const { blocked } = await findProhibitedWords(
    `${translation.translated_title} ${translation.translated_content}`,
  );
  if (blocked.length > 0) {
    return NextResponse.json(
      {
        error: "prohibited_content",
        message:
          "게시글에 금지된 단어가 포함되어 있어 제출할 수 없습니다. 내용을 수정한 후 다시 시도해주세요.",
      },
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
    // RLS(post_translations_insert)는 소유자에게 원문 언어 행만 허용하므로, 다른
    // 언어의 "번역 대기" 빈 행은 SECURITY DEFINER 함수를 통해서만 만들 수 있다.
    const { error } = await supabase.rpc("queue_post_translations", {
      target_post: id,
      target_langs: targetLanguages,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 무료(비로그인) 기계번역으로 초벌 번역을 채운다. 실패한 언어는 'pending'
    // 상태로 남아 관리자가 번역검수 화면에서 직접 입력할 수 있다.
    await Promise.all(
      targetLanguages.map(async (code) => {
        const [translatedTitle, translatedContent] = await Promise.all([
          machineTranslate(translation.translated_title!, post.original_language_code, code),
          machineTranslate(translation.translated_content!, post.original_language_code, code),
        ]);
        if (!translatedTitle || !translatedContent) return;
        await supabase.rpc("save_machine_translation", {
          target_post: id,
          target_lang: code,
          title: translatedTitle,
          content: translatedContent,
        });
      }),
    );
  }

  const { error: statusError } = await supabase
    .from("posts")
    .update({ status: "pending_review" })
    .eq("id", id);

  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 });
  }

  const category = Array.isArray(post.categories) ? post.categories[0] : post.categories;
  const adminUrl = `${await getAppUrl()}/ko/admin/posts/${id}`;
  await notifyAdmin(
    `🆕 새 게시글 제출됨\n[${category?.name_ko ?? "카테고리"}] ${translation.translated_title}\n\n검수하러 가기: ${adminUrl}`,
  );

  return NextResponse.json({ ok: true });
}
