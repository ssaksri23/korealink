import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_SLUGS } from "@/lib/validation/post";

const bodySchema = z.object({ categorySlug: z.enum(CATEGORY_SLUGS) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parsed.data.categorySlug)
    .maybeSingle();

  if (categoryError || !category) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      category_id: category.id,
      created_by: user.id,
      status: "draft",
      original_language_code: "ko",
    })
    .select("id")
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: postError?.message ?? "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ id: post.id });
}
