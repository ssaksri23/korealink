import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPostById, isPostBookmarked } from "@/lib/posts";
import { getCurrentUser } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { PostActions } from "@/components/post-actions";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const [t, tCategories, post, bookmarked, user] = await Promise.all([
    getTranslations("common"),
    getTranslations("categories"),
    getPostById(id, locale),
    isPostBookmarked(id),
    getCurrentUser(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {post.isUrgent && <Badge variant="urgent">긴급</Badge>}
        {post.isFeatured && <Badge variant="accent">추천</Badge>}
        <Badge variant="outline">{tCategories(`${post.categorySlug}.name` as never)}</Badge>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        {post.title ?? t("translationPending")}
      </h1>

      {post.isFallback && !post.isPending && (
        <p className="mt-1 text-sm text-amber-600">{t("translationPending")}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
        {post.region && <span>{post.region}</span>}
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span>조회 {post.viewCount + 1}</span>
      </div>

      <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-slate-800">
        {post.content ?? t("translationPending")}
      </div>

      <p className="mt-10 rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
        KoreaLink는 정보 제공 플랫폼이며 고용조건과 거래 안전성을 직접
        보증하지 않습니다. 계약, 취업 또는 거래 전에 업체와 조건을 반드시
        확인하세요.
      </p>

      <PostActions
        postId={post.id}
        sharePath={`/${locale}/p/${post.shareCode}`}
        initialBookmarked={bookmarked}
        isLoggedIn={!!user}
      />
    </div>
  );
}
