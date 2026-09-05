import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { PostCategory } from "@/lib/supabase/database.types";

export interface CategoryRow {
  slug: PostCategory;
  icon: string;
  displayOrder: number;
}

const FALLBACK_CATEGORIES: CategoryRow[] = [
  { slug: "jobs", icon: "briefcase", displayOrder: 1 },
  { slug: "business", icon: "store", displayOrder: 2 },
  { slug: "used", icon: "shopping-bag", displayOrder: 3 },
  { slug: "housing", icon: "home", displayOrder: 4 },
  { slug: "groupbuy", icon: "users", displayOrder: 5 },
  { slug: "events", icon: "calendar", displayOrder: 6 },
];

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return FALLBACK_CATEGORIES;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, icon, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_CATEGORIES;

    return data.map((c) => ({
      slug: c.slug as PostCategory,
      icon: c.icon ?? "layout-grid",
      displayOrder: c.display_order,
    }));
  } catch {
    return FALLBACK_CATEGORIES;
  }
});
