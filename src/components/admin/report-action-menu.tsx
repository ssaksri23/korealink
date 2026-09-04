"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ACTIONS: [string, string][] = [
  ["no_issue", "문제없음"],
  ["edit_requested", "수정 요청"],
  ["hidden", "임시 숨김"],
  ["deleted", "게시글 삭제"],
  ["user_warned", "사용자 경고"],
  ["user_suspended", "사용자 정지"],
  ["company_verification_revoked", "업체 인증 취소"],
];

export function ReportActionMenu({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [action, setAction] = useState(ACTIONS[0][0]);
  const [busy, setBusy] = useState(false);

  async function apply() {
    setBusy(true);
    await fetch(`/api/admin/reports/${reportId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-2 flex gap-2">
      <Select value={action} onChange={(e) => setAction(e.target.value)} className="h-9 flex-1 text-sm">
        {ACTIONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <Button size="sm" disabled={busy} onClick={apply}>
        처리
      </Button>
    </div>
  );
}
