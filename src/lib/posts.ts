import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveTranslation } from "@/lib/i18n/resolveTranslation";
import type { PostCategory } from "@/lib/supabase/database.types";

export interface PostCardData {
  id: string;
  shareCode: string;
  title: string | null;
  isPending: boolean;
  isUrgent: boolean;
  isFeatured: boolean;
  region: string | null;
  createdAt: string;
  categorySlug: PostCategory;
}

interface RawPostRow {
  id: string;
  share_code: string;
  is_urgent: boolean;
  is_featured: boolean;
  created_at: string;
  original_language_code: string;
  categories: { slug: PostCategory } | { slug: PostCategory }[] | null;
  regions: { sido: string; sigungu: string | null } | { sido: string; sigungu: string | null }[] | null;
  post_translations: {
    language_code: string;
    translated_title: string | null;
    translated_content: string | null;
    translation_status:
      | "pending"
      | "translating"
      | "translated"
      | "review_required"
      | "reviewed"
      | "failed"
      | "re_review_required";
  }[];
}

function toOne<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapRow(row: RawPostRow, locale: string): PostCardData {
  const resolved = resolveTranslation(
    row.post_translations.map((t) => ({
      languageCode: t.language_code,
      title: t.translated_title,
      content: t.translated_content,
      status: t.translation_status,
    })),
    locale,
    row.original_language_code,
  );
  const region = toOne(row.regions);
  const category = toOne(row.categories);

  return {
    id: row.id,
    shareCode: row.share_code,
    title: resolved.title,
    isPending: resolved.isPending,
    isUrgent: row.is_urgent,
    isFeatured: row.is_featured,
    region: region ? [region.sido, region.sigungu].filter(Boolean).join(" ") : null,
    createdAt: row.created_at,
    categorySlug: category?.slug ?? "jobs",
  };
}

const POST_SELECT =
  "id, share_code, is_urgent, is_featured, created_at, original_language_code, categories(slug), regions(sido, sigungu), post_translations(language_code, translated_title, translated_content, translation_status)";

export async function getCategoryPostCounts(): Promise<
  Record<PostCategory, number>
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {} as Record<PostCategory, number>;
  }
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug");

  const counts: Record<string, number> = {};
  if (!categories) return counts as Record<PostCategory, number>;

  await Promise.all(
    categories.map(async (c) => {
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("category_id", c.id)
        .eq("status", "published")
        .is("deleted_at", null);
      counts[c.slug] = count ?? 0;
    }),
  );

  return counts as Record<PostCategory, number>;
}

export async function listRecentPublishedPosts(
  locale: string,
  limit = 6,
): Promise<PostCardData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RawPostRow[]>();

  if (error || !data) return [];
  return data.map((row) => mapRow(row, locale));
}

export async function listUrgentJobs(
  locale: string,
  limit = 6,
): Promise<PostCardData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "jobs")
    .maybeSingle();

  if (!category) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("category_id", category.id)
    .eq("is_urgent", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RawPostRow[]>();

  if (error || !data) return [];
  return data.map((row) => mapRow(row, locale));
}

export async function listPostsByCategory(
  categorySlug: PostCategory,
  locale: string,
  limit = 20,
): Promise<PostCardData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!category) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .eq("category_id", category.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RawPostRow[]>();

  if (error || !data) return [];
  return data.map((row) => mapRow(row, locale));
}

export interface PostDetailData extends PostCardData {
  content: string | null;
  viewCount: number;
  isOriginal: boolean;
  isFallback: boolean;
}

export async function getPostById(
  id: string,
  locale: string,
): Promise<PostDetailData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `${POST_SELECT}, view_count`,
    )
    .eq("id", id)
    .returns<(RawPostRow & { view_count: number })[]>();

  const row = data?.[0];
  if (error || !row) return null;

  const resolved = resolveTranslation(
    row.post_translations.map((t) => ({
      languageCode: t.language_code,
      title: t.translated_title,
      content: t.translated_content,
      status: t.translation_status,
    })),
    locale,
    row.original_language_code,
  );
  const region = toOne(row.regions);
  const category = toOne(row.categories);

  // 조회수 증가는 실패해도 상세화면 표시에 영향을 주지 않도록 결과를 기다리지 않는다.
  void supabase.rpc("increment_post_view", { target_post: id });

  return {
    id: row.id,
    shareCode: row.share_code,
    title: resolved.title,
    content: resolved.content,
    isPending: resolved.isPending,
    isOriginal: resolved.isOriginal,
    isFallback: resolved.isFallback,
    isUrgent: row.is_urgent,
    isFeatured: row.is_featured,
    region: region ? [region.sido, region.sigungu].filter(Boolean).join(" ") : null,
    createdAt: row.created_at,
    categorySlug: category?.slug ?? "jobs",
    viewCount: row.view_count,
  };
}

export async function getPostIdByShareCode(shareCode: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("share_code", shareCode)
    .maybeSingle();
  return data?.id ?? null;
}

export async function isPostBookmarked(postId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("profile_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();
  return !!data;
}

export async function searchPosts(
  query: string,
  locale: string,
  limit = 20,
): Promise<PostCardData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data: matchingTranslations } = await supabase
    .from("post_translations")
    .select("post_id")
    .ilike("translated_title", `%${trimmed}%`)
    .limit(200);

  const postIds = Array.from(
    new Set((matchingTranslations ?? []).map((t) => t.post_id)),
  );
  if (postIds.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("id", postIds)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<RawPostRow[]>();

  if (error || !data) return [];
  return data.map((row) => mapRow(row, locale));
}

export async function listMyBookmarks(
  userId: string,
  locale: string,
): Promise<PostCardData[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`created_at, posts(${POST_SELECT})`)
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .returns<{ created_at: string; posts: RawPostRow | null }[]>();

  if (error || !data) return [];
  return data
    .filter((row): row is { created_at: string; posts: RawPostRow } => row.posts !== null)
    .map((row) => mapRow(row.posts, locale));
}
