"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";

export function ProhibitedWordDeleteButton({ wordId }: { wordId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/prohibited-words/${wordId}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={remove}
      className="text-slate-400 hover:text-red-600 disabled:opacity-50"
      aria-label="삭제"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
