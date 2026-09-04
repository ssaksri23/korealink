import { redirect } from "@/i18n/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth/roles";
import { Link } from "@/i18n/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/posts", label: "게시글" },
  { href: "/admin/translations", label: "번역검수" },
  { href: "/admin/reports", label: "신고" },
  { href: "/admin/companies", label: "업체인증" },
  { href: "/admin/products", label: "상품" },
  { href: "/admin/orders", label: "주문·입금" },
  { href: "/admin/distribution", label: "배포관리" },
];

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user || !isAdmin(user)) {
    redirect({ href: "/", locale });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-slate-900">관리자</h1>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-teal-500 hover:text-teal-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
