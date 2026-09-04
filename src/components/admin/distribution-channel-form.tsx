"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LanguageRow } from "@/lib/languages";

export function DistributionChannelForm({ languages }: { languages: LanguageRow[] }) {
  const router = useRouter();
  const [languageCode, setLanguageCode] = useState(languages[0]?.code ?? "ko");
  const [channelName, setChannelName] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!channelName.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/distribution/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageCode, channelName, telegramChatId, telegramUsername }),
    });
    setBusy(false);
    if (res.ok) {
      setChannelName("");
      setTelegramChatId("");
      setTelegramUsername("");
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
        <label className="mb-1 block text-xs text-slate-500">채널명</label>
        <Input
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="예: KoreaLink 베트남어"
          className="w-44"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">텔레그램 Chat ID (선택)</label>
        <Input
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          placeholder="-100..."
          className="w-40"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">공개 채널 아이디(@ 제외, 선택)</label>
        <Input
          value={telegramUsername}
          onChange={(e) => setTelegramUsername(e.target.value)}
          placeholder="korealink_xx"
          className="w-36"
        />
      </div>
      <Button size="sm" disabled={busy} onClick={submit}>
        채널 추가
      </Button>
    </div>
  );
}
