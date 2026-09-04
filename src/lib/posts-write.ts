import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PostCategory } from "@/lib/supabase/database.types";

export const CATEGORY_DETAIL_TABLE: Record<PostCategory, string> = {
  jobs: "job_details",
  business: "business_details",
  used: "used_item_details",
  housing: "housing_details",
  groupbuy: "group_buy_details",
  events: "event_details",
};

export interface DraftPost {
  id: string;
  shareCode: string;
  status: string;
  categorySlug: PostCategory;
  categoryId: string;
  originalLanguageCode: string;
  regionId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  rejectionReason: string | null;
  title: string | null;
  content: string | null;
  createdBy: string;
  images: { id: string; imageUrl: string; sortOrder: number; isPrimary: boolean }[];
  details: Record<string, unknown> | null;
}

/**
 * 본인 소유 게시글(초안 포함)을 조회한다. RLS가 소유자/관리자 외 접근을 이미 차단하므로
 * 여기서는 결과가 없으면 곧 "없거나 권한 없음"으로 취급하면 된다.
 */
export async function getDraftPost(postId: string): Promise<DraftPost | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, share_code, status, category_id, original_language_code, region_id, contact_name, contact_phone, rejection_reason, created_by, categories(slug)",
    )
    .eq("id", postId)
    .maybeSingle();

  if (error || !post) return null;

  const categorySlug = (
    Array.isArray(post.categories) ? post.categories[0] : post.categories
  )?.slug as PostCategory | undefined;
  if (!categorySlug) return null;

  const [{ data: translation }, { data: images }, { data: details }] = await Promise.all([
    supabase
      .from("post_translations")
      .select("translated_title, translated_content")
      .eq("post_id", postId)
      .eq("language_code", post.original_language_code)
      .maybeSingle(),
    supabase
      .from("post_images")
      .select("id, image_url, sort_order, is_primary")
      .eq("post_id", postId)
      .order("sort_order", { ascending: true }),
    supabase
      .from(CATEGORY_DETAIL_TABLE[categorySlug] as "job_details")
      .select("*")
      .eq("post_id", postId)
      .maybeSingle(),
  ]);

  return {
    id: post.id,
    shareCode: post.share_code,
    status: post.status,
    categorySlug,
    categoryId: post.category_id,
    originalLanguageCode: post.original_language_code,
    regionId: post.region_id,
    contactName: post.contact_name,
    contactPhone: post.contact_phone,
    rejectionReason: post.rejection_reason,
    title: translation?.translated_title ?? null,
    content: translation?.translated_content ?? null,
    createdBy: post.created_by,
    images: (images ?? []).map((i) => ({
      id: i.id,
      imageUrl: i.image_url,
      sortOrder: i.sort_order,
      isPrimary: i.is_primary,
    })),
    details: (details as Record<string, unknown> | null) ?? null,
  };
}

export async function listMyPosts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, share_code, status, rejection_reason, created_at, categories(slug), post_translations(language_code, translated_title)",
    )
    .eq("created_by", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const translations = row.post_translations as
      | { language_code: string; translated_title: string | null }[]
      | null;
    const original = translations?.find((t) => t.translated_title) ?? translations?.[0];
    return {
      id: row.id,
      shareCode: row.share_code,
      status: row.status,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      categorySlug: (category?.slug ?? "jobs") as PostCategory,
      title: original?.translated_title ?? null,
    };
  });
}
