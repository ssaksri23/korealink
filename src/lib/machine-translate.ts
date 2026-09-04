import "server-only";

const MAX_CHUNK = 450;

function chunkText(text: string, maxLen = MAX_CHUNK): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let rest = trimmed;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf("\n", maxLen);
    if (cut < maxLen * 0.4) cut = rest.lastIndexOf(". ", maxLen);
    if (cut < maxLen * 0.4) cut = rest.lastIndexOf(" ", maxLen);
    if (cut <= 0) cut = maxLen;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function translateChunk(
  text: string,
  source: string,
  target: string,
): Promise<string | null> {
  if (!text.trim()) return "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || typeof translated !== "string") return null;
    if (data?.responseStatus && data.responseStatus !== 200) return null;
    return translated;
  } catch {
    return null;
  }
}

/**
 * 무료(비로그인) MyMemory API를 사용한 초벌 기계번역. 유료 API가 아니며 별도
 * 가입/과금 없이 사용 가능하다. 품질을 보증하지 않으므로 결과는 항상
 * translation_status = 'translated'로만 저장되고, 최종 검수는 관리자
 * 번역검수 화면(/admin/translations)에서 이루어진다. 일부 언어쌍은 지원이
 * 약해 실패할 수 있으며, 이 경우 null을 반환해 호출부가 'pending' 상태로
 * 남겨두고 관리자가 직접 입력하도록 한다.
 */
export async function machineTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string | null> {
  const chunks = chunkText(text);
  const results: string[] = [];
  for (const chunk of chunks) {
    const translated = await translateChunk(chunk, sourceLang, targetLang);
    if (translated === null) return null;
    results.push(translated);
  }
  return results.join(" ").trim() || null;
}
