import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLanguages } from "@/lib/languages";
import { getCurrentUser } from "@/lib/auth/roles";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";

export async function AppHeader() {
  const locale = await getLocale();
  const [t, tAuth, languages, user] = await Promise.all([
    getTranslations("common"),
    getTranslations("auth"),
    getLanguages(),
    getCurrentUser(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="shrink-0 truncate text-base font-extrabold tracking-tight text-[#0B2447] sm:text-lg"
        >
          {t("appName")}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-x-auto [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
          <LanguageSwitcher languages={languages} currentLocale={locale} />
          {user ? (
            <Link
              href="/me"
              className="shrink-0 truncate rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {user.displayName ?? t("appName")}
            </Link>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{tAuth("login")}</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/signup">{tAuth("signup")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
