import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPostById, isPostBookmarked } from "@/lib/posts";
import { getCurrentUser, isAdmin } from "@/lib/auth/roles";
import { listPostInquiries } from "@/lib/inquiries";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { PostActions } from "@/components/post-actions";
import { PostDeleteButton } from "@/components/write/post-delete-button";
import { InquiryDeleteButton } from "@/components/inquiries/inquiry-delete-button";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [t, tCategories, tPost, tRoot, tWrite, post, bookmarked, user] = await Promise.all([
    getTranslations("common"),
    getTranslations("categories"),
    getTranslations("post"),
    getTranslations(),
    getTranslations("write"),
    getPostById(id, locale),
    isPostBookmarked(id),
    getCurrentUser(),
  ]);

  if (!post) {
    notFound();
  }

  const isOwner = !!user && (post.createdBy === user.id || isAdmin(user));
  const isDeletable = post.status !== "blocked" && post.status !== "deleted";
  const TRANSACTION_CATEGORIES = ["jobs", "business", "used", "housing", "groupbuy"];
  const inquiries = isOwner ? await listPostInquiries(post.id) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {TRANSACTION_CATEGORIES.includes(post.categorySlug) && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          {tPost("transactionWarning")}
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {post.isUrgent && <Badge variant="urgent">{t("urgentBadge")}</Badge>}
        {post.isFeatured && <Badge variant="accent">{t("featuredBadge")}</Badge>}
        <Badge variant="outline">{tCategories(`${post.categorySlug}.name` as never)}</Badge>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        {post.title ?? t("translationPending")}
      </h1>

      {isOwner && (
        <div className="mt-2 flex gap-3 text-sm">
          <Link href={`/write/${post.id}`} className="text-teal-700 hover:underline">
            {tWrite("editPost")}
          </Link>
          {isDeletable && <PostDeleteButton postId={post.id} redirectTo="/me/posts" />}
        </div>
      )}

      {post.isFallback && !post.isPending && (
        <p className="mt-1 text-sm text-amber-600">{t("translationPending")}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
        {post.region && <span>{post.region}</span>}
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span>{tPost("viewCount", { count: post.viewCount + 1 })}</span>
      </div>

      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-800">
        {post.content ?? t("translationPending")}
      </div>

      <p className="mt-10 rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
        {tRoot("disclaimer")}
      </p>

      {isOwner && inquiries.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            {tPost("receivedInquiries")} ({inquiries.length})
          </h2>
          <div className="flex flex-col gap-2">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-wrap text-slate-800">{inquiry.message}</p>
                  <InquiryDeleteButton inquiryId={inquiry.id} />
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                  {inquiry.senderName && <span>{inquiry.senderName}</span>}
                  {inquiry.contactPhone && <span>{inquiry.contactPhone}</span>}
                  <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PostActions
        postId={post.id}
        sharePath={`/${locale}/p/${post.shareCode}`}
        initialBookmarked={bookmarked}
        isLoggedIn={!!user}
      />
    </div>
  );
}
