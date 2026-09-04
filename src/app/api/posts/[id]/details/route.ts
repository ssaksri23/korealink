import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_DETAIL_TABLE } from "@/lib/posts-write";
import type { PostCategory } from "@/lib/supabase/database.types";

// 카테고리 폼(camelCase) 필드 -> DB 컬럼(snake_case) 매핑
const FIELD_MAP: Record<PostCategory, Record<string, string>> = {
  jobs: {
    industry: "industry",
    wageType: "wage_type",
    wageMin: "wage_min",
    wageMax: "wage_max",
    workHours: "work_hours",
    recruitCount: "recruit_count",
    foreignerAllowed: "foreigner_allowed",
    koreanLevel: "korean_level",
    housingProvided: "housing_provided",
    commuteBusProvided: "commute_bus_provided",
    mealProvided: "meal_provided",
    workPeriod: "work_period",
  },
  business: {
    industry: "industry",
    discountInfo: "discount_info",
  },
  used: {
    category: "category",
    price: "price",
    itemCondition: "item_condition",
    saleStatus: "sale_status",
  },
  housing: {
    propertyType: "property_type",
    deposit: "deposit",
    monthlyRent: "monthly_rent",
    maintenanceFee: "maintenance_fee",
    capacity: "capacity",
    genderCondition: "gender_condition",
  },
  groupbuy: {
    price: "price",
    targetCount: "target_count",
    deadline: "deadline",
    pickupMethod: "pickup_method",
  },
  events: {
    eventType: "event_type",
    eventDate: "event_date",
    eventTime: "event_time",
    venue: "venue",
    fee: "fee",
    capacity: "capacity",
    organizer: "organizer",
    applicationMethod: "application_method",
  },
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, categories(slug)")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const categorySlug = (
    Array.isArray(post.categories) ? post.categories[0] : post.categories
  )?.slug as PostCategory | undefined;
  if (!categorySlug) {
    return NextResponse.json({ error: "category not found" }, { status: 400 });
  }

  const fieldMap = FIELD_MAP[categorySlug];
  const row: Record<string, unknown> = { post_id: id };
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const column = fieldMap[key];
    if (column) row[column] = value;
  }

  const { error } = await supabase
    .from(CATEGORY_DETAIL_TABLE[categorySlug] as "job_details")
    .upsert(row as never, { onConflict: "post_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
