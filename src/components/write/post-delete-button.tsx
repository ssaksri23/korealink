"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function PostDeleteButton({
  postId,
  redirectTo,
}: {
  postId: string;
  redirectTo?: string;
}) {
  const t = useTranslations("write");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      window.alert(t("deleteError"));
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleDelete}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {t("deletePost")}
    </button>
  );
}
