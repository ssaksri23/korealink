import { listAdminPosts } from "@/lib/admin";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STATUS_LABEL_KO: Record<string, string> = {
  draft: "임시저장",
  pending_review: "승인 대기",
  translation_pending: "번역 대기",
  approved: "승인됨",
  published: "게시중",
  expiring: "마감임박",
  closed: "마감",
  hidden: "숨김",
  rejected: "반려됨",
  blocked: "차단됨",
  deleted: "삭제됨",
};

const FILTERS = [
  { value: "", label: "전체" },
  { value: "pending_review", label: "승인대기" },
  { value: "published", label: "게시중" },
  { value: "rejected", label: "반려" },
  { value: "hidden", label: "숨김" },
];

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const posts = await listAdminPosts(status || undefined);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/posts?status=${f.value}` : "/admin/posts"}
          >
            <Badge variant={(status || "") === f.value ? "accent" : "outline"}>
              {f.label}
            </Badge>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="py-10 text-center text-slate-500">게시글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/admin/posts/${p.id}`}>
              <Card className="flex items-center justify-between gap-3 p-3 transition hover:border-teal-400">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {p.title ?? "(제목 없음)"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.createdByName ?? "-"} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{STATUS_LABEL_KO[p.status] ?? p.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
