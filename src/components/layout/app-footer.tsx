import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function AppFooter() {
  const t = await getTranslations("legal");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/terms" className="hover:underline">
            {t("termsTitle")}
          </Link>
          <Link href="/privacy" className="hover:underline">
            {t("privacyTitle")}
          </Link>
          <Link href="/report-policy" className="hover:underline">
            {t("reportPolicyTitle")}
          </Link>
          <Link href="/channels" className="hover:underline">
            {t("telegramChannels")}
          </Link>
        </div>
        <p>
          리치(Rich) · 대표: 나선일 · 사업자등록번호: 110-22-53859 · 통신판매업
          신고번호: 2023-광주서구-0287호
          <br />
          광주광역시 서구 하남대로 680번길 1(동천동) 4층 402호 · {t("contactEmail")}
        </p>
        <p>&copy; 2026 KoreaLink</p>
      </div>
    </footer>
  );
}
