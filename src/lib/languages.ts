import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_LANGUAGES, type LanguageDefinition } from "@/config/languages";

export interface LanguageRow extends LanguageDefinition {
  isActive: boolean;
  telegramChannelId: string | null;
}

/**
 * languages 테이블에서 활성화된 언어 목록을 display_order 순으로 가져온다.
 * Supabase 환경변수가 없거나 조회가 실패하면(초기 세팅 전 등) config/languages.ts 를
 * fallback으로 사용해 화면이 죽지 않도록 한다. 이렇게 하면 어떤 화면도 언어 목록을
 * 직접 하드코딩하지 않고 이 함수 하나만 호출하면 된다.
 */
export async function getLanguages(): Promise<LanguageRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fallbackLanguages();
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("languages")
      .select(
        "code, name_native, name_korean, flag_emoji, display_order, translation_enabled, is_active, telegram_channel_id",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackLanguages();
    }

    return data.map((row) => ({
      code: row.code as LanguageDefinition["code"],
      nameNative: row.name_native,
      nameKorean: row.name_korean,
      flagEmoji: row.flag_emoji,
      displayOrder: row.display_order,
      translationEnabled: row.translation_enabled,
      isActive: row.is_active,
      telegramChannelId: row.telegram_channel_id,
    }));
  } catch {
    return fallbackLanguages();
  }
}

function fallbackLanguages(): LanguageRow[] {
  return SUPPORTED_LANGUAGES.map((l) => ({
    ...l,
    isActive: true,
    telegramChannelId: null,
  }));
}
