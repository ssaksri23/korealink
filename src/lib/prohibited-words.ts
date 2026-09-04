import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProhibitedWordRow {
  id: string;
  languageCode: string;
  word: string;
  severity: "warn" | "block";
}

export async function listProhibitedWords(): Promise<ProhibitedWordRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prohibited_words")
    .select("id, language_code, word, severity")
    .order("language_code", { ascending: true });

  if (error || !data) return [];
  return data.map((w) => ({
    id: w.id,
    languageCode: w.language_code,
    word: w.word,
    severity: w.severity as "warn" | "block",
  }));
}

/**
 * 게시글 제목/본문을 금칙어 목록과 대조한다. 언어를 가리지 않고 전체 목록과
 * 대소문자 무시 부분일치로 검사한다(작성 언어와 실제 입력 언어가 다를 수 있음).
 * prohibited_words 테이블 자체는 관리자/언어운영자만 조회 가능하므로, 일반
 * 회원 세션에서도 결과만 받을 수 있도록 SECURITY DEFINER RPC(check_prohibited_content)를
 * 사용한다. 정교한 형태소 분석이 아니라 1차 방어선이며, 최종 판단은 관리자 검수가 담당한다.
 */
export async function findProhibitedWords(
  text: string,
): Promise<{ blocked: string[]; warned: string[] }> {
  if (!text.trim()) return { blocked: [], warned: [] };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_prohibited_content", { content: text });
  if (error || !data) return { blocked: [], warned: [] };

  const blocked: string[] = [];
  const warned: string[] = [];
  for (const row of data) {
    (row.severity === "block" ? blocked : warned).push(row.word);
  }
  return { blocked, warned };
}
