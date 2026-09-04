import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * 서비스 롤 키를 사용하는 관리자 전용 클라이언트.
 * - "server-only"로 브라우저 번들에 절대 포함되지 않도록 강제한다.
 * - 관리자 승인/신고 처리/입금확인 등 RLS를 우회해야 하는 서버 액션에서만 사용한다.
 * - 모든 호출부는 사용 전에 반드시 requireRole()로 실제 관리자 권한을 재검증해야 한다.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. 관리자 기능을 사용하려면 서버 환경변수를 설정하세요.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
