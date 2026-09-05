import "server-only";

interface NicepayApproveResponse {
  resultCode: string;
  resultMsg: string;
  tid: string;
  amount: number;
  status: string;
}

/**
 * 나이스페이 결제창 인증이 끝난 뒤, 서버 대 서버로 최종 승인을 한 번 더 호출한다.
 * (인증-승인 분리 방식: 결제창에서 받은 금액을 그대로 믿지 않고, 우리 서버가 알고
 * 있는 실제 주문 금액과 나이스페이가 최종 확정한 금액이 같은지 이 응답으로 다시 검증한다.)
 */
export async function approveNicepayPayment(
  tid: string,
  amount: number,
): Promise<{ ok: boolean; approvedAmount?: number; error?: string }> {
  const clientKey = process.env.NICEPAY_CLIENT_KEY;
  const secretKey = process.env.NICEPAY_SECRET_KEY;
  if (!clientKey || !secretKey) {
    return { ok: false, error: "NICEPAY_CLIENT_KEY/NICEPAY_SECRET_KEY not configured" };
  }

  const auth = Buffer.from(`${clientKey}:${secretKey}`).toString("base64");

  try {
    const res = await fetch(`https://api.nicepay.co.kr/v1/payments/${tid}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const data = (await res.json().catch(() => null)) as NicepayApproveResponse | null;
    if (!res.ok || !data || data.resultCode !== "0000") {
      return { ok: false, error: data?.resultMsg ?? `HTTP ${res.status}` };
    }

    return { ok: true, approvedAmount: data.amount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}
