import { notFound } from "next/navigation";
import { getTranslationReviewDetail } from "@/lib/admin";
import { TranslationEditForm } from "@/components/admin/translation-edit-form";

export default async function AdminTranslationEditPage({
  params,
}: {
  params: Promise<{ postId: string; lang: string }>;
}) {
  const { postId, lang } = await params;
  const detail = await getTranslationReviewDetail(postId, lang);
  if (!detail) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          원문 ({detail.originalLanguageCode})
        </h2>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="font-bold text-slate-900">{detail.originalTitle}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {detail.originalContent}
          </p>
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          번역문 ({detail.languageCode})
        </h2>
        <TranslationEditForm
          postId={detail.postId}
          languageCode={detail.languageCode}
          initialTitle={detail.translatedTitle ?? ""}
          initialContent={detail.translatedContent ?? ""}
          status={detail.status}
        />
      </div>
    </div>
  );
}
