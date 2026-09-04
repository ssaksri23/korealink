"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AdminOrderRefundAction({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve() {
    if (!window.confirm("환불을 승인하시겠습니까? 상품 효과가 게시글에서 해제됩니다.")) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}/refund`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-3">
      <Button size="sm" variant="outline" disabled={busy} onClick={approve}>
        환불 승인
      </Button>
    </div>
  );
}
