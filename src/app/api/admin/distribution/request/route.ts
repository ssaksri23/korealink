import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { queueDistributionForPost } from "@/lib/distribution";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({ postId: z.string().uuid() });

/**
 * 실제 텔레그램 발송 API는 이번 빌드에서 의도적으로 구현하지 않는다(운영 원칙: 실제 채널 메시지 발송 금지).
 * 배포 요청은 어떤 채널로 보낼지 큐/로그로만 기록하고, 상태는 항상 'failed'로 남겨
 * 관리자가 "아직 실제 발송되지 않았다"는 것을 화면에서 명확히 알 수 있게 한다.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  let admin;
  try {
    admin = await requireRole("admin", "super_admin");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = await queueDistributionForPost(parsed.data.postId, admin.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAdminAction(admin.id, "request_distribution", "posts", parsed.data.postId, {
    channelCount: result.queued,
  });

  return NextResponse.json({ ok: true, queued: result.queued });
}
