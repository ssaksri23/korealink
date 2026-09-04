import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupportedLocale } from "@/config/languages";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_COOKIE = "korealink_locale";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response: supabaseResponse, user, preferredLanguage } =
    await updateSession(request);

  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE);

  const localeMatch = pathname.match(/^\/([a-zA-Z-]+)(\/.*)?$/);
  const pathLocale = localeMatch?.[1];
  const pathHasValidLocale = pathLocale ? isSupportedLocale(pathLocale) : false;
  const isSelectLanguagePath =
    pathHasValidLocale && (localeMatch?.[2] ?? "").startsWith("/select-language");

  // 1) 언어 선택 이력이 없는 비회원의 최초 접속 → 전체화면 언어 선택으로 유도
  if (!hasLocaleCookie && !user && !isSelectLanguagePath) {
    const targetLocale = pathHasValidLocale ? pathLocale! : routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${targetLocale}/select-language`;
    return NextResponse.redirect(url);
  }

  // 2) 언어 선택 이력이 없는 새 브라우저에서 로그인한 회원 → 저장된 preferred_language 우선 적용
  if (
    !hasLocaleCookie &&
    user &&
    preferredLanguage &&
    isSupportedLocale(preferredLanguage) &&
    !isSelectLanguagePath &&
    pathLocale !== preferredLanguage
  ) {
    const url = request.nextUrl.clone();
    const rest = pathHasValidLocale ? localeMatch?.[2] ?? "" : pathname;
    url.pathname = `/${preferredLanguage}${rest}`;
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set(LOCALE_COOKIE, preferredLanguage, { path: "/" });
    return redirectResponse;
  }

  // 3) next-intl 라우팅 처리 (로케일 prefix, 협상 등)
  const intlResponse = intlMiddleware(request);

  // Supabase가 세션 쿠키를 새로 발급했다면 next-intl 응답에도 실어 보낸다.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
