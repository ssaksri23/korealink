import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { isTelegramConfigured } from "@/lib/distribution";
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

  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, status, original_language_code, post_translations(language_code, translation_status)")
    .eq("id", parsed.data.postId)
    .maybeSingle();

  if (!post || post.status !== "published") {
    return NextResponse.json({ error: "post not found or not published" }, { status: 404 });
  }

  const translations = post.post_translations as
    | { language_code: string; translation_status: string }[]
    | null;
  const readyLanguages = new Set([
    post.original_language_code,
    ...(translations ?? [])
      .filter((t) => t.translation_status === "reviewed")
      .map((t) => t.language_code),
  ]);

  const { data: channels } = await supabase
    .from("distribution_channels")
    .select("id, language_code")
    .eq("is_active", true)
    .in("language_code", Array.from(readyLanguages));

  if (!channels || channels.length === 0) {
    return NextResponse.json({ error: "no active channel for this post's languages" }, { status: 400 });
  }

  const configured = isTelegramConfigured();
  const errorMessage = configured
    ? "실제 텔레그램 발송 기능은 안전을 위해 이번 빌드에서 아직 구현되지 않았습니다. 큐에만 기록되었습니다."
    : "텔레그램 연동 전입니다(TELEGRAM_BOT_TOKEN 미설정). 큐에만 기록되었습니다.";

  const rows = channels.map((c) => ({
    post_id: post.id,
    language_code: c.language_code,
    channel_id: c.id,
    requested_by: admin.id,
    status: "failed" as const,
    completed_at: new Date().toISOString(),
    error_message: errorMessage,
  }));

  const { error } = await supabase.from("distribution_logs").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "request_distribution", "posts", post.id, {
    channelCount: rows.length,
  });

  return NextResponse.json({ ok: true, queued: rows.length });
}
