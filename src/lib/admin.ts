import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  newUsersToday: number;
  newPostsToday: number;
  pendingReview: number;
  rejected: number;
  translationPending: number;
  reportsReceived: number;
  companyVerificationRequested: number;
  paymentsWaiting: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    newUsersToday,
    newPostsToday,
    pendingReview,
    rejected,
    translationPending,
    reportsReceived,
    companyVerificationRequested,
    paymentsWaiting,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("post_translations").select("id", { count: "exact", head: true }).in("translation_status", ["pending", "review_required", "re_review_required"]),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "received"),
    supabase.from("company_verifications").select("id", { count: "exact", head: true }).eq("status", "requested"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "waiting"),
  ]);

  return {
    newUsersToday: newUsersToday.count ?? 0,
    newPostsToday: newPostsToday.count ?? 0,
    pendingReview: pendingReview.count ?? 0,
    rejected: rejected.count ?? 0,
    translationPending: translationPending.count ?? 0,
    reportsReceived: reportsReceived.count ?? 0,
    companyVerificationRequested: companyVerificationRequested.count ?? 0,
    paymentsWaiting: paymentsWaiting.count ?? 0,
  };
}

export interface AdminPostRow {
  id: string;
  status: string;
  createdAt: string;
  categorySlug: string;
  title: string | null;
  createdByName: string | null;
}

export async function listAdminPosts(statusFilter?: string): Promise<AdminPostRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(
      "id, status, created_at, categories(slug), profiles!posts_created_by_fkey(display_name), post_translations(language_code, translated_title)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const translations = row.post_translations as
      | { language_code: string; translated_title: string | null }[]
      | null;
    const title = translations?.find((t) => t.translated_title)?.translated_title ?? null;
    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      categorySlug: category?.slug ?? "jobs",
      title,
      createdByName: profile?.display_name ?? null,
    };
  });
}

export interface AdminPostDetail {
  id: string;
  status: string;
  categorySlug: string;
  originalLanguageCode: string;
  regionLabel: string | null;
  contactName: string | null;
  contactPhone: string | null;
  rejectionReason: string | null;
  createdByName: string | null;
  createdByEmail: string | null;
  createdAt: string;
  images: string[];
  translations: {
    languageCode: string;
    title: string | null;
    content: string | null;
    status: string;
  }[];
}

export async function getAdminPostDetail(id: string): Promise<AdminPostDetail | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, status, original_language_code, contact_name, contact_phone, rejection_reason, created_at, categories(slug), regions(sido, sigungu), profiles!posts_created_by_fkey(display_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !post) return null;

  const [{ data: images }, { data: translations }] = await Promise.all([
    supabase.from("post_images").select("image_url").eq("post_id", id).order("sort_order"),
    supabase
      .from("post_translations")
      .select("language_code, translated_title, translated_content, translation_status")
      .eq("post_id", id),
  ]);

  const category = Array.isArray(post.categories) ? post.categories[0] : post.categories;
  const region = Array.isArray(post.regions) ? post.regions[0] : post.regions;
  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

  return {
    id: post.id,
    status: post.status,
    categorySlug: category?.slug ?? "jobs",
    originalLanguageCode: post.original_language_code,
    regionLabel: region ? [region.sido, region.sigungu].filter(Boolean).join(" ") : null,
    contactName: post.contact_name,
    contactPhone: post.contact_phone,
    rejectionReason: post.rejection_reason,
    createdByName: profile?.display_name ?? null,
    createdByEmail: null,
    createdAt: post.created_at,
    images: (images ?? []).map((i) => i.image_url),
    translations: (translations ?? []).map((t) => ({
      languageCode: t.language_code,
      title: t.translated_title,
      content: t.translated_content,
      status: t.translation_status,
    })),
  };
}

export interface PendingTranslationRow {
  postId: string;
  languageCode: string;
  status: string;
  postTitle: string | null;
  categorySlug: string;
}

