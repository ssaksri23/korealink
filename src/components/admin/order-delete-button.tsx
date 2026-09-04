"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function OrderDeleteButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm("이 주문을 삭제하시겠습니까? 결제 기록도 함께 삭제되며 되돌릴 수 없습니다.")) return;
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" className="text-red-600" disabled={busy} onClick={remove}>
      <Trash2 className="size-3.5" />
      삭제
    </Button>
  );
}
