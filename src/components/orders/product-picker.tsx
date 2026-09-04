"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductRow } from "@/lib/orders";

export function ProductPicker({
  products,
  postId,
}: {
  products: ProductRow[];
  postId?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(productId: string) {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }

  const totalPrice = products
    .filter((p) => selected.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  async function submit() {
    if (selected.length === 0) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: selected, postId }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("신청에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    const { id, ids } = await res.json();
    router.push(ids?.length > 1 ? "/me/orders" : `/orders/${id}`);
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      {products.map((p) => (
        <Card key={p.id} className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            <div>
              <p className="font-semibold text-slate-900">{p.nameKo}</p>
              <p className="text-sm text-slate-500">{p.description}</p>
              <p className="mt-1 text-sm font-bold text-teal-700">
                {p.price.toLocaleString()}원
                {p.unit ? ` / ${p.unit}` : ""}
              </p>
            </div>
          </div>
        </Card>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1 text-sm">
            <span className="text-slate-500">선택 {selected.length}건</span>{" "}
            <span className="font-bold text-slate-900">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
          <Button disabled={selected.length === 0 || submitting} onClick={submit}>
            {submitting ? "신청 중..." : "선택한 상품 신청하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
