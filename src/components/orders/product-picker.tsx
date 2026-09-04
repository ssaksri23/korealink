"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/lib/orders";

export function ProductPicker({
  products,
  postId,
}: {
  products: ProductRow[];
  postId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function order(productId: string) {
    setPending(productId);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, postId }),
    });
    setPending(null);
    if (!res.ok) return;
    const { id } = await res.json();
    router.push(`/orders/${id}`);
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((p) => (
        <Card key={p.id} className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold text-slate-900">{p.nameKo}</p>
            <p className="text-sm text-slate-500">{p.description}</p>
            <p className="mt-1 text-sm font-bold text-teal-700">
              {p.price.toLocaleString()}원
              {p.unit ? ` / ${p.unit}` : ""}
            </p>
          </div>
          <Button disabled={pending !== null} onClick={() => order(p.id)}>
            신청
          </Button>
        </Card>
      ))}
    </div>
  );
}
