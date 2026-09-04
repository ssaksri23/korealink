-- KoreaLink: 확장 기능 및 공통 헬퍼
create extension if not exists "pgcrypto";

-- 공통 updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
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
as $$
  select encode(gen_random_bytes(6), 'hex');
$$;
