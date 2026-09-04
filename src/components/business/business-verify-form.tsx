"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { LanguageRow } from "@/lib/languages";

const INDUSTRIES: [string, string][] = [
  ["telecom", "통신"], ["insurance", "보험"], ["bank_remittance", "은행·송금"],
  ["restaurant", "식당"], ["grocery", "식품점"], ["auto", "자동차"],
  ["mobile_phone", "휴대전화"], ["legal_admin", "법률·행정"], ["travel", "여행"],
  ["beauty", "미용"], ["hospital", "병원"], ["education", "교육"], ["other", "기타"],
];

export function BusinessVerifyForm({ languages }: { languages: LanguageRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [businessRegistrationDoc, setBusinessRegistrationDoc] = useState<File | null>(null);
  const [jobPlacementLicenseDoc, setJobPlacementLicenseDoc] = useState<File | null>(null);
  const [representativeIdDoc, setRepresentativeIdDoc] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleLanguage(code: string) {
    setSupportedLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  async function submit() {
    setError(null);
    if (!name.trim() || !industry || !businessRegistrationDoc || !representativeIdDoc) {
      setError("필수 항목을 모두 입력해주세요(업체명, 업종, 사업자등록증, 담당자 신분증).");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("industry", industry);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("phone", phone);
    supportedLanguages.forEach((code) => formData.append("supportedLanguages", code));
    formData.append("businessRegistrationDoc", businessRegistrationDoc);
    if (jobPlacementLicenseDoc) formData.append("jobPlacementLicenseDoc", jobPlacementLicenseDoc);
    formData.append("representativeIdDoc", representativeIdDoc);

    setSubmitting(true);
    const res = await fetch("/api/companies/verify-request", { method: "POST", body: formData });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "제출에 실패했습니다.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <p className="rounded-xl bg-teal-50 p-4 text-sm text-teal-700">
        인증 신청이 접수되었습니다. 관리자 검토 후 결과를 알려드립니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>업체명</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>업종</Label>
        <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">선택</option>
          {INDUSTRIES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>소개</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>주소</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>전화번호</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>지원 언어</Label>
        <div className="flex flex-wrap gap-3">
          {languages.map((l) => (
            <Checkbox
              key={l.code}
              checked={supportedLanguages.includes(l.code)}
              onChange={() => toggleLanguage(l.code)}
              label={`${l.flagEmoji} ${l.nameNative}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>사업자등록증 (필수)</Label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setBusinessRegistrationDoc(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>직업소개사업 등록증 (구인 업체인 경우)</Label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setJobPlacementLicenseDoc(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>담당자 신분증 (필수)</Label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setRepresentativeIdDoc(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button disabled={submitting} onClick={submit}>
        {submitting ? "제출 중..." : "인증 신청하기"}
      </Button>
    </div>
  );
}
