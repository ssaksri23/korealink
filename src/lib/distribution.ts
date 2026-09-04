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
