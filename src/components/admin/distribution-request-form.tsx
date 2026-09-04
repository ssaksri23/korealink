"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function DistributionRequestForm({
  posts,
}: {
  posts: { id: string; title: string | null }[];
}) {
  const router = useRouter();
  const [postId, setPostId] = useState(posts[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (!postId) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/distribution/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMessage(res.ok ? `${data.queued}개 채널에 큐 등록됨` : (data.error ?? "요청 실패"));
    router.refresh();
  }

  if (posts.length === 0) {
    return <p className="text-sm text-slate-500">배포 요청할 게시된 게시글이 없습니다.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <select
        className="h-9 min-w-64 rounded-lg border border-slate-300 px-2 text-sm"
        value={postId}
        onChange={(e) => setPostId(e.target.value)}
      >
        {posts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title ?? "(제목 없음)"}
          </option>
        ))}
      </select>
      <Button size="sm" disabled={busy} onClick={submit}>
        배포 요청
      </Button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}
