# KoreaLink 개발 계획 (1단계 산출물)

> 작성일: 2026-09-04
> 저장소 상태: 최초 커밋 없음 (완전 빈 저장소) → 아래 "기존 기술 스택 확인" 결과에 따라 신규로 구성함.

## 1. 저장소 분석 결과

- `git log` 커밋 없음, 추적 파일 없음 → **그린필드 프로젝트**.
- 재사용 가능한 기존 코드 없음. 삭제/충돌 위험 없음.
- 원격: `origin = https://github.com/ssaksri23/korealink`, 작업 브랜치 `claude/korealink-multilingual-mvp-1d4bav`.
- 결론: 명세된 기술스택(Next.js/TS/Tailwind/shadcn/ui/Supabase/next-intl 등)으로 신규 구성.

## 2. 전체 개발 체크리스트

### 2단계 — 기본 골격
- [x] Next.js(App Router) + TypeScript + Tailwind + ESLint 스캐폴딩
- [x] shadcn/ui, lucide-react, react-hook-form, zod, next-intl, @supabase/supabase-js, @supabase/ssr 설치
- [x] 공통 레이아웃(헤더/하단 네비게이션), 에러 바운더리, 로딩 상태
- [x] Supabase 브라우저/서버 클라이언트 유틸

### 3단계 — 다국어
- [x] 9개 언어 config (`config/languages.ts`) — DB `languages` 테이블과 1:1 동기화되는 단일 소스
- [x] `/[locale]/...` 라우팅 (next-intl middleware)
- [x] 언어 선택 전체화면 (최초 접속)
- [x] 언어별 메시지 파일 9종 (UI 문자열)
- [x] 언어 저장: 비회원 = 쿠키+localStorage, 회원 = `profiles.preferred_language`
- [x] 번역 표시 우선순위 유틸 (`lib/i18n/resolveTranslation.ts`)

### 4단계 — DB / 인증
- [x] Supabase 마이그레이션 SQL 작성 (핵심 테이블 전체)
- [x] RLS 정책 (역할 기반, 서버측 강제)
- [x] 회원가입/로그인/비밀번호 재설정 (Supabase Auth)
- [x] `profiles` 자동 생성 트리거, `user_roles` 기본값(`user`) 부여
- [x] 역할 확인 서버 유틸 (`lib/auth/roles.ts`)

### 5단계 — 홈/목록/검색/상세 (이번 세션 범위 내 기본 골격만)
- [x] 홈 화면(로고, 언어/지역 선택, 검색, 6개 카테고리, 섹션 placeholder는 실データ 연동)
- [ ] 카테고리별 목록/필터/URL 쿼리 저장 — **다음 세션**
- [ ] 상세화면 — **다음 세션**

### 6~10단계 (다음 세션에서 계속)
- [ ] 게시글 등록 12단계 폼, 임시저장, 이미지 업로드
- [ ] 관리자 대시보드/승인/번역검수/신고/중복검사/업체인증
- [ ] 광고상품/주문/입금확인/카카오 문구/텔레그램 배포
- [ ] 전체 검사(RLS 테스트, 9언어 레이아웃) 및 README 최종화

> 본 세션(현재 실행)은 사용자 지시 34번 항목의 1~14번, 즉 **분석 → 체크리스트 → 화면/DB 설계 → 프로젝트 골격 → 마이그레이션 → 9개 언어 → 회원가입/로그인/프로필/권한 → 검사/보고**까지를 목표로 함.

## 3. 화면 및 URL 구조

```
/                                → 최초 접속 시 언어 감지 후 /[locale] 로 리다이렉트
/[locale]                        → 홈
/[locale]/select-language        → 언어 선택 (최초/변경 공용)
/[locale]/jobs                   → 일자리 목록
/[locale]/jobs/[postId]          → 일자리 상세
/[locale]/business               → 업체 홍보 목록
/[locale]/business/[postId]      → 업체 상세
/[locale]/used                   → 중고거래 목록
/[locale]/used/[postId]          → 중고거래 상세
/[locale]/housing                → 부동산·숙소 목록
/[locale]/housing/[postId]       → 숙소 상세
/[locale]/groupbuy                → 공동구매 목록
/[locale]/groupbuy/[postId]       → 공동구매 상세
/[locale]/events                 → 행사·모임 목록
/[locale]/events/[postId]        → 행사 상세
/[locale]/search                 → 통합 검색 (쿼리스트링에 필터 저장)
/[locale]/write                  → 게시글 등록 (단계형)
/[locale]/write/[postId]         → 게시글 수정/이어쓰기
/[locale]/me                     → 내 정보
/[locale]/me/posts               → 내 게시글 (상태/반려사유 확인)
/[locale]/me/bookmarks           → 저장한 글
/[locale]/me/recent              → 최근 본 글
/[locale]/me/inquiries           → 문의 내역
/[locale]/login /signup /reset-password
/[locale]/admin/...              → 관리자 (역할 검사 후 접근)
/p/[shareCode]                   → 게시글 고유 공유 URL (언어 자동 감지 후 상세로 redirect)
```

