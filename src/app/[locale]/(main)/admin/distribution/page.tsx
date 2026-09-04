import {
  isTelegramConfigured,
  listDistributionChannels,
  listDistributionLogs,
} from "@/lib/distribution";
import { listAdminPosts } from "@/lib/admin";
import { getLanguages } from "@/lib/languages";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DistributionChannelForm } from "@/components/admin/distribution-channel-form";
import { DistributionChannelToggle } from "@/components/admin/distribution-channel-toggle";
import { DistributionRequestForm } from "@/components/admin/distribution-request-form";

export default async function AdminDistributionPage() {
  const [configured, channels, logs, publishedPosts, languages] = await Promise.all([
    isTelegramConfigured(),
    listDistributionChannels(),
    listDistributionLogs(),
    listAdminPosts("published"),
    getLanguages(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {configured ? (
        <div className="rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
          TELEGRAM_BOT_TOKEN이 설정되어 있습니다. (단, 안전을 위해 이번 빌드에서는 실제 발송 기능은 아직
          구현되어 있지 않으며, 배포 요청은 큐/로그로만 기록됩니다.)
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          텔레그램 연동 전입니다 (TELEGRAM_BOT_TOKEN 환경변수 미설정). 배포 요청은 실제 발송 없이
          큐/로그로만 기록됩니다.
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">배포 요청</h2>
        <Card className="p-4">
          <DistributionRequestForm
            posts={publishedPosts.map((p) => ({ id: p.id, title: p.title }))}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">배포 채널</h2>
        <Card className="mb-3 p-4">
          <DistributionChannelForm languages={languages} />
        </Card>
        {channels.length === 0 ? (
          <p className="text-sm text-slate-500">등록된 채널이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {channels.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {c.channelName} <span className="text-slate-400">({c.languageCode})</span>
                  </p>
                  <p className="text-xs text-slate-500">{c.telegramChatId ?? "chat id 미등록"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.isActive ? "success" : "outline"}>
                    {c.isActive ? "활성" : "비활성"}
                  </Badge>
                  <DistributionChannelToggle channelId={c.id} isActive={c.isActive} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">최근 배포 로그</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">배포 기록이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map((l) => (
              <Card key={l.id} className="p-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{l.postTitle ?? "(제목 없음)"}</span>
                  <Badge variant="outline">{l.channelName}</Badge>
                  <Badge variant="outline">{l.languageCode}</Badge>
                  <Badge variant={l.status === "completed" ? "success" : "urgent"}>{l.status}</Badge>
                </div>
                {l.errorMessage && <p className="text-xs text-slate-500">{l.errorMessage}</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(l.requestedAt).toLocaleString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
