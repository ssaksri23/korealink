import { getTranslations } from "next-intl/server";
import { Send } from "lucide-react";
import { listPublicTelegramChannels } from "@/lib/distribution";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ChannelsPage() {
  const [t, channels] = await Promise.all([
    getTranslations("channels"),
    listPublicTelegramChannels(),
  ]);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-slate-500">{t("subtitle")}</p>

      {channels.length === 0 ? (
        <p className="text-center text-slate-500">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {channels.map((c) => (
            <Card key={c.languageCode} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.flagEmoji}</span>
                <p className="font-semibold text-slate-900">{c.nameNative}</p>
              </div>
              <Button asChild size="sm">
                <a
                  href={`https://t.me/${c.telegramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="size-4" />
                  {t("join")}
                </a>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
