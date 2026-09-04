"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CancelRefundButton({
  orderId,
  mode,
}: {
  orderId: string;
  mode: "cancel" | "refund";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (mode === "refund" && !window.confirm("환불을 신청하시겠습니까? 관리자 확인 후 처리됩니다.")) {
      return;
    }
    if (mode === "cancel" && !window.confirm("주문을 취소하시겠습니까?")) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || undefined }),
    });
    setBusy(false);
    if (!res.ok) {
      window.alert("처리에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  if (mode === "cancel") {
    return (
      <Button variant="outline" className="w-full" disabled={busy} onClick={submit}>
        주문 취소
      </Button>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        환불 신청
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">환불 사유</p>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="환불 사유를 입력해주세요 (선택)"
        className="min-h-20"
      />
      <div className="mt-2 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
          취소
        </Button>
        <Button className="flex-1" disabled={busy} onClick={submit}>
          환불 신청하기
        </Button>
      </div>
    </div>
  );
}
