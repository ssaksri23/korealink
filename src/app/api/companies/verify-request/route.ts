import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";

const INDUSTRIES = [
  "telecom", "insurance", "bank_remittance", "restaurant", "grocery", "auto",
  "mobile_phone", "legal_admin", "travel", "beauty", "hospital", "education", "other",
] as const;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

async function uploadDoc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("company-docs")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const supportedLanguages = formData.getAll("supportedLanguages").map(String);

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "업체명을 입력해주세요." }, { status: 400 });
  }
  if (!INDUSTRIES.includes(industry as (typeof INDUSTRIES)[number])) {
    return NextResponse.json({ error: "업종을 선택해주세요." }, { status: 400 });
  }

  const businessRegistrationDoc = formData.get("businessRegistrationDoc");
  const jobPlacementLicenseDoc = formData.get("jobPlacementLicenseDoc");
  const representativeIdDoc = formData.get("representativeIdDoc");

  if (!(businessRegistrationDoc instanceof File) || !(representativeIdDoc instanceof File)) {
    return NextResponse.json(
      { error: "사업자등록증과 담당자 신분증은 필수입니다." },
      { status: 400 },
    );
  }

  for (const f of [businessRegistrationDoc, jobPlacementLicenseDoc, representativeIdDoc]) {
    if (!(f instanceof File)) continue;
    if (!ALLOWED_MIME_TYPES.includes(f.type)) {
      return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
    }
    if (f.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "파일 용량이 너무 큽니다(최대 10MB)." }, { status: 400 });
    }
  }

  // 이미 본인 소유 업체가 있으면 재사용(정보 갱신), 없으면 새로 생성한다.
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  let companyId: string;
  if (existingCompany) {
    companyId = existingCompany.id;
    const { error } = await supabase
      .from("companies")
      .update({
        name,
        industry: industry as (typeof INDUSTRIES)[number],
        description,
        address,
        phone,
        supported_languages: supportedLanguages,
        verification_status: "requested",
      })
      .eq("id", companyId);
    if (error) {
      return NextResponse.json({ error: "저장에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
    }
  } else {
    const { data: created, error } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        created_by: user.id,
        name,
        industry: industry as (typeof INDUSTRIES)[number],
        description,
        address,
        phone,
        supported_languages: supportedLanguages,
        verification_status: "requested",
      })
      .select("id")
      .single();
    if (error || !created) {
      return NextResponse.json({ error: "저장에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
    }
    companyId = created.id;
  }

  try {
    const [businessRegistrationPath, jobPlacementLicensePath, representativeIdPath] =
      await Promise.all([
        uploadDoc(supabase, user.id, businessRegistrationDoc),
        jobPlacementLicenseDoc instanceof File
          ? uploadDoc(supabase, user.id, jobPlacementLicenseDoc)
          : Promise.resolve(null),
        uploadDoc(supabase, user.id, representativeIdDoc),
      ]);

    const { error: verificationError } = await supabase.from("company_verifications").insert({
      company_id: companyId,
      business_registration_doc_url: businessRegistrationPath,
      job_placement_license_doc_url: jobPlacementLicensePath,
      representative_id_doc_url: representativeIdPath,
      company_phone: phone,
      company_address: address,
      status: "requested",
      created_by: user.id,
    });
    if (verificationError) {
      console.error("company_verifications insert failed", verificationError);
      return NextResponse.json({ error: "제출에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
    }
  } catch (err) {
    console.error("company doc upload failed", err);
    return NextResponse.json({ error: "서류 업로드에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
  }

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/ko/admin/companies`;
  await notifyAdmin(`🏢 업체인증 요청 접수됨\n업체명: ${name}\n\n확인하러 가기: ${adminUrl}`);

  return NextResponse.json({ ok: true });
}
