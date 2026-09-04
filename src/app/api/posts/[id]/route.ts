import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDraftPost } from "@/lib/posts-write";

const patchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  content: z.string().min(2).max(5000).optional(),
  regionId: z.string().uuid().nullable().optional(),
  contactName: z.string().max(50).nullable().optional(),
  contactPhone: z.string().max(30).nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const draft = await getDraftPost(id);
  if (!draft) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(draft);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { title, content, regionId, contactName, contactPhone } = parsed.data;

  if (regionId !== undefined || contactName !== undefined || contactPhone !== undefined) {
    const postUpdate: {
      region_id?: string | null;
      contact_name?: string | null;
      contact_phone?: string | null;
    } = {};
    if (regionId !== undefined) postUpdate.region_id = regionId;
    if (contactName !== undefined) postUpdate.contact_name = contactName;
    if (contactPhone !== undefined) postUpdate.contact_phone = contactPhone;

    const { error } = await supabase.from("posts").update(postUpdate).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (title !== undefined || content !== undefined) {
    const { data: post } = await supabase
      .from("posts")
      .select("original_language_code")
      .eq("id", id)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { error } = await supabase.from("post_translations").upsert(
      {
        post_id: id,
        language_code: post.original_language_code,
        ...(title !== undefined ? { translated_title: title } : {}),
        ...(content !== undefined ? { translated_content: content } : {}),
        translation_source: "human",
        created_by: user.id,
      },
      { onConflict: "post_id,language_code" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

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

  // RLS(posts_update_owner_or_admin)가 소유자의 draft/pending_review/rejected 상태만 UPDATE를
  // 허용하므로, 그 외 상태(published 등)를 삭제 시도하면 0행이 갱신되어 아래에서 404로 처리된다.
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
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
