"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (options: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        fnError?: (result: { errorMsg: string }) => void;
      }) => void;
    };
  }
}

function loadNicepayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AUTHNICE) {
      resolve();
      return;
    }
    const existing = document.getElementById("nicepay-sdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script load failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "nicepay-sdk";
    script.src = "https://pay.nicepay.co.kr/v1/js/";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(script);
  });
}

export function NicepayButton({
  clientKey,
  orderId,
  amount,
  goodsName,
}: {
  clientKey: string;
  orderId: string;
  amount: number;
  goodsName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      await loadNicepayScript();
      window.AUTHNICE!.requestPay({
        clientId: clientKey,
        method: "card",
        // 결제 시도마다 유니크해야 하므로 타임스탬프를 붙인다(서버에서 앞 36자로 복원).
        orderId: `${orderId}-${Date.now()}`,
        amount,
        goodsName,
        returnUrl: `${window.location.origin}/api/payments/nicepay/return`,
        fnError: (result) => {
          setLoading(false);
          setError(result.errorMsg || "결제 요청에 실패했습니다.");
        },
      });
    } catch {
      setLoading(false);
      setError("결제창을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button onClick={handlePay} disabled={loading}>
        <CreditCard className="size-4" />
        {loading ? "결제창 여는 중..." : "카드로 결제하기"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