하단 고정 메뉴: 홈 / 검색 / 글쓰기 / 저장 / 내 정보 (5개, `[locale]` 유지하며 이동).

## 4. 데이터베이스 ERD 요약 (텍스트)

```
profiles (1) ──< user_roles >── (1) roles
profiles (1) ──< posts (created_by)
profiles (1) ──< companies (owner_id)
companies (1) ──< company_verifications
companies (1) ──< posts (company_id, nullable)

posts (1) ──< post_translations (UNIQUE post_id+language_code)
posts (1) ──< post_status_history
posts (1) ──< post_images
posts (1) ──< post_chat_room_sources >── (1) chat_rooms
posts (1) ──1 job_details / business_details / used_item_details
                     / housing_details / group_buy_details / event_details
        (category 값에 따라 해당 details 테이블에 1행)

posts (1) ──< bookmarks (profile_id)
posts (1) ──< recent_views (profile_id)
posts (1) ──< inquiries
posts (1) ──< reports ──< report_actions
posts (1) ──< orders (광고상품 적용 단위) ──1 products
orders (1) ──< payments
posts (1) ──< distribution_logs >── (1) distribution_channels

languages (1) ──< post_translations
languages (1) ──< distribution_channels
regions (1) ──< posts / job_details (근무지역)
categories (1) ──< posts

chat_rooms (1) ──< chat_room_managers >── (1) profiles
prohibited_words (language_code FK)
admin_logs (actor_id → profiles)
notifications (profile_id → profiles)
system_settings (key/value, 가격·기간 등 관리자 설정)
```

세부 컬럼은 `supabase/migrations/*.sql` 참조. 모든 테이블 공통 필드: `id uuid pk`, `created_at`, `updated_at`, `created_by`, `status`(해당 테이블에 상태 개념이 있는 경우), `deleted_at`(소프트 삭제).

## 5. 역할별 권한 설계 (요약)

| 역할 | 코드 | 핵심 권한 |
|---|---|---|
| 비회원 | (없음, 세션 없음) | 열람/검색/언어변경/공유 |
| 일반회원 | `user` | 본인 게시글 CRUD(초안), 북마크, 문의, 신고 |
| 광고주 | `advertiser` | 일자리/업체 게시글 등록, 광고상품 주문, 조회수 확인 |
| 채팅방 운영자 | `chatroom_manager` | 본인이 매니저인 chat_rooms 관리 |
| 언어 운영자 | `language_moderator` | 담당 언어(`user_roles.scope_language_code`) 번역검수/신고검토/채팅방(언어별) 관리 |
| 관리자 | `admin` | 승인/반려/번역관리/신고관리/상품관리/입금확인/채널배포/통계 |
| 최고관리자 | `super_admin` | 관리자 전권 + 관리자 계정 관리 + 시스템 설정 + 로그 열람 |

- 역할은 `user_roles(profile_id, role_code, scope_language_code nullable)`로 다대다 저장 (한 사람이 여러 역할 가능, 언어운영자는 scope로 담당 언어 제한).
- 모든 접근 제어는 **Supabase RLS**로 DB 레벨에서 강제하고, 프론트엔드 메뉴 숨김은 UX 보조 수단으로만 사용.
- 서버 액션/라우트 핸들러에서도 `auth.uid()` 기반 재검증 수행(클라이언트 신뢰 금지).

## 6. 번역 우선순위 로직 (요약)

`resolveTranslation(post, locale)`:
1. `post_translations`에서 `language_code = locale` & `translation_status IN ('translated','reviewed')` → 사용
2. 없으면 `language_code = 'ko'` 원문
3. 그것도 없으면 `posts.original_language_code` 원문
4. 그래도 없으면 UI에 "번역 준비 중" + "원문 보기" 버튼 표시

## 7. 다음 세션에서 이어서 진행할 항목
게시글 등록 폼, 목록/필터 실데이터 연동, 관리자 화면, 결제/텔레그램 연동, SEO(sitemap/hreflang), 샘플 데이터 9개 언어 게시글.
