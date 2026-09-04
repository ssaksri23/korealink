"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CompanyVerificationActions({ verificationId }: { verificationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approved" | "rejected") {
    setBusy(true);
    await fetch(`/api/admin/companies/${verificationId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button variant="outline" size="sm" disabled={busy} onClick={() => decide("rejected")}>
        반려
      </Button>
      <Button size="sm" disabled={busy} onClick={() => decide("approved")}>
        인증승인
      </Button>
    </div>
  );
}
