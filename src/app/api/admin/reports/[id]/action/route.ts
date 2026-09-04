import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin";

const ACTIONS = [
  "no_issue",
  "edit_requested",
  "hidden",
  "deleted",
  "user_warned",
  "user_suspended",
  "company_verification_revoked",
] as const;

const bodySchema = z.object({
  action: z.enum(ACTIONS),
  memo: z.string().max(500).optional(),
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
  const { data: report } = await supabase
    .from("reports")
    .select("id, post_id, company_id")
    .eq("id", id)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { action, memo } = parsed.data;

  if (action === "hidden" && report.post_id) {
    await supabase.from("posts").update({ status: "hidden" }).eq("id", report.post_id);
  } else if (action === "deleted" && report.post_id) {
    await supabase
      .from("posts")
      .update({ status: "deleted", deleted_at: new Date().toISOString() })
      .eq("id", report.post_id);
  } else if (action === "company_verification_revoked" && report.company_id) {
    await supabase
      .from("companies")
      .update({ verification_status: "suspended" })
      .eq("id", report.company_id);
  } else if (action === "user_suspended" && report.post_id) {
    const { data: post } = await supabase
      .from("posts")
      .select("created_by")
      .eq("id", report.post_id)
      .maybeSingle();
    if (post) {
      await supabase.from("profiles").update({ status: "suspended" }).eq("id", post.created_by);
    }
  }

  const { error: actionError } = await supabase.from("report_actions").insert({
    report_id: id,
    action,
    actor_id: admin.id,
    memo: memo ?? null,
  });
  if (actionError) {
    return NextResponse.json({ error: actionError.message }, { status: 500 });
  }

  const { error: statusError } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", id);
  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 });
  }

  await logAdminAction(admin.id, "report_action", "reports", id, { action, memo });

  return NextResponse.json({ ok: true });
}
