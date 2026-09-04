import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { getMyOrder } from "@/lib/orders";
import { getSystemSetting } from "@/lib/system-settings";
import { DepositForm } from "@/components/orders/deposit-form";
import { Badge } from "@/components/ui/badge";

interface BankAccountInfo {
  bank: string;
  accountNumber: string;
  accountHolder: string;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const [order, bankInfo] = await Promise.all([
    getMyOrder(id, user!.id),
    getSystemSetting<BankAccountInfo>("bank_account_info"),
  ]);

  if (!order) notFound();

  const hasBankInfo = bankInfo?.bank && bankInfo?.accountNumber;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-4 text-xl font-bold text-slate-900">주문 상세</h1>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-slate-900">{order.productName}</p>
          <Badge variant="outline">{order.status}</Badge>
        </div>
        <p className="text-lg font-bold text-teal-700">
          {order.totalPrice.toLocaleString()}원
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
        <p className="mb-2 font-semibold text-slate-800">입금 안내</p>
        {hasBankInfo ? (
          <p className="text-slate-700">
            {bankInfo!.bank} {bankInfo!.accountNumber} (예금주: {bankInfo!.accountHolder})
          </p>
        ) : (
          <p className="text-amber-600">
            입금 계좌가 아직 등록되지 않았습니다. 관리자에게 문의해주세요.
          </p>
        )}
      </div>

      {order.payment?.status === "waiting" && (
        <div className="mt-4">
          <DepositForm orderId={order.id} initialName={order.payment.depositorName ?? ""} />
        </div>
      )}

      {order.payment?.status === "confirmed" && (
        <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
          입금이 확인되어 상품이 적용되었습니다.
        </p>
      )}
    </div>
  );
}
