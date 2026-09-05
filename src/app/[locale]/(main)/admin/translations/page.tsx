import { listPendingTranslations } from "@/lib/admin";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PostDeleteButton } from "@/components/write/post-delete-button";

export default async function AdminTranslationsPage() {
  const rows = await listPendingTranslations();

  return (
    <div>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-slate-500">번역 대기 항목이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <Card
              key={`${r.postId}-${r.languageCode}`}
              className="flex items-center justify-between gap-3 p-3 transition hover:border-teal-400"
            >
              <Link
                href={`/admin/translations/${r.postId}/${r.languageCode}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-medium text-slate-900">
                  {r.postTitle ?? "(제목 없음)"}
                </p>
                <p className="text-xs text-slate-500">{r.categorySlug}</p>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline">{r.languageCode}</Badge>
                <Badge variant={r.status === "re_review_required" ? "urgent" : "outline"}>
                  {r.status}
                </Badge>
                <PostDeleteButton postId={r.postId} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
