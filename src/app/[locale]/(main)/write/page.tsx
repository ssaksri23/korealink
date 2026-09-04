import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/roles";
import { getCategories } from "@/lib/categories";
import { CategoryPicker } from "@/components/write/category-picker";

export default async function WriteEntryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [user, categories, tWrite, tCategories] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getTranslations("write"),
    getTranslations("categories"),
  ]);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-900">
        {tWrite("chooseCategory")}
      </h1>
      <CategoryPicker
        categories={categories.map((c) => ({
          slug: c.slug,
          icon: c.icon,
          name: tCategories(`${c.slug}.name` as never),
          description: tCategories(`${c.slug}.description` as never),
        }))}
      />
    </div>
  );
}
