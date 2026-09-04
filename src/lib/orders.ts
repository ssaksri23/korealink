import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProductRow {
  id: string;
  code: string;
  nameKo: string;
  description: string | null;
  price: number;
  durationDays: number | null;
  unit: string | null;
  isActive: boolean;
  sortOrder: number;
}

export async function listActiveProducts(): Promise<ProductRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, code, name_ko, description, price, duration_days, unit, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    code: p.code,
    nameKo: p.name_ko,
    description: p.description,
    price: p.price,
    durationDays: p.duration_days,
    unit: p.unit,
    isActive: p.is_active,
    sortOrder: p.sort_order,
  }));
}

export async function listAllProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, code, name_ko, description, price, duration_days, unit, is_active, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    code: p.code,
    nameKo: p.name_ko,
    description: p.description,
    price: p.price,
    durationDays: p.duration_days,
    unit: p.unit,
    isActive: p.is_active,
    sortOrder: p.sort_order,
  }));
}

export interface OrderRow {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  productName: string;
  postId: string | null;
  payment: { status: string; depositorName: string | null; amount: number } | null;
}

export async function listMyOrders(userId: string): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, post_id, products(name_ko), payments(status, depositor_name, amount)")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((o) => {
    const product = Array.isArray(o.products) ? o.products[0] : o.products;
    const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments;
    return {
      id: o.id,
      status: o.status,
      totalPrice: o.total_price,
      createdAt: o.created_at,
      productName: product?.name_ko ?? "-",
      postId: o.post_id,
      payment: payment
        ? { status: payment.status, depositorName: payment.depositor_name, amount: payment.amount }
        : null,
    };
  });
}

export async function getMyOrder(orderId: string, userId: string): Promise<OrderRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_price, created_at, post_id, products(name_ko), payments(status, depositor_name, amount)")
    .eq("id", orderId)
    .eq("profile_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const product = Array.isArray(data.products) ? data.products[0] : data.products;
  const payment = Array.isArray(data.payments) ? data.payments[0] : data.payments;
  return {
    id: data.id,
    status: data.status,
    totalPrice: data.total_price,
    createdAt: data.created_at,
    productName: product?.name_ko ?? "-",
    postId: data.post_id,
    payment: payment
      ? { status: payment.status, depositorName: payment.depositor_name, amount: payment.amount }
      : null,
  };
}

export interface AdminOrderRow extends OrderRow {
  buyerName: string | null;
  productCode: string;
}

export async function listAdminOrders(statusFilter?: string): Promise<AdminOrderRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, status, total_price, created_at, post_id, products(code, name_ko), payments(status, depositor_name, amount), profiles!orders_profile_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) query = query.eq("status", statusFilter);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((o) => {
    const product = Array.isArray(o.products) ? o.products[0] : o.products;
    const payment = Array.isArray(o.payments) ? o.payments[0] : o.payments;
    const buyer = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
    return {
      id: o.id,
      status: o.status,
      totalPrice: o.total_price,
      createdAt: o.created_at,
      postId: o.post_id,
      productName: product?.name_ko ?? "-",
      productCode: product?.code ?? "",
      buyerName: buyer?.display_name ?? null,
      payment: payment
        ? { status: payment.status, depositorName: payment.depositor_name, amount: payment.amount }
        : null,
    };
  });
}
