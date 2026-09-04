import { getTranslations } from "next-intl/server";
import { searchPosts } from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ locale }, { q }, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("common"),
  ]);

  const query = q?.trim() ?? "";
  const posts = query ? await searchPosts(query, locale) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <form className="mb-6 flex gap-2" action={`/${locale}/search`}>
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t("search")}
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label={t("search")}>
          <Search className="size-5" />
        </Button>
      </form>

      {!query ? (
        <p className="text-center text-slate-500">검색어를 입력해주세요.</p>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          &ldquo;{query}&rdquo;에 대한 검색결과가 없습니다.
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
