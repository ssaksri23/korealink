import { notFound } from "next/navigation";
import { getAdminPostDetail } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { PostModerationActions } from "@/components/admin/post-moderation-actions";

export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPostDetail(id);
  if (!post) notFound();

  const original = post.translations.find(
    (t) => t.languageCode === post.originalLanguageCode,
  );

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{post.categorySlug}</Badge>
        <Badge variant="outline">{post.status}</Badge>
        <span className="text-sm text-slate-500">
          {post.createdByName ?? "-"} · {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900">
          {original?.title ?? "(제목 없음)"}
        </h1>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {original?.content ?? "-"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-slate-500">지역</p>
          <p className="font-medium">{post.regionLabel ?? "-"}</p>
        </div>
        <div>
          <p className="text-slate-500">담당자</p>
          <p className="font-medium">{post.contactName ?? "-"}</p>
        </div>
        <div>
          <p className="text-slate-500">전화번호</p>
          <p className="font-medium">{post.contactPhone ?? "-"}</p>
        </div>
      </div>

      {post.images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {post.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="aspect-square rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-800">번역 현황</h2>
        <div className="flex flex-wrap gap-1.5">
          {post.translations.map((t) => (
            <Badge key={t.languageCode} variant="outline">
              {t.languageCode}: {t.status}
            </Badge>
          ))}
        </div>
      </div>

      {post.rejectionReason && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          반려사유: {post.rejectionReason}
        </div>
      )}

      <PostModerationActions postId={post.id} status={post.status} />
    </div>
  );
}
