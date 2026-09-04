import { getTranslations } from "next-intl/server";
import {
  Briefcase,
  Store,
  ShoppingBag,
  Home as HomeIcon,
  Users,
  Calendar,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/categories";
import {
  getCategoryPostCounts,
  listRecentPublishedPosts,
  listUrgentJobs,
} from "@/lib/posts";
import { PostCard } from "@/components/post-card";
import { Card } from "@/components/ui/card";

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  store: Store,
  "shopping-bag": ShoppingBag,
  home: HomeIcon,
  users: Users,
  calendar: Calendar,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [tCommon, tHome, tCategories, categories, counts, recentPosts, urgentJobs] =
    await Promise.all([
      getTranslations("common"),
      getTranslations("home"),
      getTranslations("categories"),
      getCategories(),
      getCategoryPostCounts(),
      listRecentPublishedPosts(locale, 6),
      listUrgentJobs(locale, 4),
    ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <section className="mb-6 rounded-2xl bg-gradient-to-br from-[#0B2447] to-[#0d9488] p-6 text-white">
        <p className="text-lg font-bold sm:text-xl">{tCommon("taglineKo")}</p>
        <p className="mt-1 text-sm text-white/90 sm:text-base">
          {tCommon("taglineEn")}
        </p>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((c) => {
          const Icon = ICON_MAP[c.icon] ?? LayoutGrid;
          const count = counts[c.slug] ?? 0;
          return (
            <Link key={c.slug} href={`/c/${c.slug}`}>
              <Card className="flex h-full flex-col gap-2 p-4 transition hover:border-teal-400 hover:shadow-md">
                <Icon className="size-6 text-teal-700" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {tCategories(`${c.slug}.name` as never)}
                  </p>
                  <p className="line-clamp-1 text-xs text-slate-500">
                    {tCategories(`${c.slug}.description` as never)}
                  </p>
                </div>
                <p className="mt-auto text-xs font-medium text-teal-700">
                  {count} {tHome("newPosts")}
                </p>
              </Card>
            </Link>
          );
        })}
      </section>

      {urgentJobs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-slate-900">
            {tHome("urgentJobs")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {urgentJobs.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          {tHome("newToday")}
        </h2>
        {recentPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-500">
            등록된 게시글이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
