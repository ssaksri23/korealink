import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";
import { getAppUrl } from "@/lib/app-url";

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

export interface PublicTelegramChannel {
  languageCode: string;
  nameNative: string;
  flagEmoji: string;
  telegramUsername: string;
}

/**
 * 공개 채널 목록 화면(/channels)용. distribution_channels는 관리자 전용 RLS가
 * 걸려 있으므로, 안전한 컬럼만 노출하는 SECURITY DEFINER 함수를 통해 조회한다.
 */
export async function listPublicTelegramChannels(): Promise<PublicTelegramChannel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_public_telegram_channels");

  if (error || !data) return [];
  return data.map((row) => ({
    languageCode: row.language_code,
    nameNative: row.name_native,
    flagEmoji: row.flag_emoji,
    telegramUsername: row.telegram_username,
  }));
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

function buildDistributionMessage(
  title: string | null,
  content: string | null,
  shareUrl: string,
): string {
  const body = (content ?? "").slice(0, 500);
  return [title ?? "(제목 없음)", "", body, "", shareUrl].join("\n");
}

/**
 * 게시글을 활성 배포채널에 큐잉하고, TELEGRAM_BOT_TOKEN이 설정되어 있으며 채널에
 * telegram_chat_id가 등록되어 있으면 실제로 텔레그램 메시지를 발송한다(admin/distribution의
 * 수동 "배포 요청"과 텔레그램 배포 상품 주문 승인 시 자동 호출 양쪽에서 공유).
 * 토큰 미설정이거나 채널에 chat_id가 없으면 실제 발송 없이 큐/로그로만 남긴다.
 */
export async function queueDistributionForPost(
  postId: string,
  requestedBy: string,
): Promise<{ ok: boolean; queued: number; error?: string }> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, status, share_code, original_language_code, post_translations(language_code, translation_status, translated_title, translated_content)",
    )
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.status !== "published") {
    return { ok: false, queued: 0, error: "post not found or not published" };
  }

  const translations = post.post_translations as
    | {
        language_code: string;
        translation_status: string;
        translated_title: string | null;
        translated_content: string | null;
      }[]
    | null;
  const readyLanguages = new Set([
    post.original_language_code,
    ...(translations ?? [])
      .filter((t) => t.translation_status === "translated" || t.translation_status === "reviewed")
      .map((t) => t.language_code),
  ]);

  const { data: channels } = await supabase
    .from("distribution_channels")
    .select("id, language_code, telegram_chat_id")
    .eq("is_active", true)
    .in("language_code", Array.from(readyLanguages));

  if (!channels || channels.length === 0) {
    return { ok: false, queued: 0, error: "no active channel for this post's languages" };
  }

  const appUrl = await getAppUrl();
  const configured = isTelegramConfigured();

  const rows = await Promise.all(
    channels.map(async (c) => {
      const translation = (translations ?? []).find((t) => t.language_code === c.language_code);
      const shareUrl = `${appUrl}/${c.language_code}/p/${post.share_code}`;
      const now = new Date().toISOString();

      if (!configured) {
        return {
          post_id: post.id,
          language_code: c.language_code,
          channel_id: c.id,
          requested_by: requestedBy,
          status: "failed" as const,
          completed_at: now,
          error_message: "텔레그램 연동 전입니다(TELEGRAM_BOT_TOKEN 미설정). 큐에만 기록되었습니다.",
        };
      }
      if (!c.telegram_chat_id) {
        return {
          post_id: post.id,
          language_code: c.language_code,
          channel_id: c.id,
          requested_by: requestedBy,
          status: "failed" as const,
          completed_at: now,
          error_message: "이 채널에 텔레그램 chat_id가 등록되어 있지 않습니다.",
        };
      }

      const text = buildDistributionMessage(
        translation?.translated_title ?? null,
        translation?.translated_content ?? null,
        shareUrl,
      );
      const result = await sendTelegramMessage(c.telegram_chat_id, text);

      return {
        post_id: post.id,
        language_code: c.language_code,
        channel_id: c.id,
        requested_by: requestedBy,
        status: (result.ok ? "completed" : "failed") as "completed" | "failed",
        completed_at: now,
        telegram_message_id: result.messageId ?? null,
        error_message: result.ok ? null : result.error,
      };
    }),
  );

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
