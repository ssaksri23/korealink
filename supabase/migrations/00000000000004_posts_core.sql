-- KoreaLink: 게시글 핵심 (posts / 번역 / 상태이력 / 이미지 / 채팅방 출처)

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  company_id uuid references public.companies(id),
  created_by uuid not null references public.profiles(id),
  status text not null default 'draft' check (status in (
    'draft','pending_review','translation_pending','approved','published',
    'expiring','closed','hidden','rejected','blocked','deleted'
  )),
  original_language_code text not null default 'ko' references public.languages(code),
  region_id uuid references public.regions(id),
  share_code text not null unique default public.generate_share_code(),
  view_count int not null default 0,
  is_urgent boolean not null default false,
  is_featured boolean not null default false,
  is_pinned boolean not null default false,
  contact_name text,
  contact_phone text,
  rejection_reason text,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create index idx_posts_category on public.posts(category_id);
create index idx_posts_status on public.posts(status);
create index idx_posts_region on public.posts(region_id);
create index idx_posts_created_by on public.posts(created_by);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_is_urgent on public.posts(is_urgent) where is_urgent = true;
create index idx_posts_expires_at on public.posts(expires_at);
create index idx_posts_share_code on public.posts(share_code);

create or replace function public.owns_post(target_post uuid, target_profile uuid default auth.uid())
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.posts where id = target_post and created_by = target_profile
  );
$$;

create table public.post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  language_code text not null references public.languages(code),
  translated_title text,
  translated_content text,
  translation_status text not null default 'pending' check (translation_status in (
    'pending','translating','translated','review_required','reviewed','failed','re_review_required'
  )),
  translation_source text check (translation_source in ('human','machine','admin_edit')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, language_code)
);
create trigger trg_post_translations_updated_at before update on public.post_translations
  for each row execute function public.set_updated_at();
create index idx_post_translations_post on public.post_translations(post_id);
create index idx_post_translations_language on public.post_translations(language_code);
create index idx_post_translations_status on public.post_translations(translation_status);

-- 원문(등록 시 원본 언어) 내용이 수정되면 다른 언어 번역문을 재검수 상태로 전환
create or replace function public.handle_original_translation_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_original_language text;
begin
  select original_language_code into v_original_language
  from public.posts where id = new.post_id;

  if new.language_code = v_original_language
     and (new.translated_title is distinct from old.translated_title
          or new.translated_content is distinct from old.translated_content) then
    update public.post_translations
    set translation_status = 're_review_required'
    where post_id = new.post_id
      and language_code <> v_original_language
      and translation_status in ('translated','reviewed');
  end if;

  return new;
end;
$$;

create trigger trg_post_translations_original_edit
  after update on public.post_translations
  for each row execute function public.handle_original_translation_update();

create table public.post_status_history (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  from_status text,
  to_status text not null,
  reason text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index idx_post_status_history_post on public.post_status_history(post_id);

-- posts.status 변경 시 자동으로 이력 기록
create or replace function public.record_post_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.post_status_history (post_id, from_status, to_status, reason, changed_by)
    values (
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      new.rejection_reason,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger trg_posts_status_history
  after insert or update of status on public.posts
  for each row execute function public.record_post_status_change();

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_post_images_post on public.post_images(post_id, sort_order);

create table public.post_chat_room_sources (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  chat_room_id uuid not null references public.chat_rooms(id),
  posted_at timestamptz,
  posted_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (post_id, chat_room_id)
);
create index idx_post_chat_room_sources_post on public.post_chat_room_sources(post_id);
create index idx_post_chat_room_sources_room on public.post_chat_room_sources(chat_room_id);
