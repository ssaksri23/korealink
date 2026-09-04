import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface InquiryRow {
  id: string;
  message: string;
  contactPhone: string | null;
  status: string;
  createdAt: string;
  senderName: string | null;
}

export async function listPostInquiries(postId: string): Promise<InquiryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, message, contact_phone, status, created_at, profiles(display_name)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => {
    const sender = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      message: row.message,
      contactPhone: row.contact_phone,
      status: row.status,
      createdAt: row.created_at,
      senderName: sender?.display_name ?? null,
    };
  });
}
