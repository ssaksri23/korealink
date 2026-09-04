import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * 미들웨어에서 Supabase 세션 쿠키를 갱신한다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없으므로, 세션 만료 갱신은 반드시 여기서 처리해야 한다.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Supabase 환경변수가 없어도 사이트 자체는 죽지 않아야 한다.
    return { response, user: null as null, preferredLanguage: null as null };
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let preferredLanguage: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .maybeSingle();
    preferredLanguage = profile?.preferred_language ?? null;
  }

  return { response, user, preferredLanguage };
}
