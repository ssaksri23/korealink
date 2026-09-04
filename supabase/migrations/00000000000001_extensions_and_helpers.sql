-- KoreaLink: 확장 기능 및 공통 헬퍼
-- Supabase 호스팅 프로젝트는 pgcrypto를 기본적으로 "extensions" 스키마에 설치한다.
-- generate_share_code()에서 스키마를 명시적으로 지정해 search_path 설정과 무관하게
-- 항상 정상 동작하도록 한다(순수 로컬 Postgres 등 extensions 스키마가 없는 환경에서도
-- 이 문으로 새로 생성되면 동일하게 동작함).
create extension if not exists "pgcrypto" with schema extensions;

-- 공통 updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 짧은 공유코드 생성 (posts.share_code 기본값으로 사용, URL-safe)
create or replace function public.generate_share_code()
returns text
language sql
set search_path = public, extensions
as $$
  select encode(extensions.gen_random_bytes(6), 'hex');
$$;
