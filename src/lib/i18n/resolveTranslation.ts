export interface TranslatableTranslation {
  languageCode: string;
  title: string | null;
  content: string | null;
  status: "pending" | "translating" | "translated" | "review_required" | "reviewed" | "failed" | "re_review_required";
}

export interface ResolvedTranslation {
  title: string | null;
  content: string | null;
  isFallback: boolean;
  isOriginal: boolean;
  isPending: boolean;
  usedLanguageCode: string | null;
}

/**
 * 번역문 표시 우선순위:
 * 1) 사용자가 선택한 언어의 승인된 번역(translated/reviewed)
 * 2) 한국어 원문
 * 3) 최초 등록 원문(original_language_code)
 * 4) 없으면 "번역 준비 중"
 */
export function resolveTranslation(
  translations: TranslatableTranslation[],
  locale: string,
  originalLanguageCode: string,
): ResolvedTranslation {
  const isUsable = (t?: TranslatableTranslation) =>
    !!t && (t.status === "translated" || t.status === "reviewed") && !!t.title;

  const preferred = translations.find((t) => t.languageCode === locale);
  if (isUsable(preferred)) {
    return {
      title: preferred!.title,
      content: preferred!.content,
      isFallback: false,
      isOriginal: locale === originalLanguageCode,
      isPending: false,
      usedLanguageCode: locale,
    };
  }

  const korean = translations.find((t) => t.languageCode === "ko");
  if (isUsable(korean) || (originalLanguageCode === "ko" && korean)) {
    return {
      title: korean!.title,
      content: korean!.content,
      isFallback: true,
      isOriginal: originalLanguageCode === "ko",
      isPending: false,
      usedLanguageCode: "ko",
    };
  }

  const original = translations.find(
    (t) => t.languageCode === originalLanguageCode,
  );
  if (original?.title) {
    return {
      title: original.title,
      content: original.content,
      isFallback: true,
      isOriginal: true,
      isPending: false,
      usedLanguageCode: originalLanguageCode,
    };
  }

  return {
    title: null,
    content: null,
    isFallback: false,
    isOriginal: false,
    isPending: true,
    usedLanguageCode: null,
  };
}
