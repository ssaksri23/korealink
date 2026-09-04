import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">{t("termsTitle")}</h1>
      <p className="mb-6 text-sm text-amber-600">{t("koreanOnlyNotice")}</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">제1조 (목적)</h2>
          <p>
            이 약관은 코리아링크(이하 &ldquo;회사&rdquo;)가 제공하는 다국어 생활정보
            플랫폼 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 이용자의
            권리·의무 및 책임사항, 이용조건 및 절차 등 기본적인 사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">제2조 (정의)</h2>
          <p>
            1. &ldquo;이용자&rdquo;란 이 약관에 따라 서비스를 이용하는 회원 및
            비회원을 말합니다.
            <br />
            2. &ldquo;게시물&rdquo;이란 이용자가 서비스 이용 과정에서 게시한 문자,
            사진, 첨부파일 등 일체의 정보를 말합니다.
            <br />
            3. &ldquo;광고주&rdquo;란 서비스 내 업체 홍보, 구인 등 상업적 목적의
            게시물을 등록하는 이용자를 말합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제3조 (서비스의 성격 및 회사의 지위)
          </h2>
          <p>
            1. 회사는 이용자 간 정보 교환(구인·구직, 업체 홍보, 중고거래, 부동산·숙소,
            공동구매, 행사·모임 등)을 위한 &ldquo;정보 제공 매개 플랫폼&rdquo;을
            운영하며, 이용자 간 실제 거래·계약·고용의 당사자가 아닙니다.
            <br />
            2. 회사는 게시물에 기재된 근로조건, 거래조건, 가격, 상품의 하자 유무 등의
            정확성·진실성·적법성을 보증하지 않으며, 이용자 간 거래로 발생하는 분쟁에
            대해 원칙적으로 책임을 지지 않습니다. 다만 회사는 안전한 이용 환경을 위해
            제6조에 따른 게시물 관리 및 모니터링을 성실히 수행합니다.
            <br />
            3. 이용자는 계약, 취업, 거래를 진행하기 전에 상대방 및 조건을 반드시
            직접 확인해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제4조 (회원가입 및 이용계약의 성립)
          </h2>
          <p>
            1. 이용계약은 이용자가 약관에 동의하고 회원가입을 신청한 후, 회사가 이를
            승낙함으로써 성립합니다.
            <br />
            2. 회사는 허위 정보 기재, 타인 명의 도용 등의 사유가 있는 경우 가입을
            거절하거나 사후에 이용계약을 해지할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제5조 (금지행위 및 금지 게시물)
          </h2>
          <p className="mb-2">이용자는 서비스 이용과 관련하여 다음 각 호의 행위를 해서는 안 됩니다.</p>
          <p>
            1. 마약류·불법의약품·불법대출·도박·성매매·성인광고 등 관계 법령에서
            금지하는 물품·서비스의 게시, 광고, 알선, 유인
            <br />
            2. 허위 구인·구직 정보, 임금 체불 등 불법 고용조건을 통한 사기 또는 불법
            취업 알선
            <br />
            3. 타인의 명예, 초상권, 개인정보, 저작권 등 권리를 침해하는 행위
            <br />
            4. 회사 또는 제3자를 사칭하거나 게시물의 출처·작성자 정보를 허위로
            기재하는 행위
            <br />
            5. 서비스의 정상적인 운영을 방해하는 행위(반복 게시, 스팸, 자동화된
            비정상 접근 등)
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제6조 (게시물의 관리 및 임시조치)
          </h2>
          <p>
            1. 회사는 이용자가 등록한 게시물이 제5조 각 호에 해당하거나 관계 법령을
            위반한다고 판단되는 경우, 사전 통지 없이 게시물을 삭제, 임시조치(비공개
            처리) 하거나 회원의 이용을 제한할 수 있습니다.
            <br />
            2. 모든 게시물은 게시 전 회사의 검수(승인) 절차를 거치며, 승인 후에도
            신고가 누적되거나 위반 사실이 확인되면 즉시 비공개될 수 있습니다.
            <br />
            3. 게시물로 인해 권리를 침해받았다고 주장하는 자는 제7조의 절차에 따라
            해당 게시물에 대한 삭제 또는 임시조치를 요청할 수 있습니다(정보통신망
            이용촉진 및 정보보호 등에 관한 법률 제44조의2에 따른 조치를 포함합니다).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제7조 (신고 및 게시중단요청)
          </h2>
          <p>
            이용자는 서비스 내 신고 기능 또는 아래 연락처를 통해 불법·유해 게시물을
            신고하거나 게시중단을 요청할 수 있습니다. 자세한 처리 절차는{" "}
            <Link href="/report-policy" className="text-teal-700 hover:underline">
              신고 및 게시중단요청 정책
            </Link>
            을 따릅니다.
            <br />
            연락처: {t("contactEmail")}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제8조 (광고상품 이용 및 결제)
          </h2>
          <p>
            1. 유료 광고상품(긴급 표시, 상단 고정, 다국어 게시, 텔레그램 배포 등)의
            가격 및 이용조건은 서비스 내 화면에 별도로 안내합니다.
            <br />
            2. 결제는 무통장입금 방식으로 진행되며, 입금 확인 후 상품이 적용됩니다.
            아직 이용을 시작하지 않은 상품에 한해 환불을 요청할 수 있으며, 자세한
            사항은 제7조의 연락처로 문의합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">제9조 (면책조항)</h2>
          <p>
            회사는 천재지변, 회원의 귀책사유, 제3자의 고의적인 서비스 방해 등
            회사가 통제할 수 없는 사유로 발생한 손해에 대해 책임을 지지 않습니다.
            회사는 이용자 상호간 또는 이용자와 제3자 간에 서비스를 매개로 발생한
            분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를 배상할 책임을 지지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            제10조 (분쟁해결 및 준거법)
          </h2>
          <p>
            이 약관은 대한민국 법령에 따라 규율되고 해석되며, 서비스 이용과 관련하여
            발생한 분쟁에 대한 소송은 민사소송법상의 관할법원에 제기합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">부칙</h2>
          <p>이 약관은 2026년 9월 4일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
