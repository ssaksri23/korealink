import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { getLanguages } from "@/lib/languages";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLE_LABEL_KO: Record<string, string> = {
  user: "일반회원",
  advertiser: "광고주",
  chatroom_manager: "채팅방 운영자",
  language_moderator: "언어 운영자",
  admin: "관리자",
  super_admin: "최고관리자",
};

export default async function MePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, user, languages] = await Promise.all([
    getTranslations("nav"),
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
            <span className="font-medium text-slate-800">선호 언어</span>
            {preferredLanguage ? (
              <span>
                {preferredLanguage.flagEmoji} {preferredLanguage.nameNative}
              </span>
            ) : (
              <span>—</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-slate-800">역할</span>
            {user!.roles.length === 0 ? (
              <Badge variant="outline">일반회원</Badge>
            ) : (
              user!.roles.map((r, i) => (
                <Badge key={`${r.code}-${i}`} variant="outline">
                  {ROLE_LABEL_KO[r.code] ?? r.code}
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
    </div>
  );
}
