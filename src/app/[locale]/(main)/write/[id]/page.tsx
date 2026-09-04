import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser, isAdmin } from "@/lib/auth/roles";
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

  // published 글도 본인/관리자는 수정 가능해야 하므로(재제출 시 pending_review로 되돌아가
  // 재검수됨), 상태만으로 막지 않고 소유권을 직접 확인한다. published 글은 RLS select
  // 정책상 누구나 읽을 수 있어 상태 체크만으로는 다른 사람 글 노출을 막지 못한다.
  if (draft.createdBy !== user!.id && !isAdmin(user!)) {
    notFound();
  }

  if (draft.status === "blocked" || draft.status === "deleted") {
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
