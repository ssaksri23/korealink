"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function buildPromoText(title: string, categoryLabel: string, shareUrl: string) {
  return [
    `[코리아링크 · ${categoryLabel}]`,
    title,
    "",
    "자세히 보기 👇",
    shareUrl,
  ].join("\n");
}

export function PromoPanel({
  title,
  categoryLabel,
  shareUrl,
}: {
  title: string;
  categoryLabel: string;
  shareUrl: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const promoText = buildPromoText(title, categoryLabel, shareUrl);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(promoText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경에서는 조용히 무시한다.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-3 p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR code" width={200} height={200} />
        ) : (
          <div className="flex size-[200px] items-center justify-center text-sm text-slate-400">
            QR코드 생성 중...
          </div>
        )}
        <p className="break-all text-center text-xs text-slate-500">{shareUrl}</p>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold text-slate-800">홍보문구</p>
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {promoText}
        </pre>
        <Button variant="outline" className="mt-3 w-full" onClick={copyText}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "복사됨" : "문구 복사하기"}
        </Button>
        <p className="mt-2 text-xs text-slate-400">
          복사한 문구와 QR코드를 카카오톡, 카페, 커뮤니티 등에 자유롭게 공유하세요.
        </p>
      </Card>
    </div>
  );
}
