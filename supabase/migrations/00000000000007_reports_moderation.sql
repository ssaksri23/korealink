-- KoreaLink: 신고 / 신고처리 / 금지어

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  chat_room_id uuid references public.chat_rooms(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  report_type text not null check (report_type in (
    'false_info','wage_mismatch','condition_mismatch','fraud_suspected','illegal_employment',
    'contact_theft','discrimination','adult_ad','gambling','illegal_loan','illegal_drug',
    'not_removed_after_sale','duplicate','other'
  )),
  detail text,
  status text not null default 'received' check (status in ('received','reviewing','resolved')),
  created_at timestamptz not null default now(),
  constraint chk_reports_target check (
    post_id is not null or chat_room_id is not null or company_id is not null
  )
);
create index idx_reports_post on public.reports(post_id);
create index idx_reports_status on public.reports(status);
create index idx_reports_reporter on public.reports(reporter_id);

create table public.report_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  action text not null check (action in (
    'no_issue','edit_requested','hidden','deleted','user_warned','user_suspended','company_verification_revoked'
  )),
  actor_id uuid not null references public.profiles(id),
  memo text,
  created_at timestamptz not null default now()
);
create index idx_report_actions_report on public.report_actions(report_id);

-- 동일 신고자가 같은 대상(게시글)을 반복 신고하는 것을 제한
create unique index uq_reports_reporter_post_open
  on public.reports (reporter_id, post_id)
  where post_id is not null and status <> 'resolved';

-- 신고가 일정 횟수 이상 누적되면 게시글을 자동으로 임시 숨김 처리
create or replace function public.handle_report_threshold()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_count int;
  v_threshold int := 5;
  v_hidden_now boolean := false;
begin
  if new.post_id is not null then
    select count(*) into v_count from public.reports where post_id = new.post_id;
    if v_count >= v_threshold then
      update public.posts set status = 'hidden'
      where id = new.post_id and status not in ('hidden','blocked','deleted');
      v_hidden_now := found;

      -- 임계값을 이번 신고로 처음 넘겨 실제로 숨김 처리된 경우에만 관리자에게 1회 알림
      if v_hidden_now then
        insert into public.notifications (profile_id, type, title, body, link_url)
        select p.profile_id, 'report_threshold', '신고 누적으로 게시글 임시 숨김',
               '신고가 ' || v_threshold || '건 이상 누적되어 자동으로 임시 숨김 처리되었습니다. 검토가 필요합니다.',
               '/admin/reports'
        from public.user_roles p where p.role_code in ('admin','super_admin');
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_reports_threshold
  after insert on public.reports
  for each row execute function public.handle_report_threshold();

create table public.prohibited_words (
  id uuid primary key default gen_random_uuid(),
  language_code text not null references public.languages(code),
  word text not null,
  severity text not null default 'block' check (severity in ('warn','block')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (language_code, word)
);
create index idx_prohibited_words_language on public.prohibited_words(language_code);
