import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-bold text-slate-900">{t("privacyTitle")}</h1>
      <p className="mb-6 text-sm text-amber-600">{t("koreanOnlyNotice")}</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            코리아링크(이하 &ldquo;회사&rdquo;)는 이용자의 개인정보를 중요시하며,
            「개인정보 보호법」 등 관계 법령을 준수합니다. 회사는 본 개인정보처리방침을
            통해 이용자가 제공하는 개인정보가 어떠한 목적과 방식으로 이용되고 있으며,
            개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            1. 수집하는 개인정보 항목
          </h2>
          <p>
            · 회원가입 시: 이메일, 비밀번호(암호화 저장), 닉네임, 선호 언어
            <br />
            · 서비스 이용 과정에서: 연락처(게시물 등록 시 선택 입력), 게시물 내용,
            신고·문의 내역
            <br />
            · 광고주(업체) 인증 시: 사업자등록증 등 인증서류(관리자만 열람 가능한
            비공개 저장소에 보관)
            <br />
            · 광고상품 결제 시: 입금자명
            <br />· 자동 수집 항목: 접속 로그, 서비스 이용 기록
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">2. 수집 목적</h2>
          <p>
            회원 식별 및 서비스 제공, 게시물 등록·관리·번역, 부정이용 방지 및 신고
            처리, 광고상품 결제 확인, 고객 문의 응대, 법령상 의무 이행을 위해
            개인정보를 이용합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            3. 보유 및 이용기간
          </h2>
          <p>
            회원 탈퇴 시 지체 없이 파기하는 것을 원칙으로 하되, 관계 법령에서
            일정 기간 보존을 요구하는 경우(전자상거래법상 계약·결제 기록 등) 해당
            기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            4. 제3자 제공 및 처리위탁
          </h2>
          <p>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만
            법령에 근거하거나 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.
            서비스 운영을 위해 인프라(데이터베이스·인증·저장소) 제공업체에 처리를
            위탁할 수 있으며, 위탁받은 업체는 개인정보를 위탁 목적 외로 이용하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            5. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 회원 탈퇴를
            통해 이용을 거부할 수 있습니다. 개인정보 열람·정정·삭제·처리정지를
            요구하려면 아래 연락처로 문의해주세요.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            6. 쿠키(Cookie)의 사용
          </h2>
          <p>
            회사는 언어 선택 등 이용자 맞춤 설정을 위해 쿠키 및 브라우저
            저장소(localStorage)를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키
            저장을 거부할 수 있으며, 이 경우 일부 기능 이용에 제한이 있을 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            7. 개인정보 보호책임자
          </h2>
          <p>
            성명: 나선일
            <br />
            연락처: {t("contactEmail")}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">부칙</h2>
          <p>이 개인정보처리방침은 2026년 9월 4일부터 시행합니다.</p>
        </section>
      </div>
    </div>
  );
}
