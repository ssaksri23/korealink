"use client";

import { useState } from "react";
import {
  Briefcase,
  Store,
  ShoppingBag,
  Home as HomeIcon,
  Users,
  Calendar,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  store: Store,
  "shopping-bag": ShoppingBag,
  home: HomeIcon,
  users: Users,
  calendar: Calendar,
};

export function CategoryPicker({
  categories,
}: {
  categories: { slug: string; icon: string; name: string; description: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function pick(slug: string) {
    setPending(slug);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlug: slug }),
      });
      if (!res.ok) {
        setPending(null);
        return;
      }
      const { id } = await res.json();
      router.push(`/write/${id}`);
    } catch {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((c) => {
        const Icon = ICON_MAP[c.icon] ?? LayoutGrid;
        return (
          <button
            key={c.slug}
            type="button"
            disabled={pending !== null}
            onClick={() => pick(c.slug)}
            className="text-left disabled:opacity-60"
          >
            <Card className="flex h-full flex-col gap-2 p-4 transition hover:border-teal-400 hover:shadow-md">
              <Icon className="size-6 text-teal-700" />
              <p className="font-semibold text-slate-900">{c.name}</p>
              <p className="line-clamp-2 text-xs text-slate-500">{c.description}</p>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
