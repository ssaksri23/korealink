import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-slate-900">
        {t("resetPassword")}
      </h1>
      <ResetPasswordForm />
    </div>
  );
}
