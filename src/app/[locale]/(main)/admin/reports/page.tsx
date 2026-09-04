import { listReports } from "@/lib/admin";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReportActionMenu } from "@/components/admin/report-action-menu";

const REPORT_TYPE_LABEL: Record<string, string> = {
  false_info: "허위정보",
  wage_mismatch: "급여 불일치",
  condition_mismatch: "근무조건 불일치",
  fraud_suspected: "사기 의심",
  illegal_employment: "불법 취업 의심",
  contact_theft: "연락처 도용",
  discrimination: "차별·혐오",
  adult_ad: "성인광고",
  gambling: "도박",
  illegal_loan: "불법대출",
  illegal_drug: "불법의약품",
  not_removed_after_sale: "거래완료 후 미삭제",
  duplicate: "중복게시",
  other: "기타",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const reports = await listReports(status || "received");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["received", "접수"],
          ["reviewing", "검토중"],
          ["resolved", "처리완료"],
          ["", "전체"],
        ].map(([value, label]) => (
          <Link key={value} href={value ? `/admin/reports?status=${value}` : "/admin/reports?status="}>
            <Badge variant={(status ?? "received") === value ? "accent" : "outline"}>{label}</Badge>
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <p className="py-10 text-center text-slate-500">신고 내역이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="urgent">{REPORT_TYPE_LABEL[r.reportType] ?? r.reportType}</Badge>
                <span className="text-xs text-slate-500">
                  {r.reporterName ?? "-"} · {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              {r.postId && (
                <Link href={`/admin/posts/${r.postId}`} className="font-medium text-slate-900 hover:underline">
                  {r.postTitle ?? "(게시글 보기)"}
                </Link>
              )}
              {r.detail && <p className="mt-1 text-sm text-slate-600">{r.detail}</p>}
              {r.status !== "resolved" && <ReportActionMenu reportId={r.id} />}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
