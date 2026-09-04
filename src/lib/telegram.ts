import "server-only";
import { getSystemSetting } from "@/lib/system-settings";

/**
 * Telegram Bot API는 무료이며 봇 토큰만 있으면 호출 가능하다(유료 API 신청 대상 아님).
 * TELEGRAM_BOT_TOKEN이 설정되어 있지 않으면 항상 실패로 처리한다.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.description ?? `HTTP ${res.status}` };
    }

    return { ok: true, messageId: String(data.result?.message_id ?? "") };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

/**
 * 새 게시글 제출 등 관리자가 처리해야 할 이벤트를 관리자 전용 텔레그램 채널로 알린다.
 * system_settings.admin_telegram_chat_id가 설정되어 있지 않으면 조용히 아무 것도
 * 하지 않는다(관리자 알림 채널 설정은 선택사항이며, 실패해도 원래 동작을 막지 않는다).
 */
export async function notifyAdmin(text: string): Promise<void> {
  const chatId = await getSystemSetting<string>("admin_telegram_chat_id");
  if (!chatId) return;
  await sendTelegramMessage(chatId, text);
}
