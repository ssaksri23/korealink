import "server-only";
import { createHash } from "node:crypto";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * 나이스페이 결제창(Client 승인 모델) returnUrl 콜백은 사용자 브라우저를 거쳐 오므로
 * 위변조 가능성이 있다. tid+amount+ediDate+시크릿키로 만든 서명을 재계산해 콜백에
 * 실려온 signature와 같은지 확인한다.
 */
export function verifyNicepaySignature(
  tid: string,
  amount: string,
  ediDate: string,
  signature: string,
): boolean {
  const secretKey = process.env.NICEPAY_SECRET_KEY;
  if (!secretKey) return false;
  const expected = sha256Hex(`${tid}${amount}${ediDate}${secretKey}`);
  return expected === signature;
}

interface NicepayCheckAmountResponse {
  resultCode: string;
  resultMsg: string;
  isValid: boolean;
  tid: string;
}

interface NicepayAccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expireAt: string;
}

/**
 * 이 가맹점의 클라이언트키/시크릿키는 "Token 인증" 방식으로 등록돼 있어(콘솔에
 * "시크릿 키 - Token 인증"으로 표시됨), Basic 인증으로 API를 호출하면
 * "사용자 인증타입이 맞지 않습니다" 오류가 난다. 먼저 Basic 인증으로 액세스
 * 토큰을 발급받고, 그 토큰을 Bearer로 실제 API 호출에 사용해야 한다.
 */
async function getNicepayAccessToken(): Promise<{ token?: string; error?: string }> {
  const clientKey = process.env.NICEPAY_CLIENT_KEY;
  const secretKey = process.env.NICEPAY_SECRET_KEY;
  if (!clientKey || !secretKey) {
    return { error: "NICEPAY_CLIENT_KEY/NICEPAY_SECRET_KEY not configured" };
  }
  const auth = Buffer.from(`${clientKey}:${secretKey}`).toString("base64");

  try {
    const res = await fetch("https://api.nicepay.co.kr/v1/access-token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.json().catch(() => null)) as NicepayAccessTokenResponse | null;
    if (!res.ok || !data?.accessToken) {
      return { error: `access-token failed: HTTP ${res.status}` };
    }
    return { token: data.accessToken };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "network error" };
  }
}

/**
 * Client 승인 모델은 결제창 인증이 곧 결제 완료이므로 별도 승인 호출이 필요 없다.
 * 대신 나이스페이 서버에 금액이 위변조되지 않았는지 한 번 더 물어보는 "금액 검증
 * API"만 호출한다(문서상 필수 절차).
 */
export async function checkNicepayAmount(
  tid: string,
  amount: number,
): Promise<{ ok: boolean; error?: string }> {
  const secretKey = process.env.NICEPAY_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, error: "NICEPAY_SECRET_KEY not configured" };
  }

  const { token, error: tokenError } = await getNicepayAccessToken();
  if (!token) {
    return { ok: false, error: tokenError ?? "failed to obtain access token" };
  }

  const ediDate = new Date().toISOString();
  const signData = sha256Hex(`${tid}${amount}${ediDate}${secretKey}`);

  try {
    const res = await fetch(`https://api.nicepay.co.kr/v1/check-amount/${tid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, ediDate, signData, returnCharSet: "utf-8" }),
    });

    const data = (await res.json().catch(() => null)) as NicepayCheckAmountResponse | null;
    if (!res.ok || !data || data.resultCode !== "0000" || !data.isValid) {
      return { ok: false, error: data?.resultMsg ?? `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}
