import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth/roles";
import { getDraftPost } from "@/lib/posts-write";
import { PromoPanel } from "@/components/promo/promo-panel";

const CATEGORY_LABEL: Record<string, string> = {
  jobs: "일자리",
  business: "업체홍보",
  used: "중고거래",
  housing: "부동산·숙소",
  groupbuy: "공동구매",
  events: "행사·모임",
};

export default async function PromoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const post = await getDraftPost(id);
  if (!post) notFound();
  if (post.createdBy !== user!.id && !isAdmin(user!)) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${locale}/p/${post.shareCode}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">홍보문구·QR코드</h1>
      <p className="mb-6 text-sm text-slate-500">
        카카오톡, 커뮤니티 등에 공유할 수 있는 홍보문구와 QR코드를 생성합니다.
      </p>

      {post.status !== "published" ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          게시글이 아직 게시(승인) 상태가 아니어서 홍보문구를 생성할 수 없습니다.
        </p>
      ) : (
        <PromoPanel
          title={post.title ?? "(제목 없음)"}
          categoryLabel={CATEGORY_LABEL[post.categorySlug] ?? post.categorySlug}
          shareUrl={shareUrl}
        />
      )}
    </div>
  );
}