export async function listPendingTranslations(): Promise<PendingTranslationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_translations")
    .select(
      "post_id, language_code, translation_status, posts(original_language_code, categories(slug), post_translations(language_code, translated_title))",
    )
    .in("translation_status", ["pending", "review_required", "re_review_required"])
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  return data.map((row) => {
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    const category = post ? (Array.isArray(post.categories) ? post.categories[0] : post.categories) : null;
    const translations = post?.post_translations as
      | { language_code: string; translated_title: string | null }[]
      | undefined;
    const originalTitle = translations?.find(
      (t) => t.language_code === post?.original_language_code,
    )?.translated_title;
    return {
      postId: row.post_id,
      languageCode: row.language_code,
      status: row.translation_status,
      postTitle: originalTitle ?? null,
      categorySlug: category?.slug ?? "jobs",
    };
  });
}

export interface TranslationReviewDetail {
  postId: string;
  languageCode: string;
  originalLanguageCode: string;
  originalTitle: string | null;
  originalContent: string | null;
  translatedTitle: string | null;
  translatedContent: string | null;
  status: string;
}

export async function getTranslationReviewDetail(
  postId: string,
  languageCode: string,
): Promise<TranslationReviewDetail | null> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("original_language_code")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return null;

  const { data: rows } = await supabase
    .from("post_translations")
    .select("language_code, translated_title, translated_content, translation_status")
    .eq("post_id", postId)
    .in("language_code", [post.original_language_code, languageCode]);

  const original = rows?.find((r) => r.language_code === post.original_language_code);
  const target = rows?.find((r) => r.language_code === languageCode);

  return {
    postId,
    languageCode,
    originalLanguageCode: post.original_language_code,
    originalTitle: original?.translated_title ?? null,
    originalContent: original?.translated_content ?? null,
    translatedTitle: target?.translated_title ?? null,
    translatedContent: target?.translated_content ?? null,
    status: target?.translation_status ?? "pending",
  };
}

export interface AdminReportRow {
  id: string;
  reportType: string;
  detail: string | null;
  status: string;
  createdAt: string;
  postId: string | null;
  postTitle: string | null;
  reporterName: string | null;
}

export async function listReports(statusFilter?: string): Promise<AdminReportRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reports")
    .select(
      "id, report_type, detail, status, created_at, post_id, posts(post_translations(language_code, translated_title)), profiles!reports_reporter_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    const translations = post?.post_translations as
      | { language_code: string; translated_title: string | null }[]
      | undefined;
    const reporter = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      reportType: row.report_type,
      detail: row.detail,
      status: row.status,
      createdAt: row.created_at,
      postId: row.post_id,
      postTitle: translations?.find((t) => t.translated_title)?.translated_title ?? null,
      reporterName: reporter?.display_name ?? null,
    };
  });
}

export interface AdminCompanyVerificationRow {
  id: string;
  companyId: string;
  companyName: string;
  status: string;
  businessRegistrationDocUrl: string | null;
  jobPlacementLicenseDocUrl: string | null;
  representativeIdDocUrl: string | null;
  createdAt: string;
}

export async function listCompanyVerifications(
  statusFilter?: string,
): Promise<AdminCompanyVerificationRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("company_verifications")
    .select("id, company_id, status, business_registration_doc_url, job_placement_license_doc_url, representative_id_doc_url, created_at, companies(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;
    return {
      id: row.id,
      companyId: row.company_id,
      companyName: company?.name ?? "-",
      status: row.status,
      businessRegistrationDocUrl: row.business_registration_doc_url,
      jobPlacementLicenseDocUrl: row.job_placement_license_doc_url,
      representativeIdDocUrl: row.representative_id_doc_url,
      createdAt: row.created_at,
    };
  });
}

export async function logAdminAction(
  actorId: string,
  action: string,
  targetTable?: string,
  targetId?: string,
  detail?: Record<string, unknown>,
) {
  const supabase = await createClient();
  await supabase.from("admin_logs").insert({
    actor_id: actorId,
    action,
    target_table: targetTable ?? null,
    target_id: targetId ?? null,
    detail: (detail ?? null) as never,
  });
}
