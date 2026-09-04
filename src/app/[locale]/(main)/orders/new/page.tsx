import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { listActiveProducts } from "@/lib/orders";
import { ProductPicker } from "@/components/orders/product-picker";

export default async function NewOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ postId?: string }>;
}) {
  const { locale } = await params;
  const { postId } = await searchParams;
  const [user, products] = await Promise.all([getCurrentUser(), listActiveProducts()]);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-900">광고상품 선택</h1>
      <ProductPicker products={products} postId={postId} />
    </div>
  );
}
