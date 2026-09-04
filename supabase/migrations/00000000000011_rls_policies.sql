-- KoreaLink: Row Level Security
-- 원칙: 프론트엔드 메뉴 숨김에 의존하지 않고 DB 레벨에서 접근을 차단한다.

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.languages enable row level security;
alter table public.regions enable row level security;
alter table public.categories enable row level security;
alter table public.companies enable row level security;
alter table public.company_verifications enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_managers enable row level security;
alter table public.posts enable row level security;
alter table public.post_translations enable row level security;
alter table public.post_status_history enable row level security;
alter table public.job_details enable row level security;
alter table public.business_details enable row level security;
alter table public.used_item_details enable row level security;
alter table public.housing_details enable row level security;
alter table public.group_buy_details enable row level security;
alter table public.event_details enable row level security;
alter table public.post_images enable row level security;
alter table public.post_chat_room_sources enable row level security;
alter table public.bookmarks enable row level security;
alter table public.recent_views enable row level security;
alter table public.inquiries enable row level security;
alter table public.reports enable row level security;
alter table public.report_actions enable row level security;
alter table public.prohibited_words enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.distribution_channels enable row level security;
alter table public.distribution_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;
alter table public.system_settings enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
-- insert는 handle_new_user() 트리거(security definer)로만 수행되므로 별도 insert 정책 불필요

-- ── roles (조회는 로그인 사용자 누구나, 변경은 최고관리자만) ──────────────
create policy "roles_select_authenticated" on public.roles
  for select using (auth.role() = 'authenticated');
create policy "roles_write_super_admin" on public.roles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ── user_roles ──────────────────────────────────────────────────────────
create policy "user_roles_select_own_or_admin" on public.user_roles
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "user_roles_write_super_admin" on public.user_roles
  for insert with check (public.is_super_admin());
create policy "user_roles_update_super_admin" on public.user_roles
  for update using (public.is_super_admin());
create policy "user_roles_delete_super_admin" on public.user_roles
  for delete using (public.is_super_admin());

-- ── languages (공개 조회, 관리자만 수정) ───────────────────────────────
create policy "languages_select_public" on public.languages
  for select using (true);
create policy "languages_write_admin" on public.languages
  for insert with check (public.is_admin());
create policy "languages_update_admin" on public.languages
  for update using (public.is_admin());

-- ── regions / categories (공개 조회, 관리자만 수정) ────────────────────
create policy "regions_select_public" on public.regions for select using (true);
create policy "regions_write_admin" on public.regions for insert with check (public.is_admin());
create policy "regions_update_admin" on public.regions for update using (public.is_admin());

create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_write_admin" on public.categories for insert with check (public.is_admin());
create policy "categories_update_admin" on public.categories for update using (public.is_admin());

-- ── companies ───────────────────────────────────────────────────────────
create policy "companies_select_public_or_owner_or_admin" on public.companies
  for select using (
    (status = 'active' and deleted_at is null)
    or owner_id = auth.uid()
    or public.is_admin()
  );
create policy "companies_insert_authenticated" on public.companies
  for insert with check (auth.uid() = owner_id and auth.uid() = created_by);
create policy "companies_update_owner_or_admin" on public.companies
  for update using (owner_id = auth.uid() or public.is_admin());

-- ── company_verifications (인증서류는 소유자 본인과 관리자만) ─────────
create policy "company_verifications_select_owner_or_admin" on public.company_verifications
  for select using (
    public.is_admin()
    or exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
  );
create policy "company_verifications_insert_owner" on public.company_verifications
  for insert with check (
    exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())
  );
create policy "company_verifications_update_admin" on public.company_verifications
  for update using (public.is_admin());

-- ── chat_rooms ──────────────────────────────────────────────────────────
create policy "chat_rooms_select_public_or_admin" on public.chat_rooms
  for select using (
    (is_active and deleted_at is null)
    or public.manages_chat_room(id)
    or public.is_admin()
    or public.is_language_moderator(language_code)
  );
create policy "chat_rooms_insert_authenticated" on public.chat_rooms
  for insert with check (auth.uid() = created_by);
create policy "chat_rooms_update_manager_or_admin" on public.chat_rooms
  for update using (
    public.manages_chat_room(id) or public.is_admin() or public.is_language_moderator(language_code)
  );

