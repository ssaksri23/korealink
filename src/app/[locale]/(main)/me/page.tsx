import { getTranslations } from "next-intl/server";
import { ChevronRight, FileText, Bookmark, Receipt, ShieldCheck, Building2 } from "lucide-react";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth/roles";
import { getLanguages } from "@/lib/languages";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, tMe, tRoles, user, languages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("me"),
    getTranslations("roles"),
    getCurrentUser(),
    getLanguages(),
  ]);

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const preferredLanguage = languages.find(
    (l) => l.code === user!.preferredLanguage,
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">{t("me")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user!.displayName ?? user!.email}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-sm text-slate-600">{user!.email}</div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              {tMe("preferredLanguage")}
            </span>
            {preferredLanguage ? (
              <span>
                {preferredLanguage.flagEmoji} {preferredLanguage.nameNative}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-slate-800">
              {tMe("roles")}
            </span>
            {user!.roles.length === 0 ? (
              <Badge variant="outline">{tMe("defaultRole")}</Badge>
            ) : (
              user!.roles.map((r, i) => (
                <Badge key={`${r.code}-${i}`} variant="outline">
                  {tRoles(r.code as never)}
                  {r.scopeLanguageCode ? ` (${r.scopeLanguageCode})` : ""}
                </Badge>
              ))
            )}
          </div>

          <div className="pt-2">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>

      <Card className="divide-y divide-slate-100 overflow-hidden p-0">
        <MenuLink href="/me/posts" icon={FileText} label="내 게시글" />
        <MenuLink href="/me/bookmarks" icon={Bookmark} label="저장한 게시글" />
        <MenuLink href="/me/orders" icon={Receipt} label="내 주문" />
        <MenuLink href="/business/verify" icon={Building2} label="업체 인증 신청" />
        {isAdmin(user) && (
          <MenuLink href="/admin" icon={ShieldCheck} label="관리자" />
        )}
      </Card>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
    >
      <Icon className="size-4.5 text-slate-500" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-slate-400" />
    </Link>
  );
}
