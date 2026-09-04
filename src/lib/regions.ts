import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface RegionRow {
  id: string;
  sido: string;
  sigungu: string | null;
}

export async function getRegions(): Promise<RegionRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("regions")
      .select("id, sido, sigungu")
      .order("sido", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
