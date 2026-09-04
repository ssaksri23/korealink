import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyAdmin } from "@/lib/telegram";

const bodySchema = z.object({
  displayName: z.string().max(50),
  email: z.string().max(200),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  await notifyAdmin(`👤 새 회원가입\n${parsed.data.displayName} (${parsed.data.email})`);

  return NextResponse.json({ ok: true });
}
