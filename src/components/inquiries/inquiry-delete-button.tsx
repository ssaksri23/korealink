"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function InquiryDeleteButton({ inquiryId }: { inquiryId: string }) {
  const t = useTranslations("post");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("deleteInquiryConfirm"))) return;
    setBusy(true);
    const res = await fetch(`/api/inquiries/${inquiryId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      window.alert(t("deleteInquiryError"));
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleDelete}
      className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {t("deleteInquiry")}
    </button>
  );
}
