/**
 * 지원 언어 단일 소스(Single Source of Truth).
 * - 이 배열은 Supabase `languages` 테이블 시드 데이터와 1:1로 대응한다.
 * - 화면(언어 선택, 번역언어 선택, 관리자 언어관리 등)은 이 파일을 직접 하드코딩하지 않고
 *   `getLanguages()` (DB 우선, 실패 시 이 배열로 fallback)를 통해 값을 가져온다.
 * - 순서를 바꾸면 DB의 display_order도 함께 바꿔야 한다 (마이그레이션 시드 참고).
 */
export type LanguageCode =
  | "ru"
  | "vi"
  | "th"
  | "km"
  | "uz"
  | "mn"
  | "zh-CN"
  | "en"
  | "ko";

export interface LanguageDefinition {
  code: LanguageCode;
  nameNative: string;
  nameKorean: string;
  flagEmoji: string;
  displayOrder: number;
  translationEnabled: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: "ru", nameNative: "Русский", nameKorean: "러시아어", flagEmoji: "🇷🇺", displayOrder: 1, translationEnabled: true },
  { code: "vi", nameNative: "Tiếng Việt", nameKorean: "베트남어", flagEmoji: "🇻🇳", displayOrder: 2, translationEnabled: true },
  { code: "th", nameNative: "ภาษาไทย", nameKorean: "태국어", flagEmoji: "🇹🇭", displayOrder: 3, translationEnabled: true },
  { code: "km", nameNative: "ភាសាខ្មែរ", nameKorean: "크메르어", flagEmoji: "🇰🇭", displayOrder: 4, translationEnabled: true },
  { code: "uz", nameNative: "Oʻzbekcha", nameKorean: "우즈베크어", flagEmoji: "🇺🇿", displayOrder: 5, translationEnabled: true },
  { code: "mn", nameNative: "Монгол", nameKorean: "몽골어", flagEmoji: "🇲🇳", displayOrder: 6, translationEnabled: true },
  { code: "zh-CN", nameNative: "中文", nameKorean: "중국어 간체", flagEmoji: "🇨🇳", displayOrder: 7, translationEnabled: true },
  { code: "en", nameNative: "English", nameKorean: "영어", flagEmoji: "🇬🇧", displayOrder: 8, translationEnabled: true },
  { code: "ko", nameNative: "한국어", nameKorean: "한국어", flagEmoji: "🇰🇷", displayOrder: 9, translationEnabled: false },
];

export const LOCALE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as LanguageCode[];

export const DEFAULT_LOCALE: LanguageCode =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as LanguageCode) || "ko";

export function isSupportedLocale(value: string): value is LanguageCode {
  return LOCALE_CODES.includes(value as LanguageCode);
}

export function getLanguageDefinition(code: string): LanguageDefinition | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}
