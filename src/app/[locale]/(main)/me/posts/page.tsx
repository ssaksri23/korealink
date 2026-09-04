import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/roles";
import { listMyPosts } from "@/lib/posts-write";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, "default" | "accent" | "urgent" | "outline" | "success"> = {
  draft: "outline",
  pending_review: "default",
  translation_pending: "default",
  approved: "success",
  published: "success",
  expiring: "urgent",
  closed: "outline",
  hidden: "outline",
  rejected: "urgent",
  blocked: "urgent",
  deleted: "outline",
};

export default async function MyPostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, t, tStatus, tCategories] = await Promise.all([
    getCurrentUser(),
    getTranslations("write"),
    getTranslations("postStatus"),
    getTranslations("categories"),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const posts = await listMyPosts(user!.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-900">{t("myPosts")}</h1>

      {posts.length === 0 ? (
        <p className="text-center text-slate-500">{t("noMyPosts")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>
                  {tStatus(p.status as never)}
                </Badge>
                <Badge variant="outline">{tCategories(`${p.categorySlug}.name` as never)}</Badge>
              </div>
              <p className="font-semibold text-slate-900">{p.title ?? "(제목 없음)"}</p>
              {p.status === "rejected" && p.rejectionReason && (
                <p className="mt-1 text-sm text-red-600">
                  {t("rejectionReason")}: {p.rejectionReason}
                </p>
              )}
              <div className="mt-2 flex gap-3 text-sm">
                {(p.status === "draft" || p.status === "rejected") && (
                  <Link href={`/write/${p.id}`} className="text-teal-700 hover:underline">
                    {t("continueEditing")}
                  </Link>
                )}
                {p.status === "published" && (
                  <Link href={`/post/${p.id}`} className="text-teal-700 hover:underline">
                    {t("viewPost")}
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
