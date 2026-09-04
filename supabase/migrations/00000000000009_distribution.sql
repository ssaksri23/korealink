-- KoreaLink: 언어별 텔레그램 채널 배포

create table public.distribution_channels (
  id uuid primary key default gen_random_uuid(),
  language_code text not null references public.languages(code),
  platform text not null default 'telegram',
  channel_name text not null,
  telegram_chat_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_distribution_channels_updated_at before update on public.distribution_channels
  for each row execute function public.set_updated_at();
create index idx_distribution_channels_language on public.distribution_channels(language_code);

create table public.distribution_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  language_code text not null references public.languages(code),
  channel_id uuid not null references public.distribution_channels(id),
  requested_by uuid references public.profiles(id),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sending','completed','failed','retrying')),
  telegram_message_id text,
  error_message text
);
create index idx_distribution_logs_post on public.distribution_logs(post_id);
create index idx_distribution_logs_status on public.distribution_logs(status);
