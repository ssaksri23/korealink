import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/roles";
import { checkNicepayAmount } from "@/lib/nicepay";

// 실제 결제 없이 이미 발생한 거래(tid)로 금액검증 API 인증 방식이 맞는지
// 확인하기 위한 임시 진단용 라우트. 문제 해결 후 삭제 예정.
export async function GET(request: Request) {
  try {
    await requireRole("admin", "super_admin");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const tid = searchParams.get("tid");
  const amount = Number(searchParams.get("amount"));
  if (!tid || !amount) {
    return NextResponse.json({ error: "tid, amount query params required" }, { status: 400 });
  }

  const result = await checkNicepayAmount(tid, amount);
  return NextResponse.json(result);
}
