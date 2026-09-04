import { listProhibitedWords } from "@/lib/prohibited-words";
import { getLanguages } from "@/lib/languages";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProhibitedWordForm } from "@/components/admin/prohibited-word-form";
import { ProhibitedWordDeleteButton } from "@/components/admin/prohibited-word-delete-button";

export default async function AdminProhibitedWordsPage() {
  const [words, languages] = await Promise.all([listProhibitedWords(), getLanguages()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
        여기 등록된 단어가 게시글 제목/본문에 포함되면 &ldquo;차단&rdquo;은 제출 자체가
        막히고, &ldquo;경고만&rdquo;은 제출은 되지만 관리자 검수 시 참고용으로만
        표시됩니다. 마약류·성매매·도박·불법대출 등 명백한 위반어 위주로 등록하고,
        오탐(정상 게시글까지 막힘)이 없는지 주기적으로 확인해주세요.
      </div>

      <Card className="p-4">
        <ProhibitedWordForm languages={languages} />
      </Card>

      {words.length === 0 ? (
        <p className="text-sm text-slate-500">등록된 금칙어가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {words.map((w) => (
            <Card key={w.id} className="flex items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-900">{w.word}</span>
                <Badge variant="outline">{w.languageCode}</Badge>
                <Badge variant={w.severity === "block" ? "urgent" : "outline"}>
                  {w.severity === "block" ? "차단" : "경고만"}
                </Badge>
              </div>
              <ProhibitedWordDeleteButton wordId={w.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
