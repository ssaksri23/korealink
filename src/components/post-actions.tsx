"use client";

import { useState } from "react";
import { Share2, MessageCircle, Flag, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";

const REPORT_TYPES = [
  "false_info",
  "wage_mismatch",
  "condition_mismatch",
  "fraud_suspected",
  "illegal_employment",
  "contact_theft",
  "discrimination",
  "adult_ad",
  "gambling",
  "illegal_loan",
  "illegal_drug",
  "not_removed_after_sale",
  "duplicate",
  "other",
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

// 신고 사유 14종은 우선 한국어/영어만 제공한다(다른 7개 언어는 다음 단계에서 번역 예정).
const REPORT_TYPE_LABEL: Record<"ko" | "en", Record<ReportType, string>> = {
  ko: {
    false_info: "허위정보",
    wage_mismatch: "급여 불일치",
    condition_mismatch: "근무조건 불일치",
    fraud_suspected: "사기 의심",
    illegal_employment: "불법 취업 의심",
    contact_theft: "연락처 도용",
    discrimination: "차별·혐오",
    adult_ad: "성인광고",
    gambling: "도박",
    illegal_loan: "불법대출",
    illegal_drug: "불법의약품",
    not_removed_after_sale: "거래완료 후 미삭제",
    duplicate: "중복게시",
    other: "기타",
  },
  en: {
    false_info: "False information",
    wage_mismatch: "Wage mismatch",
    condition_mismatch: "Working conditions mismatch",
    fraud_suspected: "Suspected fraud",
    illegal_employment: "Suspected illegal employment",
    contact_theft: "Contact info misuse",
    discrimination: "Discrimination / hate speech",
    adult_ad: "Adult advertisement",
    gambling: "Gambling",
    illegal_loan: "Illegal loan",
    illegal_drug: "Illegal drugs",
    not_removed_after_sale: "Not removed after sold",
    duplicate: "Duplicate post",
    other: "Other",
  },
};

export function PostActions({
  postId,
  sharePath,
  initialBookmarked,
  isLoggedIn,
}: {
  postId: string;
  sharePath: string;
  initialBookmarked: boolean;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("common");
  const tPost = useTranslations("post");
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<"inquiry" | "report" | null>(null);
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${sharePath}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등은 무시하고 클립보드 복사로 대체한다.
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // 클립보드 접근이 막힌 환경에서는 조용히 무시한다.
    }
  }

  function requireLogin(panel: "inquiry" | "report") {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setOpenPanel(openPanel === panel ? null : panel);
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0">
      <div className="mx-auto max-w-2xl">
        {openPanel === "inquiry" && (
          <InquiryPanel postId={postId} onClose={() => setOpenPanel(null)} />
        )}
        {openPanel === "report" && (
          <ReportPanel postId={postId} onClose={() => setOpenPanel(null)} />
        )}

        <div className="flex gap-2">
          <BookmarkButton
            postId={postId}
            initialBookmarked={initialBookmarked}
            isLoggedIn={isLoggedIn}
          />
          <Button variant="outline" size="lg" className="flex-1" onClick={handleShare}>
            {shared ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {t("share")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => requireLogin("inquiry")}
          >
            <MessageCircle className="size-4" />
            {tPost("inquiry")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 text-red-600"
            onClick={() => requireLogin("report")}
          >
            <Flag className="size-4" />
            {t("report")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InquiryPanel({ postId, onClose }: { postId: string; onClose: () => void }) {
  const tPost = useTranslations("post");
  const tCommon = useTranslations("common");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    if (!message.trim()) return;
    setStatus("sending");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, message }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="mb-3 rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
        {tPost("inquirySent")}
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
      <textarea
        className="min-h-20 w-full resize-none rounded-lg border border-slate-300 p-2 text-sm"
        placeholder={tPost("inquiryPlaceholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {status === "error" && (
        <p className="text-xs text-red-600">{tPost("inquiryError")}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button size="sm" onClick={submit} disabled={status === "sending"}>
          {tPost("inquirySend")}
        </Button>
      </div>
    </div>
  );
}

function ReportPanel({ postId, onClose }: { postId: string; onClose: () => void }) {
  const tPost = useTranslations("post");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const labels = REPORT_TYPE_LABEL[locale === "ko" ? "ko" : "en"];
  const [reportType, setReportType] = useState<ReportType>("false_info");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    setStatus("sending");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, reportType, detail }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
        {tPost("reportSent")}
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-200 p-3">
      <select
        className="w-full rounded-lg border border-slate-300 p-2 text-sm"
        value={reportType}
        onChange={(e) => setReportType(e.target.value as ReportType)}
      >
        {REPORT_TYPES.map((type) => (
          <option key={type} value={type}>
            {labels[type]}
          </option>
        ))}
      </select>
      <textarea
        className="min-h-16 w-full resize-none rounded-lg border border-slate-300 p-2 text-sm"
        placeholder={tPost("reportDetailPlaceholder")}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
      />
      {status === "error" && (
        <p className="text-xs text-red-600">{tPost("reportError")}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button size="sm" variant="destructive" onClick={submit} disabled={status === "sending"}>
          {tPost("reportSubmit")}
        </Button>
      </div>
    </div>
  );
}
