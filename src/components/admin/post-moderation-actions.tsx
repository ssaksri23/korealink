"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PostModerationActions({
  postId,
  status,
}: {
  postId: string;
  status: string;
}) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "pending_review" && status !== "hidden") {
    return null;
  }

  async function approve() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/posts/${postId}/approve`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "처리 실패");
      return;
    }
    router.refresh();
  }

  async function reject() {
    if (reason.trim().length < 2) {
      setError("반려 사유를 입력해주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/posts/${postId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "처리 실패");
      return;
    }
    router.refresh();
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0">
      <div className="mx-auto max-w-6xl">
        {showReject && (
          <div className="mb-2 flex flex-col gap-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="반려 사유를 입력하세요"
              className="min-h-20"
            />
          </div>
        )}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          {!showReject ? (
            <>
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => setShowReject(true)}>
                반려
              </Button>
              <Button className="flex-1" disabled={busy} onClick={approve}>
                승인
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowReject(false)}>
                취소
              </Button>
              <Button variant="destructive" className="flex-1" disabled={busy} onClick={reject}>
                반려 확정
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
