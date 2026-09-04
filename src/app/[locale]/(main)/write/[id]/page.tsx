import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/roles";
import { getDraftPost } from "@/lib/posts-write";
import { getRegions } from "@/lib/regions";
import { getLanguages } from "@/lib/languages";
import { PostWizard } from "@/components/write/post-wizard";

export default async function WriteDraftPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [draft, regions, languages, tCategories] = await Promise.all([
    getDraftPost(id),
    getRegions(),
    getLanguages(),
    getTranslations("categories"),
  ]);

  if (!draft) {
    notFound();
  }

  if (draft.status !== "draft" && draft.status !== "rejected") {
    redirect(`/${locale}/me/posts`);
  }

  return (
    <PostWizard
      draft={draft}
      regions={regions}
      languages={languages.filter((l) => l.code !== "ko")}
      categoryName={tCategories(`${draft.categorySlug}.name` as never)}
    />
  );
}
