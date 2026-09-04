-- KoreaLink: 알림 / 관리자 로그 / 시스템 설정

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on public.notifications(profile_id, is_read);

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_table text,
  target_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index idx_admin_logs_actor on public.admin_logs(actor_id);
create index idx_admin_logs_created_at on public.admin_logs(created_at desc);

-- 가격/기간/수량/활성상태 등 코드에 하드코딩하지 않고 관리자가 변경할 수 있는 값
create table public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
create trigger trg_system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();
