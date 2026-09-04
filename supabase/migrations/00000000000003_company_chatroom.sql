-- KoreaLink: 업체 / 업체인증 / 채팅방

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  industry text not null check (industry in (
    'telecom','insurance','bank_remittance','restaurant','grocery','auto',
    'mobile_phone','legal_admin','travel','beauty','hospital','education','other'
  )),
  description text,
  address text,
  business_hours text,
  phone text,
  supported_languages text[] not null default '{}',
  logo_image_url text,
  verification_status text not null default 'none' check (verification_status in (
    'none','requested','reviewing','verified','rejected','suspended'
  )),
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();
create index idx_companies_owner on public.companies(owner_id);
create index idx_companies_industry on public.companies(industry);
create index idx_companies_verification_status on public.companies(verification_status);

-- 인증서류: 일반 사용자에게 비공개, 관리자와 업체 소유자만 조회 가능 (RLS에서 강제)
create table public.company_verifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  business_registration_doc_url text,
  job_placement_license_doc_url text,
  representative_id_doc_url text,
  company_phone text,
  company_address text,
  other_docs jsonb not null default '[]',
  status text not null default 'requested' check (status in ('requested','reviewing','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_company_verifications_updated_at before update on public.company_verifications
  for each row execute function public.set_updated_at();
create index idx_company_verifications_company on public.company_verifications(company_id);
create index idx_company_verifications_status on public.company_verifications(status);

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null check (platform in ('kakao_open','telegram','facebook','naver_cafe','other')),
  language_code text references public.languages(code),
  primary_region_id uuid references public.regions(id),
  primary_category_id uuid references public.categories(id),
  invite_link text,
  manager_contact text,
  is_verified boolean not null default false,
  last_link_checked_at timestamptz,
  is_active boolean not null default true,
  report_count int not null default 0,
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_chat_rooms_updated_at before update on public.chat_rooms
  for each row execute function public.set_updated_at();
create index idx_chat_rooms_language on public.chat_rooms(language_code);
create index idx_chat_rooms_active on public.chat_rooms(is_active);

create table public.chat_room_managers (
  id uuid primary key default gen_random_uuid(),
  chat_room_id uuid not null references public.chat_rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (chat_room_id, profile_id)
);
create index idx_chat_room_managers_profile on public.chat_room_managers(profile_id);

create or replace function public.manages_chat_room(target_chat_room uuid, target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.chat_room_managers
    where chat_room_id = target_chat_room and profile_id = target_profile
  );
$$;
