"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductRow } from "@/lib/orders";

export function ProductEditForm({ product }: { product: ProductRow }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(product.price));
  const [durationDays, setDurationDays] = useState(
    product.durationDays !== null ? String(product.durationDays) : "",
  );
  const [busy, setBusy] = useState(false);

  async function save(overrides?: { isActive?: boolean }) {
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(price),
        durationDays: durationDays === "" ? null : Number(durationDays),
        ...overrides,
      }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-slate-500">가격(원)</label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-32"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">기간(일)</label>
        <Input
          type="number"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          placeholder="무제한"
          className="w-28"
        />
      </div>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => save()}>
        저장
      </Button>
      <Button
        size="sm"
        disabled={busy}
        onClick={() => save({ isActive: !product.isActive })}
      >
        {product.isActive ? "비활성화" : "활성화"}
      </Button>
    </div>
  );
}
