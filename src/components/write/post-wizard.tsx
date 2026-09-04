"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { DraftPost } from "@/lib/posts-write";
import type { RegionRow } from "@/lib/regions";
import type { LanguageRow } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CategoryDetailsFields,
  type DetailsState,
} from "@/components/write/category-details-fields";

function toCamel(key: string) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function detailsToCamel(details: Record<string, unknown> | null): DetailsState {
  if (!details) return {};
  const out: DetailsState = {};
  for (const [key, value] of Object.entries(details)) {
    if (key === "post_id" || key === "updated_at") continue;
    out[toCamel(key)] = value as never;
  }
  return out;
}

const STEP_KEYS = [
  "basicInfo",
  "categoryDetails",
  "contact",
  "photos",
  "translationMode",
  "preview",
] as const;

export function PostWizard({
  draft,
  regions,
  languages,
  categoryName,
}: {
  draft: DraftPost;
  regions: RegionRow[];
  languages: LanguageRow[];
  categoryName: string;
}) {
  const t = useTranslations("write");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(draft.title ?? "");
  const [content, setContent] = useState(draft.content ?? "");
  const [regionId, setRegionId] = useState(draft.regionId ?? "");
  const [selectedSido, setSelectedSido] = useState(
    regions.find((r) => r.id === draft.regionId)?.sido ?? "",
  );
  const [contactName, setContactName] = useState(draft.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(draft.contactPhone ?? "");
  const [details, setDetails] = useState<DetailsState>(detailsToCamel(draft.details));
  const [images, setImages] = useState(draft.images);
  const [mode, setMode] = useState<"original_only" | "selected" | "all">("original_only");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  async function saveBasic(): Promise<boolean> {
    if (title.trim().length < 2) {
      setError(t("titleRequired"));
      return false;
    }
    if (content.trim().length < 2) {
      setError(t("contentRequired"));
      return false;
    }
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/posts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "저장 실패");
      return false;
    }
    return true;
  }

  async function saveDetails(): Promise<boolean> {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/posts/${draft.id}/details`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "저장 실패");
      return false;
    }
    return true;
  }

  async function saveContact(): Promise<boolean> {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/posts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        regionId: regionId || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "저장 실패");
      return false;
    }
    return true;
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/posts/${draft.id}/images`, {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? "업로드 실패");
      return;
    }
    const image = await res.json();
    setImages((prev) => [...prev, image]);
  }

  async function handleRemoveImage(imageId: string) {
    setImages((prev) => prev.filter((i) => i.id !== imageId));
    await fetch(`/api/posts/${draft.id}/images?imageId=${imageId}`, { method: "DELETE" });
  }

  async function handleNext() {
    if (step === 0) {
      if (!(await saveBasic())) return;
    } else if (step === 1) {
      if (!(await saveDetails())) return;
    } else if (step === 2) {
      if (!(await saveContact())) return;
    }
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/posts/${draft.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, languageCodes: selectedLanguages }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError((await res.json().catch(() => null))?.error ?? t("submitError"));
      return;
    }
    router.push("/me/posts");
  }

  const progress = ((step + 1) / STEP_KEYS.length) * 100;
  const sidoList = [...new Set(regions.map((r) => r.sido))];
  const sigunguOptions = regions.filter((r) => r.sido === selectedSido);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">
          {categoryName} · {t(STEP_KEYS[step])}
        </h1>
        <span className="text-xs text-slate-500">
          {step + 1} / {STEP_KEYS.length}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-teal-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {draft.status === "rejected" && draft.rejectionReason && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <strong>{t("rejectionReason")}:</strong> {draft.rejectionReason}
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-title">{t("titleLabel")}</Label>
            <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-content">{t("contentLabel")}</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-40"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <CategoryDetailsFields
          categorySlug={draft.categorySlug}
          details={details}
          onChange={setDetails}
        />
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("regionSido")}</Label>
              <Select
                value={selectedSido}
                onChange={(e) => {
                  setSelectedSido(e.target.value);
                  setRegionId("");
                }}
              >
                <option value="">{t("selectRegionSido")}</option>
                {sidoList.map((sido) => (
                  <option key={sido} value={sido}>
                    {sido}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("regionSigungu")}</Label>
              <Select
                value={regionId}
                disabled={!selectedSido}
                onChange={(e) => setRegionId(e.target.value)}
              >
                <option value="">{t("selectRegionSigungu")}</option>
                {sigunguOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.sigungu ?? r.sido}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-name">{t("contactName")}</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact-phone">{t("contactPhone")}</Label>
            <Input
              id="contact-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt="" className="size-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {t("primaryPhoto")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  aria-label={t("removePhoto")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-600">
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImageIcon className="size-5" />
              )}
              <span className="text-xs">{t("addPhoto")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-3">
          {(
            [
              ["original_only", t("originalOnly")],
              ["selected", t("selectedLanguages")],
              ["all", t("allLanguages")],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-3"
            >
              <input
                type="radio"
                name="translation-mode"
                checked={mode === value}
                onChange={() => setMode(value)}
              />
              <span className="text-sm font-medium text-slate-800">{label}</span>
            </label>
          ))}

          {mode === "selected" && (
            <div className="flex flex-wrap gap-2 pl-2">
              {languages.map((l) => {
                const active = selectedLanguages.includes(l.code);
                return (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() =>
                      setSelectedLanguages((prev) =>
                        active ? prev.filter((c) => c !== l.code) : [...prev, l.code],
                      )
                    }
                  >
                    <Badge variant={active ? "accent" : "outline"}>
                      {l.flagEmoji} {l.nameNative}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{content}</p>
          </div>
          <p className="text-xs text-slate-500">
            제출 후 관리자 승인이 완료되면 게시됩니다.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0">
        <div className="mx-auto flex max-w-2xl gap-2">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
              {tCommon("back")}
            </Button>
          )}
          {step < STEP_KEYS.length - 1 ? (
            <Button size="lg" className="flex-1" disabled={saving} onClick={handleNext}>
              {saving ? t("saving") : tCommon("next")}
            </Button>
          ) : (
            <Button size="lg" className="flex-1" disabled={submitting} onClick={handleSubmit}>
              {submitting ? t("submitting") : t("submitForReview")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
