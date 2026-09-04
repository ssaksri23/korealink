import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyCompanyVerification {
  companyId: string;
  companyName: string;
  verificationStatus: string;
  latestRequestStatus: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
}

export async function getMyCompanyVerification(
  userId: string,
): Promise<MyCompanyVerification | null> {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, verification_status")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!company) return null;

  const { data: latest } = await supabase
    .from("company_verifications")
    .select("status, rejection_reason, reviewed_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    companyId: company.id,
    companyName: company.name,
    verificationStatus: company.verification_status,
    latestRequestStatus: latest?.status ?? null,
    rejectionReason: latest?.rejection_reason ?? null,
    reviewedAt: latest?.reviewed_at ?? null,
  };
}
