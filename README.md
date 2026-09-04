# KoreaLink

한국에 거주하는 외국인을 위한 다국어 생활정보 통합 플랫폼.

> "한국에서 필요한 정보, 내 언어로 한곳에서." / "Jobs and life in Korea, in your language."

지원 언어(9개): 러시아어(ru) · 베트남어(vi) · 태국어(th) · 크메르어(km) · 우즈베크어(uz) · 몽골어(mn) · 중국어 간체(zh-CN) · 영어(en) · 한국어(ko)

이 저장소는 전체 기획서 중 **1~4단계(저장소 분석/설계, 프로젝트 골격, DB/RLS, 9개 언어 + 회원가입/로그인/프로필/권한)** 까지 실제로 작동하도록 구현된 MVP입니다. 자세한 체크리스트와 다음 단계는 [`docs/DEVELOPMENT_PLAN.md`](./docs/DEVELOPMENT_PLAN.md)를 참고하세요.

## 기술 스택

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- next-intl (9개 언어 라우팅/메시지)
- Supabase (Postgres + Auth + Storage, RLS)
- React Hook Form + Zod
- lucide-react 아이콘

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. Supabase 대시보드 → SQL Editor에서 `supabase/migrations/` 아래 파일을 **번호 순서대로** 실행합니다.
   (Supabase CLI가 있다면 `supabase link` 후 `supabase db push` 로 한 번에 적용 가능합니다.)
3. 프로젝트 Settings → API에서 `Project URL`, `anon public key`, `service_role key`를 확인합니다.

### 3. 환경변수 설정

```bash
cp .env.example .env.local
```

