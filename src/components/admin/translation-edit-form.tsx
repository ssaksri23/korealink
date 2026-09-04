"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TranslationEditForm({
  postId,
  languageCode,
  initialTitle,
  initialContent,
  status,
}: {
  postId: string;
  languageCode: string;
  initialTitle: string;
  initialContent: string;
  status: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: "save" | "reviewed" | "failed") {
    if (!title.trim() || !content.trim()) {
      setError("제목과 본문을 입력해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/translations/${postId}/${languageCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, action }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "저장 실패");
      return;
    }
    router.push("/admin/translations");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
      <Badge variant="outline" className="w-fit">
        상태: {status}
      </Badge>
      <div className="flex flex-col gap-1.5">
        <Label>제목</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>본문</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-40"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => submit("save")}>
          임시저장
        </Button>
        <Button variant="destructive" disabled={busy} onClick={() => submit("failed")}>
          번역 실패
        </Button>
        <Button className="flex-1" disabled={busy} onClick={() => submit("reviewed")}>
          검수 완료
        </Button>
      </div>
    </div>
  );
}
