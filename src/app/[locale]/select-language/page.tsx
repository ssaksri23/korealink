import { getLanguages } from "@/lib/languages";
import { LanguageSelectScreen } from "@/components/language-select-screen";

export default async function SelectLanguagePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [languages, { next }] = await Promise.all([
    getLanguages(),
    searchParams,
  ]);

  return <LanguageSelectScreen languages={languages} nextPath={next} />;
}
