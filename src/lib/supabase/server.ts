import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

/**
 * 서버 컴포넌트/서버 액션/라우트 핸들러 전용 Supabase 클라이언트.
 * anon key + 사용자 세션 쿠키를 사용하므로 RLS가 그대로 적용된다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출되면 세션 갱신은 미들웨어가 담당하므로 무시해도 안전함.
          }
        },
      },
    },
  );
}
