"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";

export function SignupForm() {
  const t = useTranslations("auth");
  const tLegal = useTranslations("legal");
  const locale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    setSuccessMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: values.displayName,
          preferred_language: locale,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccessMessage(t("signupSuccess"));
  }

  if (successMessage) {
    return <p className="text-sm text-teal-700">{successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input id="displayName" autoComplete="name" {...register("displayName")} />
        {errors.displayName && (
          <p className="text-sm text-red-600">{errors.displayName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {errors.confirmPassword.message === "PASSWORD_MISMATCH"
              ? t("confirmPassword")
              : errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Checkbox
          {...register("agreeTerms")}
          label={tLegal.rich("agreeTerms", {
            terms: (chunks) => (
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-teal-700 hover:underline"
              >
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-teal-700 hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        />
        {errors.agreeTerms && (
          <p className="text-sm text-red-600">{tLegal("agreeTermsRequired")}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {t("signup")}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-teal-700 hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
