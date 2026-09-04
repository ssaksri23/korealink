"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LanguageRow } from "@/lib/languages";

export function ProhibitedWordForm({ languages }: { languages: LanguageRow[] }) {
  const router = useRouter();
  const [languageCode, setLanguageCode] = useState(languages[0]?.code ?? "ko");
  const [word, setWord] = useState("");
  const [severity, setSeverity] = useState<"warn" | "block">("block");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!word.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/prohibited-words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageCode, word, severity }),
    });
    setBusy(false);
    if (res.ok) {
      setWord("");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-slate-500">언어</label>
        <select
          className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value as typeof languageCode)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flagEmoji} {l.nameNative}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">단어</label>
        <Input value={word} onChange={(e) => setWord(e.target.value)} className="w-48" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">처리방식</label>
        <select
          className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as "warn" | "block")}
        >
          <option value="block">차단(제출 불가)</option>
          <option value="warn">경고만(제출은 가능)</option>
        </select>
      </div>
      <Button size="sm" disabled={busy} onClick={submit}>
        추가
      </Button>
    </div>
  );
}
