"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { LanguageRow } from "@/lib/languages";
import { cn } from "@/lib/utils";

const LOCALE_COOKIE = "korealink_locale";
const LOCALE_STORAGE_KEY = "korealink_locale";

function persistLocalePreference(code: string) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    // 쿠키/localStorage 접근이 차단된 브라우저에서도 이동 자체는 계속 진행한다.
  }
}

export function LanguageSelectScreen({
  languages,
  nextPath,
}: {
  languages: LanguageRow[];
  nextPath?: string;
}) {
  const router = useRouter();
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  function selectLanguage(code: string) {
    setPendingCode(code);
    persistLocalePreference(code);

    fetch("/api/preferences/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    }).catch(() => {});

    const destination = nextPath && nextPath.startsWith("/") ? nextPath : "/";
    router.push(`/${code}${destination === "/" ? "" : destination}`);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#0B2447] to-[#0d9488] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center text-white">
          <h1 className="text-2xl font-bold sm:text-3xl">
            사용할 언어를 선택하세요
          </h1>
          <p className="mt-1 text-base text-white/90 sm:text-lg">
            Choose your language
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={pendingCode !== null}
              onClick={() => selectLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 border-transparent bg-white px-4 py-4 text-left shadow-sm transition hover:border-teal-500 hover:shadow-md disabled:opacity-60",
                pendingCode === lang.code && "border-teal-500",
              )}
            >
              <span className="text-3xl leading-none">{lang.flagEmoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-slate-900">
                  {lang.nameNative}
                </span>
                <span className="block truncate text-sm text-slate-500">
                  {lang.nameKorean}
                </span>
              </span>
              {pendingCode === lang.code ? (
                <Check className="size-5 shrink-0 text-teal-600" />
              ) : (
                <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  선택
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
