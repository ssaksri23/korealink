import "server-only";
import { headers } from "next/headers";

/**
 * NEXT_PUBLIC_APP_URL이 배포 환경에 설정되어 있지 않으면 QR/텔레그램 링크가
 * "/ko/p/xxx" 같은 상대경로로 생성되어 버리는 문제가 있었다. 환경변수가 없을 때는
 * 요청 헤더(host)로부터 실제 접속 도메인을 복원한다.
 */
export async function getAppUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("host");
  if (!host) return "";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