| 변수 | 필수 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | 권장 | 배포 URL (공유 링크/QR코드 생성 시 사용 예정) |
| `NEXT_PUBLIC_SUPABASE_URL` | **필수** | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **필수** | Supabase anon(public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | 관리자 기능 필요 시 | RLS를 우회하는 서버 전용 키. **절대 브라우저에 노출 금지** (`server-only`로 보호됨) |
| `TRANSLATION_PROVIDER`, `GOOGLE_TRANSLATE_API_KEY`, `DEEPL_API_KEY`, `OPENAI_API_KEY` | 선택 | 자동번역 연동(다음 단계에서 사용 예정). 없어도 사이트는 정상 동작하며 게시글은 "번역 준비 중"으로 표시됨 |
| `TELEGRAM_BOT_TOKEN` | 선택 | 텔레그램 배포 연동(다음 단계에서 사용 예정). 없어도 관리자 화면에 "텔레그램 연동 전"으로 표시될 예정 |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | 선택 | 기본값 `ko` |

`NEXT_PUBLIC_SUPABASE_URL`이 없어도 앱 자체는 죽지 않습니다(언어 선택 화면 등은 `config/languages.ts` fallback으로 동작). 다만 로그인/게시글 등 실제 데이터 기능은 Supabase 연결이 필요합니다.

### 4. 관리자 계정 만들기

1. `/[locale]/signup`으로 일반 회원가입을 합니다 (예: `ko` 로케일이면 `/ko/signup`).
2. Supabase 대시보드 SQL Editor에서 아래 쿼리로 super_admin 권한을 부여합니다.

```sql
insert into public.user_roles (profile_id, role_code)
select id, 'super_admin' from auth.users where email = '본인 가입 이메일';
```

### 5. 실행

```bash
npm run dev       # 개발 서버 (http://localhost:3000)
npm run typecheck # TypeScript 검사
npm run lint      # ESLint
npm run build     # 프로덕션 빌드
```

## 배포

- **Vercel**: 이 저장소를 그대로 Import → 위 환경변수를 Vercel 프로젝트 설정에 등록 → 배포.
- **Docker**: `npm run build` 후 `next start`를 실행하는 표준 Next.js standalone Dockerfile을 구성해 사용할 수 있습니다(이 저장소에는 아직 Dockerfile이 포함되어 있지 않습니다 — 다음 단계 항목).
- 운영 서버 배포는 **사용자 승인 없이 자동으로 수행하지 않습니다.**

## 데이터베이스

- `supabase/migrations/00000000000001_*.sql` ~ `..._014_*.sql` 순서대로 적용합니다.
- 모든 테이블에 Row Level Security가 적용되어 있으며, 프론트엔드 메뉴 숨김이 아니라 **DB 레벨에서 권한을 강제**합니다.
- 실제 Postgres 16 엔진에 전체 마이그레이션을 적용하고, 다음 항목을 직접 검증했습니다.
  - 익명 사용자: `languages`/`categories` 등 공개 테이블만 조회 가능, `profiles`는 0건
  - 일반회원: 본인 draft 게시글만 조회/수정 가능, 타인 draft는 0건 조회·0행 UPDATE
  - admin: 모든 게시글 조회 가능하지만 `user_roles`에 직접 행 삽입은 불가(super_admin 전용 정책이 정상 차단)
  - 원문(원본 언어) 수정 시 다른 언어 번역이 자동으로 `re_review_required`로 전환
  - 신고 5건 누적 시 게시글이 자동으로 `hidden` 처리되고 관리자에게 알림이 정확히 1건 생성
- 위 마이그레이션 전체를 실제 Supabase 프로젝트(`korealink`, 서울 리전, free tier, 월 $0)에도 그대로 적용해
  회원가입 트리거·RLS·시드데이터가 라이브 인프라에서 정상 동작함을 확인했고, Supabase 보안 어드바이저가
  지적한 `search_path` 미고정/트리거 함수 과다노출 경고도 `014_security_hardening.sql`로 조치했습니다
  (프로젝트 접속 정보는 대화창에서 별도로 전달했으며 저장소에는 커밋하지 않았습니다).

`src/lib/supabase/database.types.ts`는 위 마이그레이션과 맞춰 손으로 작성한 최소 타입이며, 실제 프로젝트 연결 후에는 다음 명령으로 자동 생성 타입으로 교체하는 것을 권장합니다.

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/database.types.ts
```

## 현재 실제로 작동하는 기능

- 9개 언어 선택(최초 접속 전체화면) + 쿠키/localStorage 저장 + 로그인 시 `profiles.preferred_language` 우선 적용
- 상단 메뉴 언어 전환(현재 경로/쿼리 유지)
- 회원가입 / 로그인 / 비밀번호 재설정 (Supabase Auth)
- 프로필/역할 조회(`/me`), 로그아웃
- 홈 화면(태그라인, 6개 카테고리 카드 + 실제 게시글 수, 긴급 일자리/신규 게시글 섹션)
- 카테고리별 게시글 목록(`/c/[category]`), 통합검색(`/search`)
- 게시글 상세(`/post/[id]`), 조회수 증가, 원문/번역 우선순위 표시, 공유(클립보드/공유시트), 북마크, 문의 등록, 신고 접수(반복 신고 DB 차단)
- 공유 전용 짧은 URL(`/p/[shareCode]`) → 상세로 리다이렉트
- Supabase RLS로 역할별 데이터 접근 통제(회원가입 시 자동 `user` 역할 부여)

## 아직 작동하지 않는 기능 (다음 세션에서 진행 예정)

- 게시글 등록/수정 폼(12단계, 임시저장, 이미지 업로드), 내 게시글 관리
- 관리자 대시보드(승인/반려/번역검수/신고처리/중복검사/업체인증)
- 광고상품 주문 · 입금확인 플로우
- 카카오 홍보문구/QR코드 생성
- 텔레그램 배포
- 9개 언어 샘플 게시글 시딩
- SEO(sitemap/robots/hreflang/OG 이미지), Docker 배포 구성

## 프로젝트 구조

```
src/
  app/[locale]/            App Router (locale-prefixed)
    select-language/       전체화면 언어 선택 (헤더/하단내비 없음)
    (main)/                헤더+하단내비를 공유하는 일반 화면들
  components/               UI 컴포넌트 (components/ui = shadcn 스타일 프리미티브)
  config/languages.ts        9개 언어 단일 소스 (DB seed와 동기화)
  i18n/                      next-intl 라우팅/메시지 설정
  lib/                       Supabase 클라이언트, 인증/권한, 게시글 조회, 번역 우선순위 로직
  messages/*.json            9개 언어 UI 메시지
supabase/migrations/         SQL 마이그레이션(스키마 + RLS + 시드데이터)
docs/DEVELOPMENT_PLAN.md     체크리스트 / 화면·URL 구조 / ERD / 권한 설계
```
