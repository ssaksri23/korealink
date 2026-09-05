import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/lib/supabase/database.types";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string | null;
  preferredLanguage: string | null;
  roles: { code: RoleCode; scopeLanguageCode: string | null }[];
}

/**
 * 현재 로그인한 사용자와 역할 목록을 서버에서 조회한다.
 * 반드시 서버 컴포넌트/서버 액션/라우트 핸들러에서만 사용하고,
 * 이 값을 신뢰해 민감한 작업을 수행하기 전에는 최종적으로 RLS가 다시 검증한다.
 */
/**
 * React cache()로 감싸 같은 요청(페이지 렌더) 안에서 레이아웃/페이지가 각자
 * getCurrentUser()를 호출해도 실제 Supabase 조회(auth.getUser + 2개 쿼리)는
 * 한 번만 실행되도록 중복 호출을 제거한다. 요청마다 새로 캐시되므로 로그인
 * 상태가 오래된 채로 남는 문제는 없다.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, preferred_language")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role_code, scope_language_code")
      .eq("profile_id", user.id),
  ]);

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? null,
    preferredLanguage: profile?.preferred_language ?? null,
    roles: (roleRows ?? []).map((r) => ({
      code: r.role_code as RoleCode,
      scopeLanguageCode: r.scope_language_code,
    })),
  };
});

export function hasRole(
  user: CurrentUser | null,
  ...codes: RoleCode[]
): boolean {
  if (!user) return false;
  return user.roles.some((r) => codes.includes(r.code));
}

export function isAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, "admin", "super_admin");
}

/**
 * 서버 액션/라우트 핸들러 시작 부분에서 호출해 권한이 없으면 즉시 예외를 던진다.
 * 이 검사를 통과해도 데이터 접근은 여전히 Supabase RLS로 한 번 더 걸러진다(2중 방어).
 */
export async function requireRole(...codes: RoleCode[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !hasRole(user, ...codes)) {
    throw new Error("FORBIDDEN: 해당 작업을 수행할 권한이 없습니다.");
  }
  return user;
}