create policy "chat_room_managers_select" on public.chat_room_managers
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "chat_room_managers_write_admin" on public.chat_room_managers
  for insert with check (public.is_admin());
create policy "chat_room_managers_delete_admin" on public.chat_room_managers
  for delete using (public.is_admin());

-- ── posts ───────────────────────────────────────────────────────────────
create policy "posts_select_published_or_owner_or_admin" on public.posts
  for select using (
    (status = 'published' and deleted_at is null)
    or created_by = auth.uid()
    or public.is_admin()
    or public.is_language_moderator(original_language_code)
  );
create policy "posts_insert_authenticated" on public.posts
  for insert with check (auth.uid() = created_by);
create policy "posts_update_owner_or_admin" on public.posts
  for update using (
    (created_by = auth.uid() and status in ('draft','pending_review','rejected'))
    or public.is_admin()
  );
create policy "posts_delete_owner_soft" on public.posts
  for delete using (false); -- 소프트 삭제만 허용(상태값/삭제일시 UPDATE), 하드 삭제는 금지

-- ── post_translations ──────────────────────────────────────────────────
create policy "post_translations_select" on public.post_translations
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          (p.status = 'published' and p.deleted_at is null)
          or p.created_by = auth.uid()
          or public.is_admin()
        )
    )
    or public.is_language_moderator(language_code)
  );
create policy "post_translations_insert" on public.post_translations
  for insert with check (
    public.is_admin()
    or public.is_language_moderator(language_code)
    or (public.owns_post(post_id) and language_code = (select original_language_code from public.posts where id = post_id))
  );
create policy "post_translations_update" on public.post_translations
  for update using (
    public.is_admin()
    or public.is_language_moderator(language_code)
    or (public.owns_post(post_id) and language_code = (select original_language_code from public.posts where id = post_id))
  );

-- ── post_status_history (조회만, 기록은 트리거가 담당) ─────────────────
create policy "post_status_history_select" on public.post_status_history
  for select using (public.owns_post(post_id) or public.is_admin());

-- ── 카테고리별 상세정보 (posts 정책을 그대로 상속) ─────────────────────
create policy "job_details_select" on public.job_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "job_details_write" on public.job_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "job_details_update" on public.job_details for update using (public.owns_post(post_id) or public.is_admin());

create policy "business_details_select" on public.business_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "business_details_write" on public.business_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "business_details_update" on public.business_details for update using (public.owns_post(post_id) or public.is_admin());

create policy "used_item_details_select" on public.used_item_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "used_item_details_write" on public.used_item_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "used_item_details_update" on public.used_item_details for update using (public.owns_post(post_id) or public.is_admin());

create policy "housing_details_select" on public.housing_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "housing_details_write" on public.housing_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "housing_details_update" on public.housing_details for update using (public.owns_post(post_id) or public.is_admin());

create policy "group_buy_details_select" on public.group_buy_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "group_buy_details_write" on public.group_buy_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "group_buy_details_update" on public.group_buy_details for update using (public.owns_post(post_id) or public.is_admin());

create policy "event_details_select" on public.event_details for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "event_details_write" on public.event_details for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "event_details_update" on public.event_details for update using (public.owns_post(post_id) or public.is_admin());

-- ── post_images ─────────────────────────────────────────────────────────
create policy "post_images_select" on public.post_images for select using (
  exists (select 1 from public.posts p where p.id = post_id and (
    (p.status = 'published' and p.deleted_at is null) or p.created_by = auth.uid() or public.is_admin()
  ))
);
create policy "post_images_write" on public.post_images for insert with check (public.owns_post(post_id) or public.is_admin());
create policy "post_images_delete" on public.post_images for delete using (public.owns_post(post_id) or public.is_admin());
create policy "post_images_update" on public.post_images for update using (public.owns_post(post_id) or public.is_admin());

-- ── post_chat_room_sources ─────────────────────────────────────────────
create policy "post_chat_room_sources_select" on public.post_chat_room_sources for select using (
  public.owns_post(post_id) or public.is_admin() or public.manages_chat_room(chat_room_id)
);
create policy "post_chat_room_sources_write" on public.post_chat_room_sources for insert with check (
  public.owns_post(post_id) or public.is_admin() or public.manages_chat_room(chat_room_id)
);

