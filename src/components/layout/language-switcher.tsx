"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { LanguageRow } from "@/lib/languages";

export function LanguageSwitcher({
  languages,
  currentLocale,
}: {
  languages: LanguageRow[];
  currentLocale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: string) {
    startTransition(() => {
      // pathname/search 쿼리를 유지한 채 로케일만 교체한다.
      router.replace(
        { pathname, query: Object.fromEntries(searchParams.entries()) },
        { locale: nextLocale },
      );
    });

    // 로그인 사용자는 profiles.preferred_language 에도 반영(비로그인 시 서버에서 무시됨).
    fetch("/api/preferences/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => {});
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Language</span>
      <select
        aria-label="Change language"
        value={currentLocale}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-6 text-sm font-medium text-slate-700"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flagEmoji} {lang.nameNative}
          </option>
        ))}
      </select>
    </label>
  );
}
