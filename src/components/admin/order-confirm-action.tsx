"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function AdminOrderConfirmAction({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await fetch(`/api/admin/orders/${orderId}/confirm`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-3">
      <Button size="sm" disabled={busy} onClick={confirm}>
        입금확인
      </Button>
    </div>
  );
}
