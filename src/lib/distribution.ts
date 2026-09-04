import "server-only";
import { createClient } from "@/lib/supabase/server";

export function isTelegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

export interface DistributionChannelRow {
  id: string;
  languageCode: string;
  platform: string;
  channelName: string;
  telegramChatId: string | null;
  isActive: boolean;
}

export async function listDistributionChannels(): Promise<DistributionChannelRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("distribution_channels")
    .select("id, language_code, platform, channel_name, telegram_chat_id, is_active")
    .order("language_code", { ascending: true });

  if (error || !data) return [];
  return data.map((c) => ({
    id: c.id,
    languageCode: c.language_code,
    platform: c.platform,
    channelName: c.channel_name,
    telegramChatId: c.telegram_chat_id,
    isActive: c.is_active,
  }));
}

export interface DistributionLogRow {
  id: string;
  postId: string;
  postTitle: string | null;
  languageCode: string;
  channelName: string;
  status: string;
  errorMessage: string | null;
  requestedAt: string;
}

/**
 * 게시글을 활성 배포채널에 큐잉한다(admin/distribution의 수동 "배포 요청"과
 * 텔레그램 배포 상품 주문 승인 시 자동 호출 양쪽에서 공유). 실제 텔레그램 발송은
 * 안전을 위해 구현하지 않으므로 항상 status='failed'로 기록된다.
 */
export async function queueDistributionForPost(
  postId: string,
  requestedBy: string,
): Promise<{ ok: boolean; queued: number; error?: string }> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, status, original_language_code, post_translations(language_code, translation_status)")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.status !== "published") {
    return { ok: false, queued: 0, error: "post not found or not published" };
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
    return { ok: false, queued: 0, error: "no active channel for this post's languages" };
  }

  const errorMessage = isTelegramConfigured()
    ? "실제 텔레그램 발송 기능은 안전을 위해 이번 빌드에서 아직 구현되지 않았습니다. 큐에만 기록되었습니다."
    : "텔레그램 연동 전입니다(TELEGRAM_BOT_TOKEN 미설정). 큐에만 기록되었습니다.";

  const rows = channels.map((c) => ({
    post_id: post.id,
    language_code: c.language_code,
    channel_id: c.id,
    requested_by: requestedBy,
    status: "failed" as const,
    completed_at: new Date().toISOString(),
    error_message: errorMessage,
  }));

  const { error } = await supabase.from("distribution_logs").insert(rows);
  if (error) {
    return { ok: false, queued: 0, error: error.message };
  }

  return { ok: true, queued: rows.length };
}

export async function listDistributionLogs(): Promise<DistributionLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("distribution_logs")
    .select(
      "id, post_id, language_code, status, error_message, requested_at, distribution_channels(channel_name), posts(post_translations(translated_title))",
    )
    .order("requested_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row) => {
    const channel = Array.isArray(row.distribution_channels)
      ? row.distribution_channels[0]
      : row.distribution_channels;
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    const translations = post?.post_translations as
      | { translated_title: string | null }[]
      | null
      | undefined;
    const title = translations?.find((t) => t.translated_title)?.translated_title ?? null;
    return {
      id: row.id,
      postId: row.post_id,
      postTitle: title,
      languageCode: row.language_code,
      channelName: channel?.channel_name ?? "-",
      status: row.status,
      errorMessage: row.error_message,
      requestedAt: row.requested_at,
    };
  });
}
