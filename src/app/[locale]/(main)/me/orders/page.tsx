import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { listMyOrders } from "@/lib/orders";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ORDER_STATUS_LABEL: Record<string, string> = {
  payment_pending: "입금대기",
  deposit_confirmed: "입금확인됨",
  active: "이용중",
  ended: "종료",
  cancelled: "취소",
  refunded: "환불됨",
};

export default async function MyOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const orders = await listMyOrders(user!.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-900">내 주문</h1>

      {orders.length === 0 ? (
        <p className="text-center text-slate-500">주문 내역이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{o.productName}</p>
                  <Badge variant="outline">{ORDER_STATUS_LABEL[o.status] ?? o.status}</Badge>
                </div>
                <p className="text-sm text-teal-700">{o.totalPrice.toLocaleString()}원</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
