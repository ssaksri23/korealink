import "server-only";

/**
 * Telegram Bot API는 무료이며 봇 토큰만 있으면 호출 가능하다(유료 API 신청 대상 아님).
 * TELEGRAM_BOT_TOKEN이 설정되어 있지 않으면 항상 실패로 처리한다 — 이 함수는
 * queueDistributionForPost 안에서만 호출되며, 실제로 메시지가 나가는 유일한 경로다.
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
