import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { getPostIdByShareCode } from "@/lib/posts";

/**
 * 카카오/텔레그램 등 외부에 공유하기 위한 짧고 안정적인 URL.
 * 실제 상세화면은 /post/[id] 이며, 여기서는 share_code → id 로 변환 후 이동만 담당한다.
 */
export default async function ShareRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; shareCode: string }>;
}) {
  const { locale, shareCode } = await params;
  const postId = await getPostIdByShareCode(shareCode);

  if (!postId) {
    notFound();
  }

  redirect({ href: `/post/${postId}`, locale });
}
