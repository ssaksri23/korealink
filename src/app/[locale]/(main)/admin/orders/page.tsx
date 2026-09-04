import { listAdminOrders } from "@/lib/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminOrderConfirmAction } from "@/components/admin/order-confirm-action";

const ORDER_STATUS_LABEL: Record<string, string> = {
  payment_pending: "입금대기",
  deposit_confirmed: "입금확인됨",
  active: "이용중",
  ended: "종료",
  cancelled: "취소",
  refunded: "환불됨",
};

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div>
      {orders.length === 0 ? (
        <p className="py-10 text-center text-slate-500">주문이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{o.productName}</p>
                <Badge variant="outline">{ORDER_STATUS_LABEL[o.status] ?? o.status}</Badge>
                {o.payment && <Badge variant="outline">입금:{o.payment.status}</Badge>}
              </div>
              <p className="text-sm text-slate-600">
                주문자: {o.buyerName ?? "-"} · {o.totalPrice.toLocaleString()}원
              </p>
              {o.payment?.depositorName && (
                <p className="text-sm text-slate-600">
                  입금자명: {o.payment.depositorName}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {new Date(o.createdAt).toLocaleString()}
              </p>
              {o.payment?.status === "waiting" && (
                <AdminOrderConfirmAction orderId={o.id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
