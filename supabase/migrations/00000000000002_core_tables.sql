-- KoreaLink: 핵심 테이블 (프로필/역할/언어/지역/카테고리)

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_by uuid,
  display_name text,
  avatar_url text,
  preferred_language text,
  phone text,
  status text not null default 'active' check (status in ('active','suspended','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.roles (
  code text primary key,
  name_ko text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null references public.roles(code),
  scope_language_code text,
  created_at timestamptz not null default now()
);
create unique index uq_user_roles_profile_role_scope
  on public.user_roles (profile_id, role_code, coalesce(scope_language_code, ''));
create index idx_user_roles_profile on public.user_roles(profile_id);

create table public.languages (
  code text primary key,
  name_native text not null,
  name_korean text not null,
  flag_emoji text not null,
  is_active boolean not null default true,
  display_order int not null default 0,
  translation_enabled boolean not null default true,
  telegram_channel_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_languages_updated_at before update on public.languages
  for each row execute function public.set_updated_at();

alter table public.profiles
  add constraint fk_profiles_preferred_language
  foreign key (preferred_language) references public.languages(code);

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  sido text not null,
  sigungu text,
  eupmyeondong text,
  created_at timestamptz not null default now()
);
create index idx_regions_sido on public.regions(sido);
create index idx_regions_sigungu on public.regions(sigungu);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('jobs','business','used','housing','groupbuy','events')),
  name_ko text not null,
  icon text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ── 신규 회원가입 시 profiles / 기본 역할(user) 자동 생성 ──────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, created_by, display_name, preferred_language)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'ko')
  );

  insert into public.user_roles (profile_id, role_code)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 권한 판별 헬퍼 함수 (RLS 재귀 방지를 위해 security definer 사용) ──────
create or replace function public.has_role(target_role text, target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where profile_id = target_profile and role_code = target_role
  );
$$;

create or replace function public.is_admin(target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where profile_id = target_profile and role_code in ('admin','super_admin')
  );
$$;

create or replace function public.is_super_admin(target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where profile_id = target_profile and role_code = 'super_admin'
  );
$$;

create or replace function public.is_language_moderator(target_language text, target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where profile_id = target_profile
      and role_code = 'language_moderator'
      and scope_language_code = target_language
  );
$$;
