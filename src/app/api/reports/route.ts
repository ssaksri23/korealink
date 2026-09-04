import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
  return NextResponse.json({ ok: true });
}
