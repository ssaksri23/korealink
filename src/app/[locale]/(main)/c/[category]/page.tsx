import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { listPostsByCategory } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import type { PostCategory } from "@/lib/supabase/database.types";

const VALID_CATEGORIES: PostCategory[] = [
  "jobs",
  "business",
  "used",
  "housing",
  "groupbuy",
  "events",
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!VALID_CATEGORIES.includes(category as PostCategory)) {
    notFound();
  }

  const [t, posts] = await Promise.all([
    getTranslations("categories"),
    listPostsByCategory(category as PostCategory, locale),
  ]);

  const categoryName = t(`${category}.name` as never);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-slate-900">{categoryName}</h1>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          등록된 게시글이 없습니다.
        </div>
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
