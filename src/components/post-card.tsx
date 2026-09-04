import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostCardData } from "@/lib/posts";

export function PostCard({ post }: { post: PostCardData }) {
  const t = useTranslations("common");

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="flex flex-col gap-1.5 p-4 transition hover:border-teal-400 hover:shadow-md">
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
      </Card>
    </Link>
  );
}
