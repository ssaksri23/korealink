import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";

const REPORT_TYPES = [
  "false_info",
  "wage_mismatch",
  "condition_mismatch",
  "fraud_suspected",
  "illegal_employment",
  "contact_theft",
  "discrimination",
  "adult_ad",
  "gambling",
  "illegal_loan",
  "illegal_drug",
  "not_removed_after_sale",
  "duplicate",
  "other",
] as const;

const REPORT_TYPE_LABEL_KO: Record<(typeof REPORT_TYPES)[number], string> = {
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

const bodySchema = z.object({
  postId: z.string().uuid(),
  reportType: z.enum(REPORT_TYPES),
  detail: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("reports").insert({
    post_id: parsed.data.postId,
    reporter_id: user.id,
    report_type: parsed.data.reportType,
    detail: parsed.data.detail,
  });

  if (error) {
    // 동일 사용자가 처리되지 않은 신고를 반복 제출하면 UNIQUE 제약으로 차단된다.
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/ko/admin/reports`;
  await notifyAdmin(
    `🚨 신고 접수됨\n사유: ${REPORT_TYPE_LABEL_KO[parsed.data.reportType]}\n\n확인하러 가기: ${adminUrl}`,
  );

  return NextResponse.json({ ok: true });
}
