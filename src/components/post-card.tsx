import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostCardData } from "@/lib/posts";

export function PostCard({ post }: { post: PostCardData }) {
  const t = useTranslations("common");

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="flex h-full flex-col gap-1.5 overflow-hidden p-0 transition hover:border-teal-400 hover:shadow-md">
        {post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnailUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
            {t("appName")}
          </div>
        )}
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {post.isUrgent && <Badge variant="urgent">{t("urgentBadge")}</Badge>}
            {post.isFeatured && <Badge variant="accent">{t("featuredBadge")}</Badge>}
          </div>
          <h3 className="line-clamp-2 font-semibold text-slate-900">
            {post.title ?? t("translationPending")}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            {post.region && <span>{post.region}</span>}
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
