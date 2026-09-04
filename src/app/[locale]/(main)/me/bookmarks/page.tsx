import { redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/roles";
import { listMyBookmarks } from "@/lib/posts";
import { PostCard } from "@/components/post-card";

export default async function MyBookmarksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, t] = await Promise.all([getCurrentUser(), getTranslations("common")]);

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const posts = await listMyBookmarks(user!.id, locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-900">{t("save")}</h1>

      {posts.length === 0 ? (
        <p className="text-center text-slate-500">{t("noPostsYet")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
