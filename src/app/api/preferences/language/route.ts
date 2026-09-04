import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupportedLocale } from "@/config/languages";

const bodySchema = z.object({ locale: z.string() });

/**
 * 로그인한 사용자가 언어를 변경하면 profiles.preferred_language 에도 저장한다.
 * 비회원은 쿠키/localStorage만으로 충분하므로 이 API는 로그인 사용자에 한해 동작한다.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isSupportedLocale(parsed.data.locale)) {
    return NextResponse.json({ error: "invalid locale" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true, saved: false });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ preferred_language: parsed.data.locale })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, saved: true });
}
