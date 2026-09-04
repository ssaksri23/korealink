import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const bodySchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  let admin;
  try {
    admin = await requireRole("admin", "super_admin");
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: verification } = await supabase
    .from("company_verifications")
    .select("company_id")
    .eq("id", id)
    .maybeSingle();

  if (!verification) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { error: verificationError } = await supabase
    .from("company_verifications")
    .update({
      status: parsed.data.decision,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.decision === "rejected" ? parsed.data.reason ?? null : null,
    })
    .eq("id", id);
  if (verificationError) {
    return NextResponse.json({ error: verificationError.message }, { status: 500 });
  }

  const { error: companyError } = await supabase
    .from("companies")
    .update({
      verification_status: parsed.data.decision === "approved" ? "verified" : "rejected",
    })
    .eq("id", verification.company_id);
  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "company_verification", "companies", verification.company_id, {
    decision: parsed.data.decision,
  });

  return NextResponse.json({ ok: true });
}
