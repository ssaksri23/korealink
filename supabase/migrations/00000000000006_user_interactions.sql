-- KoreaLink: 북마크 / 최근 본 게시글 / 문의

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, post_id)
);
create index idx_bookmarks_profile on public.bookmarks(profile_id);
create index idx_bookmarks_post on public.bookmarks(post_id);

create table public.recent_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (profile_id, post_id)
);
create index idx_recent_views_profile on public.recent_views(profile_id, viewed_at desc);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id),
  message text not null,
  contact_phone text,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();
create index idx_inquiries_post on public.inquiries(post_id);
create index idx_inquiries_profile on public.inquiries(profile_id);
