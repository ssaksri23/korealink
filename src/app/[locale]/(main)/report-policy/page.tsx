import { getTranslations } from "next-intl/server";

export default async function ReportPolicyPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">{t("reportPolicyTitle")}</h1>
      <p className="mb-6 text-sm text-amber-600">{t("koreanOnlyNotice")}</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            코리아링크는 이용자가 게시한 정보를 매개하는 플랫폼으로서, 불법·유해
            게시물로부터 이용자를 보호하기 위해 아래와 같은 신고 및 게시중단요청
            절차를 운영합니다. 이는 「정보통신망 이용촉진 및 정보보호 등에 관한
            법률」 제44조의2(정보의 삭제요청 등)에 따른 절차를 포함합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            1. 신고 대상이 되는 게시물
          </h2>
          <p>
            · 마약류, 불법의약품 등 법령으로 금지된 물품·서비스의 판매·광고
            <br />
            · 성매매·성인광고, 도박, 불법대출
            <br />
            · 허위 구인정보, 임금체불 등 사기·불법 취업 의심 게시물
            <br />
            · 명예훼손, 개인정보 무단 노출, 저작권 침해 등 타인의 권리를 침해하는
            게시물
            <br />· 거래 완료 후 미삭제, 중복 게시 등 서비스 운영 정책 위반 게시물
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            2. 신고 방법
          </h2>
          <p>
            게시물 상세 화면의 &ldquo;신고&rdquo; 버튼을 이용하거나, 아래 연락처로
            게시물 링크와 사유를 보내주시면 접수됩니다.
            <br />
            연락처: {t("contactEmail")}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            3. 처리 절차
          </h2>
          <p>
            1) 신고가 접수되면 관리자가 게시물을 검토합니다.
            <br />
            2) 동일 게시물에 대해 신고가 일정 건수 이상 누적되면, 관리자 확인 전이라도
            자동으로 비공개(숨김) 처리됩니다.
            <br />
            3) 위반 사실이 확인되면 게시물을 삭제하거나 작성자의 서비스 이용을
            제한할 수 있습니다. 불법행위(마약, 사기 등)로 의심되는 경우 수사기관에
            신고하거나 관련 자료를 제공할 수 있습니다.
            <br />
            4) 신고 처리 결과는 처리 내역으로 기록되어 이후 확인이 가능합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            4. 게시중단요청(권리침해 주장)
          </h2>
          <p>
            자신의 명예, 개인정보, 저작권 등 권리가 게시물로 인해 침해되었다고
            주장하는 자는 침해 사실을 소명하는 자료와 함께 위 연락처로
            게시중단(임시조치)을 요청할 수 있습니다. 회사는 요청을 받은 즉시 해당
            게시물에 대해 임시조치(비공개 처리)를 할 수 있으며, 필요한 경우
            게시자에게 소명 기회를 부여합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
