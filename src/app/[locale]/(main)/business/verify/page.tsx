import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { getLanguages } from "@/lib/languages";
import { getMyCompanyVerification } from "@/lib/companies";
import { BusinessVerifyForm } from "@/components/business/business-verify-form";

const STATUS_LABEL: Record<string, string> = {
  requested: "검토 대기중",
  reviewing: "검토중",
  approved: "승인됨",
  rejected: "반려됨",
};

export default async function BusinessVerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, languages] = await Promise.all([getCurrentUser(), getLanguages()]);

  if (!user) redirect(`/${locale}/login`);

  const existing = await getMyCompanyVerification(user!.id);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">업체 인증 신청</h1>
      <p className="mb-6 text-sm text-slate-500">
        사업자등록증과 담당자 신분증을 제출하면 관리자 검토 후 업체 인증이 완료됩니다.
        제출한 서류는 관리자 외에는 열람할 수 없습니다.
      </p>

      {existing && existing.latestRequestStatus && (
        <div
          className={`mb-6 rounded-xl p-4 text-sm ${
            existing.latestRequestStatus === "rejected"
              ? "bg-red-50 text-red-700"
              : existing.latestRequestStatus === "approved"
                ? "bg-teal-50 text-teal-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          <p className="font-semibold">
            {existing.companyName} · 현재 상태:{" "}
            {STATUS_LABEL[existing.latestRequestStatus] ?? existing.latestRequestStatus}
          </p>
          {existing.latestRequestStatus === "rejected" && existing.rejectionReason && (
            <p className="mt-1">반려 사유: {existing.rejectionReason}</p>
          )}
          {existing.latestRequestStatus === "rejected" && (
            <p className="mt-1 text-xs">아래 양식을 다시 작성해 재신청할 수 있습니다.</p>
          )}
        </div>
      )}

      {existing?.latestRequestStatus !== "approved" && (
        <BusinessVerifyForm languages={languages} />
      )}
    </div>
  );
}
