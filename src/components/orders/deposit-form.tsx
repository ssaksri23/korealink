"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DepositForm({
  orderId,
  initialName,
}: {
  orderId: string;
  initialName: string;
}) {
  const router = useRouter();
  const [depositorName, setDepositorName] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!depositorName.trim()) {
      setError("입금자명을 입력해주세요.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/confirm-deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositorName }),
    });
    setPending(false);
    if (!res.ok) {
      setError("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
        입금자명이 접수되었습니다. 관리자 확인 후 상품이 적용됩니다.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">입금자명 입력</p>
      <p className="mb-3 text-xs text-slate-500">
        입금하신 분의 실제 성함을 입력해주세요. 관리자가 확인 후 상품을 적용합니다.
      </p>
      <Input
        value={depositorName}
        onChange={(e) => setDepositorName(e.target.value)}
        placeholder="예: 홍길동"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <Button className="mt-3 w-full" disabled={pending} onClick={submit}>
        {pending ? "처리 중..." : "입금 확인 요청"}
      </Button>
    </div>
  );
}
