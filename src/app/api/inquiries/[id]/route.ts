import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // RLS(inquiries_delete_own_or_post_owner_or_admin)가 작성자 본인/게시글
  // 소유자/관리자 외에는 걸러내므로, 여기서는 결과가 없으면 곧 404로 처리한다.
  const { data, error } = await supabase
    .from("inquiries")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found or not deletable" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
