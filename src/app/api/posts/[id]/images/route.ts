import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: Request,
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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "file too large" }, { status: 400 });
  }

  const { count } = await supabase
    .from("post_images")
    .select("id", { count: "exact", head: true })
    .eq("post_id", id);
  const isFirstImage = (count ?? 0) === 0;

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${id}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("post image upload failed", uploadError);
    return NextResponse.json({ error: "업로드에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(path);

  const { data: image, error: insertError } = await supabase
    .from("post_images")
    .insert({
      post_id: id,
      image_url: publicUrl,
      sort_order: count ?? 0,
      is_primary: isFirstImage,
    })
    .select("id, image_url, sort_order, is_primary")
    .single();

  if (insertError) {
    console.error("post image insert failed", insertError);
    await supabase.storage.from("post-images").remove([path]);
    return NextResponse.json({ error: "업로드에 실패했습니다. 다시 시도해주세요." }, { status: 400 });
  }

  return NextResponse.json(image);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  if (!imageId) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: image } = await supabase
    .from("post_images")
    .select("id, image_url")
    .eq("id", imageId)
    .eq("post_id", id)
    .maybeSingle();

  if (!image) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const path = image.image_url.split("/post-images/")[1];
  if (path) {
    await supabase.storage.from("post-images").remove([path]);
  }

  const { error } = await supabase.from("post_images").delete().eq("id", imageId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
