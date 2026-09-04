import { getDashboardStats } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

const STAT_CARDS: { key: keyof Awaited<ReturnType<typeof getDashboardStats>>; label: string; href: string }[] = [
  { key: "newUsersToday", label: "오늘 신규회원", href: "/admin" },
  { key: "newPostsToday", label: "오늘 신규 게시글", href: "/admin/posts" },
  { key: "pendingReview", label: "승인대기", href: "/admin/posts?status=pending_review" },
  { key: "rejected", label: "반려 게시글", href: "/admin/posts?status=rejected" },
  { key: "translationPending", label: "번역대기/검수필요", href: "/admin/translations" },
  { key: "reportsReceived", label: "신고접수", href: "/admin/reports" },
  { key: "companyVerificationRequested", label: "업체 인증요청", href: "/admin/companies" },
  { key: "paymentsWaiting", label: "입금확인 대기", href: "/admin/orders" },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_CARDS.map((card) => (
        <Link key={card.key} href={card.href}>
          <Card className="p-4 transition hover:border-teal-400 hover:shadow-md">
            <p className="text-2xl font-bold text-slate-900">{stats[card.key]}</p>
            <p className="mt-1 text-xs text-slate-500">{card.label}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