-- ── bookmarks / recent_views (본인 데이터만) ────────────────────────────
create policy "bookmarks_all_own" on public.bookmarks for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "recent_views_all_own" on public.recent_views for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ── inquiries ───────────────────────────────────────────────────────────
create policy "inquiries_select_own_or_post_owner_or_admin" on public.inquiries
  for select using (
    profile_id = auth.uid() or public.owns_post(post_id) or public.is_admin()
  );
create policy "inquiries_insert_authenticated" on public.inquiries
  for insert with check (profile_id = auth.uid());
create policy "inquiries_update_post_owner_or_admin" on public.inquiries
  for update using (public.owns_post(post_id) or public.is_admin());

-- ── reports / report_actions ────────────────────────────────────────────
create policy "reports_select_own_or_admin_or_moderator" on public.reports
  for select using (
    reporter_id = auth.uid()
    or public.is_admin()
    or (post_id is not null and exists (
      select 1 from public.posts p where p.id = post_id and public.is_language_moderator(p.original_language_code)
    ))
  );
create policy "reports_insert_authenticated" on public.reports
  for insert with check (reporter_id = auth.uid());
create policy "reports_update_admin" on public.reports
  for update using (public.is_admin());

create policy "report_actions_select_admin_or_reporter" on public.report_actions
  for select using (
    public.is_admin()
    or exists (select 1 from public.reports r where r.id = report_id and r.reporter_id = auth.uid())
  );
create policy "report_actions_insert_admin" on public.report_actions
  for insert with check (public.is_admin());

-- ── prohibited_words (언어운영자 본인 담당 언어 + 관리자) ──────────────
create policy "prohibited_words_select" on public.prohibited_words
  for select using (public.is_admin() or public.is_language_moderator(language_code));
create policy "prohibited_words_write" on public.prohibited_words
  for insert with check (public.is_admin() or public.is_language_moderator(language_code));
create policy "prohibited_words_delete" on public.prohibited_words
  for delete using (public.is_admin() or public.is_language_moderator(language_code));

-- ── products (공개 조회로 가격 노출, 관리자만 변경) ─────────────────────
create policy "products_select_public" on public.products for select using (is_active or public.is_admin());
create policy "products_write_admin" on public.products for insert with check (public.is_admin());
create policy "products_update_admin" on public.products for update using (public.is_admin());

-- ── orders / payments ───────────────────────────────────────────────────
create policy "orders_select_own_or_admin" on public.orders
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "orders_insert_own" on public.orders
  for insert with check (profile_id = auth.uid());
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

create policy "payments_select_own_or_admin" on public.payments
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid())
  );
create policy "payments_insert_own" on public.payments
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.profile_id = auth.uid())
  );
create policy "payments_update_admin" on public.payments
  for update using (public.is_admin());

-- ── distribution_channels / distribution_logs (관리자 전용) ────────────
create policy "distribution_channels_admin_only" on public.distribution_channels
  for all using (public.is_admin()) with check (public.is_admin());
create policy "distribution_logs_admin_or_moderator" on public.distribution_logs
  for select using (public.is_admin() or public.is_language_moderator(language_code));
create policy "distribution_logs_write_admin" on public.distribution_logs
  for insert with check (public.is_admin());
create policy "distribution_logs_update_admin" on public.distribution_logs
  for update using (public.is_admin());

-- ── notifications (본인 것만) ───────────────────────────────────────────
create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (profile_id = auth.uid());
create policy "notifications_insert_admin_or_system" on public.notifications
  for insert with check (public.is_admin());

-- ── admin_logs (관리자만 조회, 기록은 서버 로직에서 서비스 롤로 insert) ─
create policy "admin_logs_select_admin" on public.admin_logs
  for select using (public.is_admin());

-- ── system_settings (공개 값 조회는 전체 허용, 변경은 관리자만) ────────
create policy "system_settings_select_public" on public.system_settings
  for select using (true);
create policy "system_settings_write_admin" on public.system_settings
  for insert with check (public.is_admin());
create policy "system_settings_update_admin" on public.system_settings
  for update using (public.is_admin());
