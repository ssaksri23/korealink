import { listCompanyVerifications } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyVerificationActions } from "@/components/admin/company-verification-actions";

export default async function AdminCompaniesPage() {
  const rows = await listCompanyVerifications("requested");

  return (
    <div>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-slate-500">인증 요청이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <p className="font-semibold text-slate-900">{r.companyName}</p>
                <Badge variant="outline">{new Date(r.createdAt).toLocaleDateString()}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {r.businessRegistrationDocUrl && (
                  <a href={r.businessRegistrationDocUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                    사업자등록증
                  </a>
                )}
                {r.jobPlacementLicenseDocUrl && (
                  <a href={r.jobPlacementLicenseDocUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                    직업소개사업 등록증
                  </a>
                )}
                {r.representativeIdDocUrl && (
                  <a href={r.representativeIdDocUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                    담당자 확인자료
                  </a>
                )}
              </div>
              <CompanyVerificationActions verificationId={r.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
