import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { getLanguages } from "@/lib/languages";
import { BusinessVerifyForm } from "@/components/business/business-verify-form";

export default async function BusinessVerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, languages] = await Promise.all([getCurrentUser(), getLanguages()]);

  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">업체 인증 신청</h1>
      <p className="mb-6 text-sm text-slate-500">
        사업자등록증과 담당자 신분증을 제출하면 관리자 검토 후 업체 인증이 완료됩니다.
        제출한 서류는 관리자 외에는 열람할 수 없습니다.
      </p>
      <BusinessVerifyForm languages={languages} />
    </div>
  );
}
